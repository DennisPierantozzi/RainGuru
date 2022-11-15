import React, {Component} from "react";
import moment from "moment";
import { MenuItem, Select } from "@mui/material";
import { FormGroup, FormControlLabel, Switch } from '@mui/material';
import Communication from "../Communication";

export default class PastDataSelector extends Component {
    // static variables with the available times
    static times = [];
    static predictionTimes = [];
    static observationIntervals = [];
    static observedTimestamps = [];
    static loadTimestamp = 0;

    /**
     * Sets the past data selector in the starting state.
     * @param props contains optional properties of the past data selector menu.
     */
    constructor(props) {
        super(props);

        // state variables
        this.state = {
            loadingData: this.props.loadingData,
            updateProp: 0,
            predictedValue: "",
            observedValue: "",
            observedTimestamp: "",
        }

        // set the available times
        PastDataSelector.updateTimes();
    }


    /**
     * Changes the state to set up the update of the rendered time intervals.
     *
     * @param nextProps the props given down from the TopBar component.
     * @param prevState the last state of the component before these new props.
     */
    static getDerivedStateFromProps(nextProps, prevState) {
        // add the props that changed to an object and return that object
        let returnProps = {}
        if (nextProps.loadingData !== prevState.loadingData) {
            returnProps.loadingData = nextProps.loadingData;
        }
        if (nextProps.updateProp !== prevState.updateProp) {
            returnProps.updateProp = nextProps.updateProp;
        }
        return returnProps;
    }

    /**
     * Code to run when the component updates.
     * Updates the rendered timer intervals.
     *
     * @param prevProps the props before the component was updated.
     * @param prevState the state before the component was updated.
     */
    componentDidUpdate(prevProps, prevState) {
        // if there was a change in the update prop run this code
        if (prevState.updateProp !== this.state.updateProp) {
            let newPredictedValue;
            let newObservedValue;

            // change the values of the select menu's to keep the same interval if possible or go to None otherwise
            if (this.state.predictedValue === "" || this.state.predictedValue === (PastDataSelector.times.length - 1)) {
                newPredictedValue = "";
            } else {
                newPredictedValue = this.state.predictedValue + 1;
            }
            if (this.state.observedValue === "" || this.state.observedValue === (PastDataSelector.times.length - 1)) {
                newObservedValue = "";
                PastDataSelector.observedTimestamps = [];
            } else {
                newObservedValue = this.state.observedValue + 1;
            }

            // update the state values, updateProp was updated already, that is why this method got called.
            this.setState({
                predictedValue: newPredictedValue,
                observedValue: newObservedValue
            });
        }
    }

    /**
     * Finds all the times/time intervals for the past data and stores them in the variables.
     */
    static async updateTimes() {
        // get the information about which timestamps are available and which aren't
        const dataAvailable = await Communication.fetchDataAvailability();
        const predicted = dataAvailable.predictedTimes;
        const observed = dataAvailable.observedTimes;
        const lastTime = Math.max(predicted[predicted.length - 1], observed[observed.length - 1]);
        const fiveMinSmall = 300;
        const fiveMinBig = 300000;
        let observationsAvailable = 0;

        // reset the times/time intervals variables
        PastDataSelector.times = [];
        PastDataSelector.predictionTimes = [];
        PastDataSelector.observationIntervals = [];

        // 36 = 3 hours * 12 5-min intervals per hour, >= 19 is since from that point there is enough time for a full interval
        for (let i = 0, time = lastTime; i < 50; i++, time -= fiveMinSmall) {
            // add the time to a list to reference later for fetching the required data
            PastDataSelector.times.push(time);
            // get the time intervals with hours:minutes time formats
            const timeBig = time * 1000;
            const predictionTime = moment(new Date(timeBig)).format("HH:mm");
            const observationInterval = moment(new Date(timeBig)).format("HH:mm") + " - " +
                moment(new Date(timeBig + (19 * fiveMinBig))).format("HH:mm");


            // add the menu items with the time intervals
            if (predicted.includes(time)) {
                PastDataSelector.predictionTimes.push(<MenuItem value={i} key={i}>{predictionTime}</MenuItem>);
            } else {
                PastDataSelector.predictionTimes.push(<MenuItem disabled value={i} key={i}>{predictionTime}</MenuItem>);
            }

            // since observed is time intervals they start later since they need to gather a full interval
            if (observed.includes(time)) {
                observationsAvailable++;
            } else {
                observationsAvailable = 0;
            }
            if (i >= 19) {
                if (observationsAvailable >= 20) {
                    PastDataSelector.observationIntervals.push(<MenuItem value={i} key={i}>{observationInterval}</MenuItem>);
                } else {
                    PastDataSelector.observationIntervals.push(<MenuItem disabled value={i} key={i}>{observationInterval}</MenuItem>);
                }
            }
        }

        
    }

    /**
     * Updates the observation timestamp selector timestamps when the observation interval changes.
     *
     * @param newValue a boolean value representing if the latest data should be loaded.
     */
    updateObservationTimestamps(newValue) {
        // reset the timestamps
        PastDataSelector.observedTimestamps = [];

        if (newValue !== "") {
            // set the new timestamps in the selected observation interval
            for (let i = 0; i < 20; i++) {
                const time = moment(PastDataSelector.times[newValue - i] * 1000).format("HH:mm");
                PastDataSelector.observedTimestamps.push(<MenuItem value={i} key={i}>{time}</MenuItem>);
            }
        }

    }

    /**
     * Calls App.js to load the new data with the correct parameters.
     *
     * @param latest a boolean value representing if the latest data should be loaded.
     * @param observed a boolean value representing if observed or predicted data should be loaded.
     */
    loadData(latest, observed, compare) {
        // variables for what needs to change, the values are set depending on how this method was called
        const currentlyShowing = document.getElementById("currently-showing");
        let validCall = false;
        let time = [];
        let timeString = "";
        let timeCompare = "";

        if (latest) {
            // set it to a valid call and set the timestring
            validCall = true;
            timeString = "Latest data";

            // update the accessible observation timestamp
            PastDataSelector.loadTimestamp = 0;
        } else {
            if (observed && this.state.observedValue !== "") {
                // set it to a valid call and calculate/set the timestring
                validCall = true;
                time = PastDataSelector.times[this.state.observedValue];
                timeString = "Observations from: " + moment(new Date(time * 1000)).format("HH:mm") + " - " +
                moment(new Date((time + 5700) * 1000)).format("HH:mm");

                // update the accessible observation timestamp
                PastDataSelector.loadTimestamp = this.state.observedTimestamp;
            } else if (!observed && this.state.predictedValue !== "") {
                // set it to a valid call and calculate/set the timestring
                validCall = true;
                time = PastDataSelector.times[this.state.predictedValue];
                timeString = "Predictions made at: " + moment(new Date(time * 1000)).format("HH:mm");
                // update the accessible observation timestamp
                PastDataSelector.loadTimestamp = 0;
            }
            if(compare && observed) {
                if(this.state.observedValue !== "") {
                    time = PastDataSelector.times[this.state.observedValue];
                    timeString = "Observations from: " + moment(new Date(time * 1000)).format("HH:mm");
                    timeCompare=PastDataSelector.times[this.state.observedValue].toString()+'c'+(PastDataSelector.times[this.state.observedValue]-300).toString();
                }
            }
        }

        // load new data when a valid call was made that is also different from what is currently already loaded
        if (validCall && timeString !== currentlyShowing.innerHTML) {
            if(compare){     
                this.props.compareData(-1, latest, observed, timeCompare, compare);
            }
            // call app to display the new data
            else{this.props.displayData(-1, latest, observed, time);}
            // display what data should be loaded now
            currentlyShowing.innerHTML = timeString;
        }
    }


    /**
     * Renders the content of the pastDataSelector div at the top of the screen with a menu to choose past data to show.
     * It renders the following:
     *  - What is currently showing.
     *  - An option to load the latest data.
     *  - An option to load previous predictions.
     *  - An option to load previous observations, with an option to choose what interval it loads on.
     *
     * @returns the rendered content of the pastDataSelector div.
     */
    render() {
        return (<div className="pastDataSelectorContents" data-testid="pastDataSelector">
            <div className="past-data-menu-part display-data-width">
                <div className="latest-data-chooser">
                    <p className="latest-data-text">Display the latest data:</p>
                    <button className={"time-interval-loader" + (this.state.loadingData ? " disabled-time-interval-loader" : "")}
                            disabled={this.state.loadingData} id="latest-data-loader" data-testid="latest-loader" onClick={() => {
                        this.props.setShowCompare(false);
                        this.loadData(true, false, false);
                    }}>Load</button>
                </div>
            </div>
            <div className="past-data-menu-part">
                <p>Predictions made at:</p>
                <div className="time-interval-chooser">
                    <Select className="time-interval-drop-down times-color" id="predicted-drop-down" data-testid="predicted-drop-down"
                            variant="standard" defaultValue="" value={this.state.predictedValue}
                            MenuProps={{ PaperProps: { sx: { maxHeight: 'calc(7 * var(--sidebar-item-height))' } } }}
                            onChange={(e) => this.setState({predictedValue: e.target.value})}>
                        <MenuItem value=""><em>None</em></MenuItem>
                        {PastDataSelector.predictionTimes}
                    </Select>
                    <button className={"time-interval-loader" + (this.state.loadingData ? " disabled-time-interval-loader" : "")}
                            disabled={this.state.loadingData} data-testid="predicted-loader" onClick={() => {
                            this.props.setShowCompare(false);
                        this.loadData(false, false, false);
                    }}>Load</button>
                </div>
            </div>
            <div className="past-data-menu-part">
                <p>Observations from:</p>
                <div className="time-interval-chooser">
                    <Select className="time-interval-drop-down times-color" id="observed-drop-down" data-testid="observed-drop-down"
                            variant="standard" defaultValue="" value={this.state.observedValue}
                            MenuProps={{ PaperProps: { sx: { maxHeight: 'calc(7 * var(--sidebar-item-height))' } } }}
                            onChange={(e) => {
                                this.setState({observedValue: e.target.value, observedTimestamp: 9});
                                this.updateObservationTimestamps(e.target.value);
                            }}>
                        <MenuItem value=""><em>None</em></MenuItem>
                        {PastDataSelector.observationIntervals}
                    </Select>
                    <button className={"time-interval-loader" + (this.state.loadingData ? " disabled-time-interval-loader" : "")}
                            disabled={this.state.loadingData} data-testid="observed-loader" onClick={() => {
                                this.props.setShowCompare(false);
                        this.loadData(false, true, false);
                    }}>Load</button>
                    <button className={"time-interval-loader" + (this.state.loadingData ? " disabled-time-interval-loader" : "")}
                            disabled={this.state.loadingData} data-testid="observed-loader" onClick={() => {
                                this.props.setShowCompare(true);
                        this.loadData(false, true, true);
                    }}>Compare</button>
                </div>
                <div className={(this.state.observedValue !== "") ? "timestamp-observation-chooser" : "timestamp-observation-chooser-disabled"}>
                    <p className="load-on">Load on:</p>
                    <Select className="timestamp-drop-down times-color" id="timestamp-observed-drop-down" data-testid="timestamp-observed-drop-down"
                            variant="standard" defaultValue={9} value={this.state.observedTimestamp}
                            MenuProps={{ PaperProps: { sx: { maxHeight: 'calc(7 * var(--sidebar-item-height))' } } }}
                            onChange={(e) => this.setState({observedTimestamp: e.target.value})}>
                        {PastDataSelector.observedTimestamps}
                    </Select>
                </div>
            </div>
        </div>);
    }
}