import React from "react";
import Popup from "react-popup";
import Map from "./Map/Map";
import Slider from "./Information/Slider";

export default class Communication {
    static useLatestData = true;
    static observed = false;
    static dataCollected = false;
    static imageUrls = [];
    static latestTimestamp = 0;
    static requestTimestamp = [];
    static dataTimestamp = [];

    static update = true;
    static compare = false;
    static imageUrlsObsCompare = [];
    static imageUrlsPrepCompare = [];
    static dataTimestampObsCompare = [];
    static dataTimestampPrepCompare = [];


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
    static getImageUrlsObsCompare() {
        return this.imageUrlsObsCompare;
    }
    static getImageUrlsPrepCompare() {
        return this.imageUrlsPrepCompare;
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

    static getDataTimestampObsCompare() {
        return this.dataTimestampObsCompare;
    }
    static getDataTimestampPrepCompare() {
        return this.dataTimestampPrepCompare;
    }

    static getCompare() {
        return this.compare;
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
     * Set the boolean rapresenting if we show the comparison 
     */
     static setCompare(compare) {
        this.compare = compare;
    }


    /**
     * Fetches new data from the back-end.
     */
    static async fetchUrls() {
        const coord = Slider.getMatrixCoordinates(Slider.lastLat, Slider.lastLong);

        let url = "api/fetch?observed=" + this.observed + "&compare=false&x=" + (699-coord["y"]) + "&y=" + coord["x"];
        // only add timestamp if not fetching latest data
        if (!this.useLatestData) {
            console.log("requestTimeStamp "+this.requestTimestamp);
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
            if(responseJson.hasOwnProperty("precipitation")) {Slider.precipitationShowing = responseJson.precipitation;}
            
            if(responseJson.exception_active) {
                Popup.alert("Message from server:\n" + responseJson.exception_message, "Warning: Model might be using old data.");
                console.log(responseJson.exception_message);
            }
            Map.preloadedImages();
            this.dataCollected = true;
          });
    }

    /**
     * Dennis Upgrade
     * Fetches new data from the back-end to compare starting from observations choosed by the user
     */
    static async fetchUrlsToCompare() {
        let url = "api/fetch?observed=" + this.observed + "&compare=" + this.compare;
        // only add timestamp if not fetching latest data
        if (!this.useLatestData) {
            console.log("requestTimeStamp "+this.requestTimestamp);
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
            if(responseJson.exception_active_observation) {
                Popup.alert("Message from server:\n" + 
                responseJson.exception_message_observation, "Warning: Model might be using old data.");
                console.log(responseJson.exception_message_observation);
            }
            if(responseJson.urls_precipitation.length === 0) {
                Popup.alert("Message from server:\n No predictins found for the selected interval");
            }
            else {// store predictions and create images for them
                this.imageUrlsObsCompare = responseJson.urls_observation;
                this.imageUrlsPrepCompare = responseJson.urls_precipitation;
                this.dataTimestampObsCompare = responseJson.timestamp_observation;
                this.dataTimestampPrepCompare = responseJson.timestamp_precipitation;
                
                Map.preloadedImages();
                this.dataCollected = true;
            }
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
    static async fetchPrecipitation(x, y, pred) {
        let url = "api/precipitation?x=" + x + "&y=" + y;
        // only add timestamp if not fetching latest data
        if (!this.useLatestData) {
            if(this.compare) {
                let timeCompare=this.dataTimestampObsCompare.toString()+'c'+(this.dataTimestampPrepCompare-300).toString();
                url += "&compare="+this.compare+"&timestamp=" + timeCompare;
                //if(pred) {url += "&observed=false&timestamp=" + (this.dataTimestampPrepCompare-300);}
                //else {url += "&observed=true&timestamp=" + this.dataTimestampObsCompare;}
            }
            else {url += "&observed="+this.observed+"&timestamp=" + this.requestTimestamp;}
        }
        else{url += "&observed="+this.observed;}

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
                if(this.compare) {
                    let precipitation = [];
                    precipitation[0] = responseJson.precipitationObs;
                    precipitation[1] = responseJson.precipitationPred;
                    return precipitation;
                }
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