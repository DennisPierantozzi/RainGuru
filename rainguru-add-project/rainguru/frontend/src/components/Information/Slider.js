import { color } from "@mui/system";
import { map } from "leaflet";
import React from "react";
import Communication from "../Communication"
import AnimationBar from "./AnimationBar";

export default class Slider {

    // stores the latest predictions, slider state (0 to 19), and latitude and longitude of the selected location
    static predictionsShowing;
    static sliderValue;
    static lastLat;
    static lastLong;
    static precipitationShowing = [];

    static precipitationCompared = [];
    static visualizing = false;

    // calculate the corresponding rain value stored in the data matrix for the given latitude and longitude
    static getMatrixCoordinates(latitude, longitude) {
        const y_temp = (latitude - 50.21) / (54.71 - 50.21);
        const x_temp = (longitude - 1.90) / (9.30 - 1.90);
        const y = Math.round(y_temp * 700);
        const x = Math.round(x_temp * 700);

        const coord = {x: x, y: y};

        return coord
    }

    /**
     * Retrieves and displays the precipitation data at a specific location.
     * @param latitude the latitude of the specified location.
     * @param longitude the longitude of the specified location.
     * @param pred boolean value that indicate if the precipitation to show are predictions or observations
     */
    static async getPrecipitationData(latitude, longitude, pred) {
        if(latitude!==undefined && longitude!==undefined) {
            try {
                // update the last lat long value
                Slider.lastLat = latitude;
                Slider.lastLong = longitude;

                // calculate the corresponding rain value stored in the data matrix for the given latitude and longitude
                const coord = Slider.getMatrixCoordinates(latitude, longitude);

                // Loading data
                const currentlyShowing = document.getElementById("currently-showing");
                console.log(currentlyShowing);
                currentlyShowing.innerHTML = "Loading";

                let precipitation = await Communication.fetchPrecipitation(699 - coord["y"], coord["x"], pred);

                currentlyShowing.innerHTML = "Fatto";
                
                if(pred == -1) {
                    Slider.precipitationShowing = precipitation[0];
                    Slider.precipitationCompared = precipitation[1];
                    console.log(Slider.precipitationShowing)
                    console.log(Slider.precipitationCompared)
                }
                else {Slider.precipitationShowing = precipitation;}
                Slider.showPredictionData();
            } catch (e) {
                console.log(e);
            }
        }
    }


    static showPredictionData() {
        const precipitation = Slider.precipitationShowing;
        // find the maximum precipitation amount for the selected location
        const predictions = [];
        let maxRain = 0, colorsArray=[];
        for (let t = 0; t < 20; t++) {
            if (precipitation[t] > maxRain) {
                maxRain = precipitation[t];
            }
            predictions.push(precipitation[t]);
        }
        console.log(predictions);

        colorsArray = Slider.createColorsArray(precipitation);
        // update the static predictions variable
        Slider.predictionsShowing = predictions;
        // dynamically update the interval information and append newly created node to "intervalInfo" div
        const intervalInfoDiv = document.getElementById("intervalInfo");
        intervalInfoDiv.innerHTML = "";
        let timeString = AnimationBar.fullMarks[Slider.sliderValue];
        let intervalInfoDivNode;
        // when precipitation amount is a whole number, add .0 to it
        if (Slider.predictionsShowing[Slider.sliderValue] % 1 === 0) {
            intervalInfoDivNode = document.createTextNode(timeString + " - " + Slider.predictionsShowing[Slider.sliderValue] + ".0 mm/h");
        } else {
            intervalInfoDivNode = document.createTextNode(timeString + " - " + Slider.predictionsShowing[Slider.sliderValue] + " mm/h");
        }
        intervalInfoDiv.appendChild(intervalInfoDivNode);

        // dynamically change maximum rain amount for the given location
        const maxRainDiv = document.getElementById("maxRain");
        if (maxRain % 1 === 0) {
            maxRainDiv.innerHTML = "Max: " + maxRain + ".0 mm/h";
        } else {
            maxRainDiv.innerHTML = "Max: " + maxRain + " mm/h";
        }

        // dynamically set maximum scale value
        const maxScaleDiv = document.getElementById("max-scale");
        let maxScale = maxRain.toFixed(2);
        // when maxRain is less than 0.1, set the maxScale to be 0.1
        if (maxRain <= 0.1) {
            maxScale = 0.1;
        }
        maxScaleDiv.innerHTML = maxScale;

        // dynamically set middle scale value
        const midScaleDiv = document.getElementById("mid-scale");
        let midScaleValue;
        // when maxScale is less than 0.1, set the midScaleValue to be 0.1
        if (maxRain <= 0.1) {
            midScaleValue = 0.05;
        } else {
            midScaleValue = (maxRain / 2).toFixed(2);
        }
        midScaleDiv.innerHTML = midScaleValue;

        // call a helper method to create a precipitation chart
        Slider.makeChart(predictions, colorsArray, maxScale);
    }

    /**
     * Creates a precipitation chart (filled line chart) and append it to "chart" div.
     * @param predictions Predictions for the next 100 minutes that need to be graphed
     * @param maxScale Indication of the maximum y-value
     */
    static makeChart(predictions, colorsArray, maxScale) {
        const currentTime = new Date();
        const timeStamps = [];
        for (let i = 0; i < 20; i++) {
            timeStamps.push(i);
        }
        const chart = document.getElementById("chart").getContext("2d");
        //
        const predictionGraph = new Chart(chart, {
            type: "line",
            data: {
                labels: timeStamps,
                datasets: [{
                    fill: true,
                    data: predictions,
                    borderColor: "#1167b1",
                    borderWidth: 0.5,
                    backgroundColor: "tranparent"
                }]
            },
            options: {
                elements: {
                    point: {
                        radius: 0,
                        hitRadius: 3
                    }
                },
                maintainAspectRatio: false,
                scales: {
                    xAxes: [{
                        display: false,
                        gridLines: {
                            color: "rgba(0, 0, 0, 0)"
                        }
                    }],
                    yAxes: [{
                        display: false,
                        ticks: {
                            beginAtZero: true,
                            max: maxScale * 1.05
                        },
                        gridLines: {
                            color: "rgba(0, 0, 0, 0)",
                        },
                    }]
                },
                legend:
                    {
                        display: false
                    }
            }
        })
        Slider.createGradient(colorsArray, predictionGraph, chart);
    }

    /**
     * Dennis Upgrade
     * Creates the array with the 40 precipitation values
     * @param precipitation Array of the 20 precipitation values
     */
    static createColorsArray(precipitation) {
        console.log(precipitation);
        const arrayColors = []
        let value = 0, difference = 0;
        for (let t = 0; t < 20; t++) {
            arrayColors.push(precipitation[t]);
            if (value > maxRain) {
                maxRain = precipitation[t];
            }
            if(precipitation[t+1]>=precipitation[t]) {
                difference = precipitation[t+1]-precipitation[t];
                value = precipitation[t]+(difference/2);
                arrayColors.push(value);
            }
            else if(precipitation[t+1]<precipitation[t]){
                difference = precipitation[t]-precipitation[t+1];
                value = precipitation[t]-(difference/2);
                arrayColors.push(value);
            }
        }
        return arrayColors;
    }

    /**
     * Dennis Upgrade
     * Creates a gradient for the precipitation chart (filled line chart) and append it to "chart" div.
     * @param colorsArray predictions values
     * @param chart the Chart library
     * @param ctx canvas used to display the chart
     */
     static createGradient(colorsArray, chart, ctx) {
        let precipitationColors = [];
        console.log(colorsArray);
        for(let i in colorsArray) {
            let color = Slider.interpolateColor(colorsArray[i]);
            precipitationColors.push(color);
        }
        console.log(precipitationColors);
        let canvasGradient=ctx.createLinearGradient(chart.chartArea.left,0,chart.chartArea.right,0);
        for(let i=0.025, p=0; i<=1; i+=0.025, p++) {
            canvasGradient.addColorStop(i, precipitationColors[p]);
        }
        chart.data.datasets[0].backgroundColor = canvasGradient;
        chart.update();
     }

    /**
     * Dennis Upgrade
     * Interpolate colors for the given value
     * @param predictedValue prediction value
     */
    static interpolateColor(predictedValue) {
        const mapColors = new Map();
        mapColors.set("firstGradient", ["rgb(255,255,255)", "rgb(100,100,255)", 0.5]);
        mapColors.set("secondGradient", ["rgb(100,100,255)", "rgb(0,0,255)", 1]);
        mapColors.set("thirdGradient", ["rgb(0,0,255)", "rgb(255,0,0)", 10]);
        mapColors.set("fourthGradient", ["rgb(255,0,0)", "rgb(255,255,0)", 100]);
        let gradient = [];
        if(predictedValue<=0.5) {gradient=mapColors.get("firstGradient");}
        if(predictedValue>0.5&&predictedValue<=1) {gradient=mapColors.get("secondGradient");}
        if(predictedValue>1&&predictedValue<=10) {gradient=mapColors.get("thirdGradient");}
        if(predictedValue>10) {gradient=mapColors.get("fourthGradient");}

        let color = new Color(gradient[0]);
        let fun = color.range(gradient[1]);
        let finalColor = fun(predictedValue/gradient[2]);
        return finalColor.display();
    }

}
