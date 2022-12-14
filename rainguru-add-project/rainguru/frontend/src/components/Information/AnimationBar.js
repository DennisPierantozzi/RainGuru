import React, { Component } from "react";
import moment from "moment";
import MuiSlider from '@mui/material/Slider';
import { SiRainmeter } from "react-icons/si";
import { MdShutterSpeed } from "react-icons/md";
import { IoIosPause, IoIosPlay } from 'react-icons/io';
import { AiOutlineFieldTime } from "react-icons/ai";
import { TbMathMax } from "react-icons/tb";
import Communication from "./../Communication";
import Map from "./../Map/Map";
import Slider from "./Slider";
import PastDataSelector from "../TopBar/PastDataSelector";
import Statistics from "./Statistics";

/**
 * Handles everything regarding the slider bar at the bottom of the screen.
 */
export default class AnimationBar extends Component {
    // marks/timestamps used
    static marks = [];
    static fullMarks = [];

    // animation variables
    animation = false;
    animationSpeed = 700;
    playing = true;
    buttonIconSize = "70%";

    /**
     * Sets the animation in the starting state.
     * @param props contains optional properties of the slider.
     */
    constructor(props) {
        super(props);

        // state variables
        this.state = {
            pauseResume: <IoIosPause className="button-icon" size={this.buttonIconSize}/>,
            updateProp: 0,
            value: 0,
            tooltipLegend: false
        };

        // Keyboard feature
        window.addEventListener('keydown', (event) => {
            if (event.defaultPrevented) {
                return;
            }
            let code = event.code;
            // Function to handle the event
            this.handleKeyboardPress(code);
        }, false);

        // make the timestamp labels and start the animation
        AnimationBar.updateMarks();
        this.play();
    }

    /**
     * Changes the state to set up the update of the rendered timestamps.
     *
     * @param nextProps the props given down from the Information component.
     * @param prevState the last state of the component before these new props.
     */
    static getDerivedStateFromProps(nextProps, prevState) {
        // if the update prop changes send it through
        if (nextProps.updateProp !== prevState.updateProp) {
            return {updateProp : nextProps.updateProp};
        }
        else return null;
    }

    /**
     * Code to run when the component updates.
     * Updates the rendered timer intervals.
     * Updates/sets the current interval rain intensity value.
     *
     * @param prevProps the props before the component was updated.
     * @param prevState the state before the component was updated.
     */
    componentDidUpdate(prevProps, prevState) {
        //console.log(prevState);     
        // if there was a change in the update prop run this code
        if (prevState.updateProp !== this.state.updateProp) {
            // move one mark back if possible when updating on regular latest data
            // move to zero when loading new selected data
            const newValue = (this.state.updateProp > prevState.updateProp) ? Math.max(0, this.state.value - 1) :
                PastDataSelector.loadTimestamp;
            // update the state values, updateProp was updated already, that is why this method got called.
            this.setState({
                value: newValue
            });

            // perform updates and changes on other parts as if a normal move has happened
            Slider.sliderValue = newValue;
            Map.activateHeatLayer(newValue);
            if (this.playing) {
                this.pauseResume();
            }
        }

        // Setting the current interval rain intensity dynamically
        if (Slider.predictionsShowing) {
            // if location is selected, display interval and rain information
            const intervalInfoDiv = document.getElementById("intervalInfo");
            intervalInfoDiv.innerHTML = "";
            let timeString = AnimationBar.fullMarks[this.state.value];
            let intervalInfoDivNode;

            // if the precipitation amount can be represented with an integer, add .0 to it. e.g. 5.0 mm/h instead of 5 mm/h
            if(Slider.predictionsShowing[Slider.sliderValue] % 1 === 0) {
                intervalInfoDivNode = document.createTextNode("Time: " + timeString + " - " + Slider.predictionsShowing[this.state.value] + ".0 mm/h");
            } else {
                intervalInfoDivNode = document.createTextNode("Time: " + timeString + " - " + Slider.predictionsShowing[this.state.value] + " mm/h");
            }
            intervalInfoDiv.appendChild(intervalInfoDivNode);
        } else {
            // if location is not selected, only show the interval information
            const intervalInfoDiv = document.getElementById("intervalInfo");
            intervalInfoDiv.innerHTML = "Time: ";
            let timeString = AnimationBar.fullMarks[this.state.value];
            const intervalInfoDivNode = document.createTextNode(timeString);
            intervalInfoDiv.appendChild(intervalInfoDivNode);
        }
    }

    /**
     * Updates/sets which labels are visible in the slider at predetermined locations.
     */
    static updateMarks() {
        // reset the lists
        AnimationBar.marks = [];
        AnimationBar.fullMarks = [];

        // get the time for the first prediction into hour:minutes format with time zone and part of the year adjustment
        const firstTime = moment(Communication.getDataTimestamp()).format("HH:mm");
        const hoursMinutes = firstTime.split(":");
        let hours = parseInt(hoursMinutes[0]);
        let mins = parseInt(hoursMinutes[1]);

        // generate the new marks/labels
        for (let i = 0; i < 20; i++) {
            // give the splitter an extra 0 when the mins are 0 or 5 and otherwise would only be 1 digit
            const separator = (mins <= 9) ? ":0" : ":";

            // add the labels for every other mark, except 19
            const markLabel = (i % 2 === 0 || i === 19) ? "" : (hours + separator + mins);
            AnimationBar.marks.push({value: i, label: markLabel});
            AnimationBar.fullMarks.push(hours + separator + mins);

            // update the time variables for the next label
            mins += 5;
            if (mins >= 60) {
                mins %= 60;
                hours = (hours + 1) % 24;
            }
        }
    }

    /**
     * Handle the click on the keyboard to control the graph
     */
    handleKeyboardPress(keyCode){
        if(keyCode=="Space") {
            this.pauseResume();
        }
        if(keyCode=="ArrowRight") {
            this.move(true, true);
        }
        if(keyCode=="ArrowLeft") {
            this.move(false, true);
        }          
    }

    /**
     * Let the animation play automatically at the speed of the value of variable 'animationSpeed'.
     */
    play() {
        // start the interval to move every animationSpeed
        this.animation = setInterval(function() {
            this.move(true, false);
        }.bind(this), this.animationSpeed);
    }

    /**
     * Stop the animation from playing automatically.
     */
    stop() {
        // stop the interval
        clearInterval(this.animation);
        this.animation = false;
    }

    /**
     * Handles the event when you want go forward or backwards in the animation.
     * @param forward is true when you want the animation to go forwards, false when you want the animation to go backwards
     * @param button is true when you used the button to go forwards or backwards 1 step in the animation, false when the animation plays automatically.
     */
    move(forward, button) {
        // set the new value in the correct direction
        let newValue;
        if (forward) {
            newValue = (this.state.value + 1) % 20;
        } else {
            newValue = (this.state.value + 19) % 20;
        }

        // change to the new value
        this.setState({value: newValue});
        Slider.sliderValue = newValue;

        Map.activateHeatLayer(newValue);

        // if called from the buttons the animation needs to be halted, so it doesn't immediately move
        if (button && this.playing) {
            this.stop();
            this.play();
        }
    }

    /**
     * Pauses the animation when it is playing and continues playing the animation when it is paused.
     */
    pauseResume() {
        // stop or play the animation and set the icon for the button to the correct one
        if (this.playing) {
            this.playing = false;
            this.stop();
            this.setState({pauseResume: <IoIosPlay className="button-icon" size={this.buttonIconSize}/>});
        } else {
            this.playing = true;
            this.play();
            this.setState({pauseResume: <IoIosPause className="button-icon" size={this.buttonIconSize}/>});
        }
    }

    /**
     * Updates the animation speed value indicator to the current speed.
     */
    displaySpeed() {
        // calculate the speed value and display it
        const currentSpeed = 12 - (this.animationSpeed / 100);
        document.getElementById("speedValue").innerHTML = "Animation speed: " + currentSpeed;
    }

    /**
     * Renders the animation bar together with the animation buttons.
     * It renders the following:
     *  - Render the buttons to control the animation.
     *  - Below that render some information.
     *  - At the bottom render the animation bar.
     *
     * @returns the rendered animation bar together with the animation buttons.
     */
    render() {
        return (
            <div className="animationContents" data-testid="animationBarDiv">
                <div id="stats-animation" class="wrap-topAnimations">

                <div id="statistics" key="stats"><Statistics displayTooltipLegend={this.props.displayTooltipLegend}/></div>
                <div id="no-rain" class="no-data-text">no rain! <SiRainmeter /></div>

                </div>
                
                <div className="dataBar">
                    <div className="dataBarPart" id="speedValue" data-testid="speedValue"><MdShutterSpeed /> Animation speed: 5</div>
                    <div className="dataBarPart" id="intervalInfo" data-testid="intervalInfo"><AiOutlineFieldTime /> Time: </div>
                    <div className="dataBarPart" id="maxRain" data-testid="maxRain"><TbMathMax /> Max: </div>
                </div>

                <div className="graph">
                <div className="scale-container">
                    <div id="max-scale" data-testid="max-scale"></div>
                    <div id="mid-scale" data-testid="mid-scale"></div>
                    <div id="min-scale" data-testid="min-scale">0</div>
                </div>
                <div className="animationSliderDiv">
                    <hr className="middle-line"/>
                    <MuiSlider
                        id="animationSlider"
                        data-testid="animationSlider"
                        aria-label="Precipitation"
                        defaultValue={0}
                        value={this.state.value}
                        step={1}
                        marks={AnimationBar.marks}
                        track={false}
                        min={0}
                        max={19}
                        onChange={(_, newValue) => {
                            this.setState({value: newValue});
                            Slider.sliderValue = newValue;
                            Map.activateHeatLayer(newValue);
                            if (this.playing) {
                                this.stop();
                                this.play();
                            }
                        }}>
                    </MuiSlider>
                    <div className="precipitationChart" id="chartContainer">
                        <canvas id="chart"></canvas>
                    </div>
                </div>
                </div>
                
            </div>
        );
    }
}
