import React from "react";
import Popup from "react-popup";
import Map from "./Map/Map";

export default class Communication {
    static useLatestData = true;
    static observed = false;
    static dataCollected = false;
    static imageUrls = [];
    static latestTimestamp = 0;
    static requestTimestamp = [];
    static dataTimestamp = [];

    // getters
    /**
     * Get the boolean representing if we use the latest data.
     */
    static getUseLatestData() {
        return this.useLatestData;
    }

    /**
     * Get the boolean representing if we show observed or predicted data.
     */
    static getObserved() {
        return this.observed;
    }

    /**
     * Get the boolean representing if all the data has been loaded.
     */
    static getDataCollected() {
        return this.dataCollected;
    }

    /**
     * Get the urls for the images with the predicted precipitation.
     */
    static getImageUrls() {
        return this.imageUrls;
    }

    /**
     * Get the timestamp of the first prediction of the latest data.
     */
    static getLatestTimestamp() {
        return this.latestTimestamp;
    }

    /**
     * Get the timestamp that is used when making requests.
     */
    static getRequestTimestamp() {
        return this.requestTimestamp;
    }

    /**
     * Get the timestamp of the first prediction of the data in use.
     */
    static getDataTimestamp() {
        return this.dataTimestamp;
    }

    // setters
    /**
     * Set the boolean representing to if we use the latest data.
     */
    static setUseLatestData(latest) {
        this.useLatestData = latest;
    }

    /**
     * Set the boolean representing if we show observed or predicted data.
     */
    static setObserved(observed) {
        this.observed = observed;
    }

    /**
     * Set the timestamp that the requests will use
     */
    static setRequestTimestamp(timestamp) {
        this.requestTimestamp = timestamp;
    }


    /**
     * Fetches new data from the back-end.
     */
    static async fetchUrls() {
        let url = "api/fetch?observed=" + this.observed;
        // only add timestamp if not fetching latest data
        if (!this.useLatestData) {
            url += "&timestamp=" + this.requestTimestamp;
        }
        // make request to retrieve predictions
        await fetch(url)
          .then(response => {
            if (response.status > 400) {
              throw new Error();
            }
            return response.json();
          })
          .then(responseJson => {
            // store predictions and create images for them
            this.imageUrls = responseJson.urls;
            this.dataTimestamp = new Date(responseJson.timestamp * 1000);
            if(responseJson.exception_active) {
                Popup.alert("Message from server:\n" + responseJson.exception_message, "Warning: Model might be using old data.");
                console.log(responseJson.exception_message);
            }
            Map.preloadedImages();
            this.dataCollected = true;
          });
    }

    /**
     * Fetches the timestamp of the first prediction from the latest data.
     *
     * @returns {Promise<boolean>} representing if there is new data available.
     */
    static async checkNewData() {
        let dataUpdated = false;
        // make a request for the latest data first prediction timestamp
        await fetch("api/check")
            .then(response => {
                if (response.status > 400) {
                  throw new Error();
                }
                return response.json();
            })
            .then(responseJson => {
                // check if there is new data via the timestamp received
                const newTimestamp = responseJson.timestamp;
                if (newTimestamp !== this.latestTimestamp) {
                    this.latestTimestamp = newTimestamp;
                    dataUpdated = true;
                }
            });
        return dataUpdated;
    }

    /**
     * Fetches the data about a selected location for a selected 100 minutes.
     *
     * @param x the x coordinate of the 480x480 images
     * @param y the y coordinate of the 480x480 images
     * @returns {Promise<any>} the precipitation of the location for a selected 100 minutes.
     */
    static async fetchPrecipitation(x, y) {
        let url = "api/precipitation?x=" + x + "&y=" + y + "&observed=" + this.observed;
        // only add timestamp if not fetching latest data
        if (!this.useLatestData) {
            url += "&timestamp=" + this.requestTimestamp;
        }

        // make a request for the precipitation information of the give location
        return await fetch(url)
            .then(response => {
                if (response.status > 400) {
                    throw new Error();
                }
                return response.json();
            })
            .then(responseJson => {
                // return the fetched precipitation
                return responseJson.precipitation;
            })
    }

    /**
     * Fetch the times of what data is all available
     *
     * @returns {Promise<{available: *, predictedTimes: *, observedTimes: *}>} the availability of data times
     */
    static async fetchDataAvailability() {
        // make a request to get the availability times
        return await fetch("api/available")
            .then(response => {
                if (response.status > 400) {
                    throw new Error()
                }
                return response.json();
            })
            .then(responseJson => {
                // return a boolean representing if data is being stored and the available data times
                return {
                    available: responseJson.store_data,
                    predictedTimes: responseJson.predictions_stored,
                    observedTimes: responseJson.observations_stored
                };
            })
    }
}