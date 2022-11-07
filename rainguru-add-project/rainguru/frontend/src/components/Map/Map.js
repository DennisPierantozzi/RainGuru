import React from "react";
import Popup from "react-popup";
import L from "leaflet";
import {GeoSearchControl, OpenStreetMapProvider} from "leaflet-geosearch";

import Slider from "../Information/Slider";
import Communication from "../Communication";

export default class Map {

    // static variables that contain everything for the map component
    static map;
    static heatLayers = [];
    static nextLayers = [];
    static currentLayer = new L.LayerGroup();
    static marker;
    static loadedImages = 0;
    static dataURLS = [];
    static minMapBounds = L.latLng(49.18, -4.35);
    static maxMapBounds = L.latLng(55.72, 15.18);
    static minMarkerBounds = L.latLng(50.21, 1.90);
    static maxMarkerBounds = L.latLng(54.71, 9.30);


    /**
     * Preload and cache the images
     */
    static preloadedImages() {
        // get the image urls
        const imageUrls = Communication.getImageUrls();

        // for each url preload the image so it doesn't flicker
        imageUrls.forEach((image) => {
            const newImage = new Image();
            newImage.onload = function () {
                Map.loadedImages += 1;
            }
            newImage.src = image;
            window[image] = newImage;
        });
    }

    /**
     * Generates a list of all generated precipitation images for the coming 100 minutes.
     */
    static setHeatLayers() {
        // heat layer code
        const imageUrls = Communication.getImageUrls();
        const imageBounds = [[54.71, 1.90], [50.21, 9.30]];
        this.heatLayers = [];

        // adds the regular image layers
        for (let i = 0; i < 20; i++) {
            const newUrl = imageUrls[i];
            this.heatLayers.push(L.imageOverlay(newUrl, imageBounds, {opacity: 0.4}));
        }

        // adds the image layers that are used to preload the next layer
        for (let i = 1; i < 20; i++) {
            const newUrl = imageUrls[i];
            this.nextLayers.push(L.imageOverlay(newUrl, imageBounds, {opacity: 0}));
        }
        const zeroUrl = imageUrls[0];
        this.nextLayers.push(L.imageOverlay(zeroUrl, imageBounds, {opacity: 0}));
    }

    /**
     * Shows the requested precipitation image on the map.
     * @param layerIndex the index of the requested precipitation image in the 'heatLayers' list.
     */
    static activateHeatLayer(layerIndex) {
        // remove the layers currently showing
        // then add the current layer
        // and add the next layer with opacity 0 to fix the flickering on safari and firefox
        this.currentLayer.clearLayers();
        this.currentLayer.addLayer(this.heatLayers[layerIndex]);
        this.currentLayer.addLayer(this.nextLayers[layerIndex]);
    }

    /**
     * Renders the map and handles the event of clicking on the map and putting a marker at that location.
     */
    static render() {
        // base layer code
        const baseLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
            attribution: '&copy; <a href="https://www.esri.com/en-us/home">Esri</a>'
        });

        // set up the heat layers
        Map.setHeatLayers();

        // map code
        let map = L.map("map", {
            center: new L.LatLng(52.45, 5.415),
            zoom: 7,
            minZoom: 7,
            maxBounds: L.latLngBounds(Map.minMapBounds, Map.maxMapBounds),
            maxBoundsViscosity: 0.9,
        });

        // add layers to the map and the scale
        baseLayer.addTo(map);
        this.currentLayer.addTo(map);
        L.control.scale({imperial: false}).addTo(map);

        // load the first rain image and center the map to the Netherlands
        this.activateHeatLayer(0);

        // store the map
        Map.map = map;

        // add an error message for the users current location
        map.on('locationerror', function (e) {
            Popup.alert("User denied access to their location", "Permission denied");
        });

        // add location finding handling to the map
        map.on('locationfound', function (e) {
            Map.markerHandling(e, false, true);
        });

        // add clicking to place a marker to the map
        map.on('click', function (e) {
            Map.markerHandling(e, false, false);
        });

        // add the search functionality to the map
        Map.addMapSearch();

        // When a location has been found this event will be triggered
        map.on('geosearch/showlocation', function (e) {
            Map.markerHandling(e, true, false);
        });
    }

    /**
     * Add the search functionality to the map.
     */
    static addMapSearch() {
        // Adds searching functionality to the map
        const search = new GeoSearchControl({
            provider: new OpenStreetMapProvider(),
            position: 'topleft',
            animateZoom: false,
            retainZoomLevel: true,
            marker: {
                icon: new L.Icon.Default(),
                draggable: false,
            },
            searchLabel: 'Search',
            updateMap: true,
        });
        Map.map.addControl(search);

        // Move the search bar to the top bar
        document.getElementById('locationField').appendChild(
            document.querySelector(".geosearch")
        );
    }

    // method for the map.on events
    /**
     * Handles the placement of the map markers in various situations.
     *
     * @param e the event.
     * @param search a boolean representing if the method was called for a geosearch event.
     * @param found a boolean representing if the method was called for when a location was found (otherwise it is on click).
     */
    static markerHandling(e, search, found) {
        // the location of where we want to try to place a marker
        let latitude;
        let longitude;
        if (search) {
            latitude = e.location.y;
            longitude = e.location.x;
        } else {
            latitude = e.latlng.lat;
            longitude = e.latlng.lng;
        }

        // check if the location is inside the bounds
        if (latitude > Map.maxMarkerBounds.lat || latitude < Map.minMarkerBounds.lat || longitude < Map.minMarkerBounds.lng || longitude > Map.maxMarkerBounds.lng) {
            Popup.alert("Your selected location is outside the bounds of the precipitation map", "Location out of bounds");
            if (search) {
                Map.map.setView(Map.marker !== undefined ? Map.marker.getLatLng() : L.latLng(52.45, 5.415), 8);
            }
            return;
        }

        // remove any existing markers
        if (Map.marker !== undefined) {
            Map.map.removeLayer(Map.marker);
        }

        // add the marker
        Map.marker = L.marker([latitude, longitude]).addTo(Map.map);
        // go to the new marker, this is handled differently depending on what event called the method
        if (search) {
            Map.map.setZoom(8);
        } else {
            Map.map.flyTo(L.latLng(latitude, longitude), found ? Math.max(8, Map.map.getZoom()) : Map.map.getZoom());
        }
        Slider.showPrecipitationData(latitude, longitude);
    }
}
