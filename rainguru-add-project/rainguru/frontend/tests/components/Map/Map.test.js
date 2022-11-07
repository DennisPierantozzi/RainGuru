import React from "react";
import {render, screen} from "@testing-library/react";
import L from "leaflet";
import Popup from "react-popup";
import renderer from "react-test-renderer";
import "@testing-library/jest-dom/extend-expect";
import Map from "../../../src/components/Map/Map";
import Communication from "../../../src/components/Communication";
import Slider from "../../../src/components/Information/Slider";

const imageUrlsUsed = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9",
        "10", "11", "12", "13", "14", "15", "16", "17", "18", "19"]

beforeEach(() => {
    // set up communication with fake image urls
    Communication.imageUrls = imageUrlsUsed;

    // mock the search functionality since it gives problems when testing
    Map.addMapSearch = jest.fn();
});
afterEach(() => {
    jest.clearAllMocks();
});

// the function coverage for Map.js is quite low, this is since the map events call a method for their code
// this method call is hard to test since the event is quite inaccessible, this costs a lot of function calls
// the rest of the missing coverage is since the testing environment can't load the geosearch part of the map
describe("Map tests", () => {
    it("without search functionality matches snapshot", () => {
        // render the map without the search functionality and check it with a snapshot
        render(<div id="app" data-testid="app">
            <div id="map"></div>
            <div id="locationField"></div>
            </div>);
        Map.render();
        const state = renderer.create(screen.getByTestId("app").innerHTML).toJSON();
        expect(state).toMatchSnapshot();
    });

    it("generates image layers correctly", () => {
        // state before the method is called
        Map.heatLayers = [];
        Map.nextLayers = [];
        expect(Map.heatLayers).toStrictEqual([]);
        expect(Map.nextLayers).toStrictEqual([]);

        // generate the result list
        let heatLayersResult = [];
        let nextLayersResult = [];
        const imageBoundsTest = [[54.71, 1.90], [50.21, 9.30]];
        for (let i = 0; i < 20; i++) {
            heatLayersResult.push(L.imageOverlay(imageUrlsUsed[i], imageBoundsTest, {opacity: 0.4}));
            if (i !== 0) {
                nextLayersResult.push(L.imageOverlay(imageUrlsUsed[i], imageBoundsTest, {opacity: 0}));
            }
        }
        nextLayersResult.push(L.imageOverlay(imageUrlsUsed[0], imageBoundsTest, {opacity: 0}));

        // call the method and check the made lists
        Map.setHeatLayers();
        expect(Map.heatLayers).toStrictEqual(heatLayersResult);
        expect(Map.nextLayers).toStrictEqual(nextLayersResult);
    });

    it("set the active heat layer", () => {
        // state before the method is called
        Map.heatLayers = [];
        Map.nextLayers = [];
        Map.currentLayer = new L.LayerGroup();
        expect(Map.heatLayers).toStrictEqual([]);
        expect(Map.nextLayers).toStrictEqual([]);
        expect(Map.currentLayer).toStrictEqual(new L.LayerGroup());

        // set the layers that need to be used, these are tested in a different test
        Map.setHeatLayers();

        // generate the shown layer to check the result
        let shownLayer1 = new L.LayerGroup();
        shownLayer1.addLayer(Map.heatLayers[6]);
        shownLayer1.addLayer(Map.nextLayers[6]);
        let shownLayer2 = new L.LayerGroup();
        shownLayer2.addLayer(Map.heatLayers[17]);
        shownLayer2.addLayer(Map.nextLayers[17]);

        // call the method and check the loaded layers
        Map.activateHeatLayer(6);
        expect(Map.currentLayer).toStrictEqual(shownLayer1);

        // call the method and check the loaded layers while there are other layers loaded
        Map.activateHeatLayer(17);
        expect(Map.currentLayer).toStrictEqual(shownLayer2);
    });

    describe("map.on event methods tests", () => {
        describe("location out of bounds", () => {
            it("latitude greater than max", () => {
                // render the map, this is tested in other tests
                render(<div id="app" data-testid="app">
                    <div id="map"></div>
                    <div id="locationField"></div>
                </div>);
                Map.render();

                // create mocks and spies
                const alertMethod = jest.fn();
                Popup.alert = alertMethod;
                const showPrecipitationMethod = jest.fn();
                Slider.showPrecipitationData = showPrecipitationMethod;
                const spy1 = jest.spyOn(Map.map, "setView");
                const spy2 = jest.spyOn(Map.map, "removeLayer");
                const spy3 = jest.spyOn(Map.map, "setZoom");
                const spy4 = jest.spyOn(Map.map, "flyTo");

                // call the method and check if the alert was given correctly
                Map.markerHandling({latlng: {lat: 55, lng: 5.6}}, false, false);
                expect(alertMethod).toBeCalledTimes(1);
                expect(alertMethod).toBeCalledWith("Your selected location is outside the bounds of the precipitation map", "Location out of bounds");
                expect(showPrecipitationMethod).toBeCalledTimes(0);
                expect(spy1).toBeCalledTimes(0);
                expect(spy2).toBeCalledTimes(0);
                expect(spy3).toBeCalledTimes(0);
                expect(spy4).toBeCalledTimes(0);
            });

            it("latitude lesser than max", () => {
                // render the map, this is tested in other tests
                render(<div id="app" data-testid="app">
                    <div id="map"></div>
                    <div id="locationField"></div>
                </div>);
                Map.render();

                // create mocks and spies
                const alertMethod = jest.fn();
                Popup.alert = alertMethod;
                const showPrecipitationMethod = jest.fn();
                Slider.showPrecipitationData = showPrecipitationMethod;
                const spy1 = jest.spyOn(Map.map, "setView");
                const spy2 = jest.spyOn(Map.map, "removeLayer");
                const spy3 = jest.spyOn(Map.map, "setZoom");
                const spy4 = jest.spyOn(Map.map, "flyTo");

                // call the method and check if the alert was given correctly
                Map.markerHandling({latlng: {lat: 50, lng: 5.6}}, false, false);
                expect(alertMethod).toBeCalledTimes(1);
                expect(alertMethod).toBeCalledWith("Your selected location is outside the bounds of the precipitation map", "Location out of bounds");
                expect(showPrecipitationMethod).toBeCalledTimes(0);
                expect(spy1).toBeCalledTimes(0);
                expect(spy2).toBeCalledTimes(0);
                expect(spy3).toBeCalledTimes(0);
                expect(spy4).toBeCalledTimes(0);
            });

            it("longitude lesser than max", () => {
                // render the map, this is tested in other tests
                render(<div id="app" data-testid="app">
                    <div id="map"></div>
                    <div id="locationField"></div>
                </div>);
                Map.render();

                // create mocks and spies
                const alertMethod = jest.fn();
                Popup.alert = alertMethod;
                const showPrecipitationMethod = jest.fn();
                Slider.showPrecipitationData = showPrecipitationMethod;
                const spy1 = jest.spyOn(Map.map, "setView");
                const spy2 = jest.spyOn(Map.map, "removeLayer");
                const spy3 = jest.spyOn(Map.map, "setZoom");
                const spy4 = jest.spyOn(Map.map, "flyTo");

                // call the method and check if the alert was given correctly
                Map.markerHandling({latlng: {lat: 52.46, lng: 1}}, false, false);
                expect(alertMethod).toBeCalledTimes(1);
                expect(alertMethod).toBeCalledWith("Your selected location is outside the bounds of the precipitation map", "Location out of bounds");
                expect(showPrecipitationMethod).toBeCalledTimes(0);
                expect(spy1).toBeCalledTimes(0);
                expect(spy2).toBeCalledTimes(0);
                expect(spy3).toBeCalledTimes(0);
                expect(spy4).toBeCalledTimes(0);
            });

            it("longitude greater than max", () => {
                // render the map, this is tested in other tests
                render(<div id="app" data-testid="app">
                    <div id="map"></div>
                    <div id="locationField"></div>
                </div>);
                Map.render();

                // create mocks and spies
                const alertMethod = jest.fn();
                Popup.alert = alertMethod;
                const showPrecipitationMethod = jest.fn();
                Slider.showPrecipitationData = showPrecipitationMethod;
                const spy1 = jest.spyOn(Map.map, "setView");
                const spy2 = jest.spyOn(Map.map, "removeLayer");
                const spy3 = jest.spyOn(Map.map, "setZoom");
                const spy4 = jest.spyOn(Map.map, "flyTo");

                // call the method and check if the alert was given correctly
                Map.markerHandling({latlng: {lat: 52.46, lng: 10}}, false, false);
                expect(alertMethod).toBeCalledTimes(1);
                expect(alertMethod).toBeCalledWith("Your selected location is outside the bounds of the precipitation map", "Location out of bounds");
                expect(showPrecipitationMethod).toBeCalledTimes(0);
                expect(spy1).toBeCalledTimes(0);
                expect(spy2).toBeCalledTimes(0);
                expect(spy3).toBeCalledTimes(0);
                expect(spy4).toBeCalledTimes(0);
            });

            it("out of bounds of search, requiring fly to back when no marker was already present", () => {
                // render the map, this is tested in other tests
                render(<div id="app" data-testid="app">
                    <div id="map"></div>
                    <div id="locationField"></div>
                </div>);
                Map.render();

                // create mocks and spies
                const alertMethod = jest.fn();
                Popup.alert = alertMethod;
                const showPrecipitationMethod = jest.fn();
                Slider.showPrecipitationData = showPrecipitationMethod;
                const spy1 = jest.spyOn(Map.map, "setView");
                const spy2 = jest.spyOn(Map.map, "removeLayer");
                const spy3 = jest.spyOn(Map.map, "setZoom");
                const spy4 = jest.spyOn(Map.map, "flyTo");

                // call the method and check if the alert was given correctly, no marker was present already
                Map.markerHandling({location: {y: 55, x: 5.6}}, true, false);
                expect(alertMethod).toBeCalledTimes(1);
                expect(alertMethod).toBeCalledWith("Your selected location is outside the bounds of the precipitation map", "Location out of bounds");
                expect(showPrecipitationMethod).toBeCalledTimes(0);
                expect(spy1).toBeCalledTimes(1);
                expect(spy1).toBeCalledWith(L.latLng(52.45, 5.415), 8);
                expect(spy2).toBeCalledTimes(0);
                expect(spy3).toBeCalledTimes(0);
                expect(spy4).toBeCalledTimes(0);
            });

            it("out of bounds of search, requiring fly to back when a marker was already present", () => {
                // render the map, this is tested in other tests
                render(<div id="app" data-testid="app">
                    <div id="map"></div>
                    <div id="locationField"></div>
                </div>);
                Map.render();

                // set up the marker to already be present on the map
                Map.marker = L.marker([52, 6]).addTo(Map.map);

                // create mocks and spies
                const alertMethod = jest.fn();
                Popup.alert = alertMethod;
                const showPrecipitationMethod = jest.fn();
                Slider.showPrecipitationData = showPrecipitationMethod;
                const spy1 = jest.spyOn(Map.map, "setView");
                const spy2 = jest.spyOn(Map.map, "removeLayer");
                const spy3 = jest.spyOn(Map.map, "setZoom");
                const spy4 = jest.spyOn(Map.map, "flyTo");

                // call the method and check if the alert was given correctly, a marker was present already
                Map.markerHandling({location: {y: 55, x: 5.6}}, true, false);
                expect(alertMethod).toBeCalledTimes(1);
                expect(alertMethod).toBeCalledWith("Your selected location is outside the bounds of the precipitation map", "Location out of bounds");
                expect(showPrecipitationMethod).toBeCalledTimes(0);
                expect(spy1).toBeCalledTimes(1);
                expect(spy1).toBeCalledWith(L.latLng(52, 6), 8);
                expect(spy2).toBeCalledTimes(0);
                expect(spy3).toBeCalledTimes(0);
                expect(spy4).toBeCalledTimes(0);
            });
        });

        describe("location in bounds", () => {
            it("place marker in bounds when no marker was already present, event was called with search", () => {
                // render the map, this is tested in other tests
                render(<div id="app" data-testid="app">
                    <div id="map"></div>
                    <div id="locationField"></div>
                </div>);
                Map.render();

                // clear any possibly available marker and set a present marker
                const setupMarker = L.marker([52.1, 6.1]);
                Map.marker = setupMarker.addTo(Map.map);

                // create mocks and spies
                const alertMethod = jest.fn();
                Popup.alert = alertMethod;
                const showPrecipitationMethod = jest.fn();
                Slider.showPrecipitationData = showPrecipitationMethod;
                const spy1 = jest.spyOn(Map.map, "setView");
                const spy2 = jest.spyOn(Map.map, "removeLayer");
                const spy3 = jest.spyOn(Map.map, "setZoom");
                const spy4 = jest.spyOn(Map.map, "flyTo");

                // call the method and check the methods are called correctly
                Map.markerHandling({location: {y: 53, x: 6.4}}, true, false);
                expect(alertMethod).toBeCalledTimes(0);
                expect(showPrecipitationMethod).toBeCalledTimes(1);
                expect(spy1).toBeCalledTimes(1); // setView is called once when setZoom is called
                expect(spy2).toBeCalledTimes(1);
                expect(spy2).toBeCalledWith(setupMarker);
                expect(spy3).toBeCalledTimes(1);
                expect(spy3).toBeCalledWith(8);
                expect(spy4).toBeCalledTimes(0);
            });

            it("place marker in bounds when a marker was already present, event was called with search", () => {
                // render the map, this is tested in other tests
                render(<div id="app" data-testid="app">
                    <div id="map"></div>
                    <div id="locationField"></div>
                </div>);
                Map.render();

                // clear any possibly available marker
                Map.marker = undefined;

                // create mocks and spies
                const alertMethod = jest.fn();
                Popup.alert = alertMethod;
                const showPrecipitationMethod = jest.fn();
                Slider.showPrecipitationData = showPrecipitationMethod;
                const spy1 = jest.spyOn(Map.map, "setView");
                const spy2 = jest.spyOn(Map.map, "removeLayer");
                const spy3 = jest.spyOn(Map.map, "setZoom");
                const spy4 = jest.spyOn(Map.map, "flyTo");

                // call the method and check the methods are called correctly
                Map.markerHandling({location: {y: 53, x: 6.4}}, true, false);
                expect(alertMethod).toBeCalledTimes(0);
                expect(showPrecipitationMethod).toBeCalledTimes(1);
                expect(spy1).toBeCalledTimes(1); // setView is called once when setZoom is called
                expect(spy2).toBeCalledTimes(0);
                expect(spy3).toBeCalledTimes(1);
                expect(spy3).toBeCalledWith(8);
                expect(spy4).toBeCalledTimes(0);
            });

            it("place marker in bounds when no marker was already present, event was called with found and uses min zoom", () => {
                // render the map, this is tested in other tests
                render(<div id="app" data-testid="app">
                    <div id="map"></div>
                    <div id="locationField"></div>
                </div>);
                Map.render();

                // clear any possibly available marker
                Map.marker = undefined;
                // set the zoom of the map to that the flyTo method is called correctly
                Map.map.setZoom(7);
                expect(Map.map.getZoom()).toBe(7);

                // create mocks and spies
                const alertMethod = jest.fn();
                Popup.alert = alertMethod;
                const showPrecipitationMethod = jest.fn();
                Slider.showPrecipitationData = showPrecipitationMethod;
                const spy1 = jest.spyOn(Map.map, "setView");
                const spy2 = jest.spyOn(Map.map, "removeLayer");
                const spy3 = jest.spyOn(Map.map, "setZoom");
                const spy4 = jest.spyOn(Map.map, "flyTo");

                // call the method and check the methods are called correctly
                Map.markerHandling({latlng: {lat: 53, lng: 6.4}}, false, true);
                expect(alertMethod).toBeCalledTimes(0);
                expect(showPrecipitationMethod).toBeCalledTimes(1);
                expect(spy1).toBeCalledTimes(1); // setView is called once when flyTo is called
                expect(spy2).toBeCalledTimes(0);
                expect(spy3).toBeCalledTimes(0);
                expect(spy4).toBeCalledTimes(1);
                expect(spy4).toBeCalledWith(L.latLng(53, 6.4), 8);
            });

            it("place marker in bounds when no marker was already present, event was called with found and uses map zoom", () => {
                // render the map, this is tested in other tests
                render(<div id="app" data-testid="app">
                    <div id="map"></div>
                    <div id="locationField"></div>
                </div>);
                Map.render();

                // clear any possibly available marker
                Map.marker = undefined;
                // set the zoom of the map to that the flyTo method is called correctly
                Map.map.setZoom(12);
                expect(Map.map.getZoom()).toBe(12);

                // create mocks and spies
                const alertMethod = jest.fn();
                Popup.alert = alertMethod;
                const showPrecipitationMethod = jest.fn();
                Slider.showPrecipitationData = showPrecipitationMethod;
                const spy1 = jest.spyOn(Map.map, "setView");
                const spy2 = jest.spyOn(Map.map, "removeLayer");
                const spy3 = jest.spyOn(Map.map, "setZoom");
                const spy4 = jest.spyOn(Map.map, "flyTo");

                // call the method and check the methods are called correctly
                Map.markerHandling({latlng: {lat: 53, lng: 6.4}}, false, true);
                expect(alertMethod).toBeCalledTimes(0);
                expect(showPrecipitationMethod).toBeCalledTimes(1);
                expect(spy1).toBeCalledTimes(1); // setView is called once when flyTo is called
                expect(spy2).toBeCalledTimes(0);
                expect(spy3).toBeCalledTimes(0);
                expect(spy4).toBeCalledTimes(1);
                expect(spy4).toBeCalledWith(L.latLng(53, 6.4), 12);
            });

            it("place marker in bounds when no marker was already present, event was called with click", () => {
                // render the map, this is tested in other tests
                render(<div id="app" data-testid="app">
                    <div id="map"></div>
                    <div id="locationField"></div>
                </div>);
                Map.render();

                // clear any possibly available marker
                Map.marker = undefined;
                // set the zoom of the map to that the flyTo method is called correctly
                Map.map.setZoom(7);
                expect(Map.map.getZoom()).toBe(7);

                // create mocks and spies
                const alertMethod = jest.fn();
                Popup.alert = alertMethod;
                const showPrecipitationMethod = jest.fn();
                Slider.showPrecipitationData = showPrecipitationMethod;
                const spy1 = jest.spyOn(Map.map, "setView");
                const spy2 = jest.spyOn(Map.map, "removeLayer");
                const spy3 = jest.spyOn(Map.map, "setZoom");
                const spy4 = jest.spyOn(Map.map, "flyTo");

                // call the method and check the methods are called correctly
                Map.markerHandling({latlng: {lat: 53, lng: 6.4}}, false, false);
                expect(alertMethod).toBeCalledTimes(0);
                expect(showPrecipitationMethod).toBeCalledTimes(1);
                expect(spy1).toBeCalledTimes(1); // setView is called once when flyTo is called
                expect(spy2).toBeCalledTimes(0);
                expect(spy3).toBeCalledTimes(0);
                expect(spy4).toBeCalledTimes(1);
                expect(spy4).toBeCalledWith(L.latLng(53, 6.4), 7);
            });
        });
    });
});
