import React from "react";
import Communication from "../Communication"
import AnimationBar from "./AnimationBar";

export default class Slider {

    // stores the latest predictions, slider state (0 to 19), and latitude and longitude of the selected location
    static predictions;
    static sliderValue;
    static lastLat;
    static lastLong;

    /**
     * Retrieves and displays the precipitation data at a specific location.
     * @param latitude the latitude of the specified location.
     * @param longitude the longitude of the specified location.
     */
    static async showPrecipitationData(latitude, longitude) {
        try {
            // update the last lat long value
            Slider.lastLat = latitude;
            Slider.lastLong = longitude;

            // calculate the corresponding rain value stored in the data matrix for the given latitude and longitude
            const y_temp = (latitude - 50.21) / (54.71 - 50.21);
            const x_temp = (longitude - 1.90) / (9.30 - 1.90);
            const y = Math.round(y_temp * 700);
            const x = Math.round(x_temp * 700);
            const precipitation = await Communication.fetchPrecipitation(699 - y, x);

            // find the maximum precipitation amount for the selected location
            const predictions = [];
            let maxRain = 0;
            for (let t = 0; t < 20; t++) {
                if (precipitation[t] > maxRain) {
                    maxRain = precipitation[t];
                }
                predictions.push(precipitation[t]);
            }

            // update the static predictions variable
            Slider.predictions = predictions;

            // dynamically update the interval information and append newly created node to "intervalInfo" div
            const intervalInfoDiv = document.getElementById("intervalInfo");
            intervalInfoDiv.innerHTML = "";
            let timeString = AnimationBar.fullMarks[Slider.sliderValue];
            let intervalInfoDivNode;
            // when precipitation amount is a whole number, add .0 to it
            if (Slider.predictions[Slider.sliderValue] % 1 === 0) {
                intervalInfoDivNode = document.createTextNode(timeString + " - " + Slider.predictions[Slider.sliderValue] + ".0 mm/h");
            } else {
                intervalInfoDivNode = document.createTextNode(timeString + " - " + Slider.predictions[Slider.sliderValue] + " mm/h");
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
            Slider.makeChart(predictions, maxScale);
        } catch (e) {
            console.log(e);
        }
    }

    /**
     * Creates a precipitation chart (filled line chart) and append it to "chart" div.
     * @param predictions Predictions for the next 100 minutes that need to be graphed
     * @param maxScale Indication of the maximum y-value
     */
    static makeChart(predictions, maxScale) {
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
                        radius: 3,
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
        
        Slider.createGradient(predictions, predictionGraph, chart);
        //const predictionGraph = new Chart(chart, options);
    }
    /**
     * Dennis Upgrade
     * Creates a gradient for the precipitation chart (filled line chart) and append it to "chart" div.
     * @param predictions Predictions for the next 100 minutes that need to be graphed
     */
     static createGradient(prediction, chart, ctx) {
        console.log(chart.chartArea);
        console.log(chart.scales);
        
        let precipitationColors = [];
        for(let i in prediction) {
            let color = Slider.findColor(prediction[i]);
            precipitationColors.push(color);
        }
        console.log(prediction);
        console.log(precipitationColors);

        let canvasGradient=ctx.createLinearGradient(chart.chartArea.left,0,chart.chartArea.right,0);
        for(let i=0, p=0; i<=1; i+=0.05, p++) {
            canvasGradient.addColorStop(i, precipitationColors[p]);
        }
        chart.data.datasets[0].backgroundColor = canvasGradient;
        chart.update();
     }

    static findColor(predictedValue) {
        var gradient = [
            [
                0,
                [255,255,255]
            ],
            [
                28,
                [0,0,255]
            ],
            [
                72,
                [255,0,0]
            ],
            [
                100,
                [255,255,0]
            ]
        ];
        //get the two closest colors
        let firstColor, secondColor;
        if(predictedValue<1){
            firstColor = gradient[[0]][1];
            secondColor = gradient[[1]][1];
        }
        else if(predictedValue>1 && predictedValue<10) {
            firstColor = gradient[[1]][1];
            secondColor = gradient[[2]][1];
        }
        else if(predictedValue>10 && predictedValue<100) {
            firstColor = gradient[[2]][1];
            secondColor = gradient[[3]][1];
        }

        //console.log("predictedValue"+predictedValue);
        //console.log("firstColor"+firstColor);
        //console.log("secondColor"+secondColor);

        let sliderWidth = 500;
        var firstcolor_x = sliderWidth*(gradient[[0]][0]/100);
        var secondcolor_x = sliderWidth*(gradient[[1]][0]/100)-firstcolor_x;
        var slider_x = sliderWidth*(predictedValue/100)-firstcolor_x;
      
        var ratio = slider_x/secondcolor_x;

        var p = ratio;
        var w = p * 2 - 1;
        var w1 = (w/1+1) / 2;
        var w2 = 1 - w1;
        var rgb = [Math.round(secondColor[0] * w1 + firstColor[0] * w2),
        Math.round(secondColor[1] * w1 + firstColor[1] * w2),
        Math.round(secondColor[2] * w1 + firstColor[2] * w2)];

        return Slider.createColorString(rgb);

    }

    /**
     * Dennis Upgrade
     * Create the color string rgba(n,n,n,n) for the given array color.
     * @param color: array of the values for the color
     */
    static createColorString(color){
        let colorString = "";
            for(let i in color) {
                //console.log(color[i]);
               if(i==2) {
                colorString = colorString+color[i]+")";
                break;
                }
                if(i==0) {
                    colorString = colorString+"rgba(";
                }
                colorString = colorString+color[i]+", ";
            }
            return colorString;
    }
}
