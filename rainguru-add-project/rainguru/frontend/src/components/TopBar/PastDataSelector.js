import React, {Component} from "react";
import moment from "moment";
import { MenuItem } from "@mui/material";
import { SlGraph } from "react-icons/sl";
import { TbChartInfographic } from "react-icons/tb";
import { MdAutoGraph } from "react-icons/md";
import { IoTodayOutline } from "react-icons/io5";
import { WiSunrise, WiNightClear, WiHorizon } from "react-icons/wi";
import Communication from "../Communication";


export default class PastDataSelector extends Component {
    // static variables with the available times
    static times = [];
    static predictionTimes = [];
    static observationIntervals = [];
    static observedTimestamps = [];
    static loadTimestamp = 0;

    // here I can also use a tree, but since the features are only three I used maps.
    static predictionsIntervals = 
    {
        today: {morning: [], 
                afternoon:[], 
                night:[]
            }, 
        yesterday: {
            morning: [], 
            afternoon:[], 
            night:[]
            }
    };
    static observationsIntervals = {today: {morning: [], afternoon:[], night:[]}, yesterday: {morning: [], afternoon:[], night:[]}};
    static compareIntervals = {today: {morning: [], afternoon:[], night:[]}, yesterday: {morning: [], afternoon:[], night:[]}};
    //root
    static Intervals = {
        predictions: PastDataSelector.predictionsIntervals, 
        observations: PastDataSelector.observationsIntervals, 
        compare:PastDataSelector.compareIntervals
    };
      
    /**
     * Sets the past data selector in the starting state.
     * @param props contains optional properties of the past data selector menu.
     */
    constructor(props) {
        super(props);
        this.selectFeature= this.selectFeature.bind(this);
        this.selectDay= this.selectDay.bind(this);
        this.selectPartOfDay= this.selectPartOfDay.bind(this);
        this.selectIntervals= this.selectIntervals.bind(this);
        this.handleClickInterval= this.handleClickInterval.bind(this);

        // state variables
        this.state = {
            loadingData: this.props.loadingData,
            updateProp: 0,
            predictedValue: "",
            observedValue: "",
            observedTimestamp: "",
            compare: false,
            observed: false,
            selected: new Array(3), // 0 0 0
            selectedIntervals: [],
            previousItem: "",
            daySection: false,
            partOfDaySection: false,
            intervalsSection: false
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


    static addTimes(time, store) {
        let startMorning = moment('06:00:00', 'HH:mm'); // morning - 06:00 -> 12:00
        let startAfternoon = moment('13:00:00', 'HH:mm'); // afternoon - 13:00 -> 20:00
        let endAfternoon = moment('24:00:00', 'HH:mm');
        let startNight = moment('00:00:00', 'HH:mm'); // night - 00:00 -> 05:00

        let timeToStore = moment(new Date(time*1000), "HH:mm").format("HH:mm");
        console.log(timeToStore);

        if (timeToStore>startAfternoon._i && timeToStore<endAfternoon._i) {
            if(!store.afternoon.includes(time)) {store.afternoon.push(time);}
        }
        else if(timeToStore>startNight._i && timeToStore<startMorning._i) {
            if(!store.night.includes(time)) {store.night.push(time);}
        }
        else if(timeToStore>startMorning._i && timeToStore<startAfternoon._i) {
            if(!store.morning.includes(time)) {
                store.morning.push(time);}
        }
    }

    
    static checkCompareIntervals(compareTimestampsToday, compareTimestampsYesterday) {
        let arrayPredictionsToday = PastDataSelector.predictionsIntervals.today.morning.concat(PastDataSelector.predictionsIntervals.today.afternoon, PastDataSelector.predictionsIntervals.today.night);
        let arrayPredictionsYesterday = PastDataSelector.predictionsIntervals.yesterday.morning.concat(PastDataSelector.predictionsIntervals.yesterday.afternoon, PastDataSelector.predictionsIntervals.yesterday.night);

        for(let i=0; i<compareTimestampsToday.length; i++) {
            let compareTime = moment(moment(new Date(compareTimestampsToday[i]*1000)).subtract(5, 'minutes').format()).unix();
            if(arrayPredictionsToday.includes(compareTime)){
                PastDataSelector.addTimes(compareTimestampsToday[i], PastDataSelector.compareIntervals.today);
            }
        }

        for(let i=0; i<compareTimestampsYesterday.length; i++) {
            let compareTime = moment(moment(new Date(compareTimestampsYesterday[i]*1000)).subtract(5, 'minutes').format()).unix();
            if(arrayPredictionsYesterday.includes(compareTime)){
                PastDataSelector.addTimes(compareTimestampsYesterday[i], PastDataSelector.compareIntervals.yesterday);
            }
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
        console.log(lastTime);
        const fiveMinSmall = 300;
        let observationsAvailable = 0;

        // reset the times/time intervals variables
        PastDataSelector.times = [];
        PastDataSelector.predictionTimes = [];
        PastDataSelector.observationIntervals = [];

        let compareTimestampsToday = [];
        let compareTimestampsYesterday = [];
        let today = false;
        // 36 = 3 hours * 12 5-min intervals per hour, >= 19 is since from that point there is enough time for a full interval
        
        /*if(moment(new Date()).diff(new Date(lastTime*1000), 'days') > 0){
            // day is changed
        
            PastDataSelector.predictionsIntervals.yesterday.morning = PastDataSelector.predictionsIntervals.today.morning;
            PastDataSelector.predictionsIntervals.yesterday.afternoon = PastDataSelector.predictionsIntervals.today.afternoon;
            PastDataSelector.predictionsIntervals.yesterday.night = PastDataSelector.predictionsIntervals.today.night; 
            PastDataSelector.predictionsIntervals.today.morning = [];
            PastDataSelector.predictionsIntervals.today.afternoon = [];
            PastDataSelector.predictionsIntervals.today.night = [];

            PastDataSelector.observationsIntervals.yesterday.morning = PastDataSelector.observationsIntervals.today.morning;
            PastDataSelector.observationsIntervals.yesterday.afternoon = PastDataSelector.observationsIntervals.today.afternoon;
            PastDataSelector.observationsIntervals.yesterday.night = PastDataSelector.observationsIntervals.today.night; 
            PastDataSelector.observationsIntervals.today.morning = [];
            PastDataSelector.observationsIntervals.today.afternoon = [];
            PastDataSelector.observationsIntervals.today.night = [];
        };*/
        console.log(lastTime);
        // 288 steps for 24hours 5-min intervals
        for (let i = 0, time = lastTime; i < 288; i++, time -= fiveMinSmall) {
            // add the time to a list to reference later for fetching the required data
            PastDataSelector.times.push(time);
            const timeBig = time*1000;
            if(moment(new Date(timeBig)).format("DD/MM/YYYY")==moment(new Date()).format("DD/MM/YYYY")) {
                today = true;
            }
            else {today = false;}
        
            if (predicted.includes(time)) {
                if(today) {
                    console.log("entrato con today");
                    PastDataSelector.addTimes(time, PastDataSelector.predictionsIntervals.today);}
                else {
                    PastDataSelector.addTimes(time, PastDataSelector.predictionsIntervals.yesterday);}
            } 

            // since observed is time intervals they start later since they need to gather a full interval
            if (observed.includes(time)) {
                observationsAvailable++;
            } else {
                observationsAvailable = 0;
            }
            if (i >= 19) {
                if (observationsAvailable >= 20) {
                    if(today) {
                        PastDataSelector.addTimes(time, PastDataSelector.observationsIntervals.today);
                        compareTimestampsToday.push(time);
                    }
                    else {
                        PastDataSelector.addTimes(time, PastDataSelector.observationsIntervals.yesterday);
                        compareTimestampsYesterday.push(time);
                    }
                } 
            }
        }
        PastDataSelector.checkCompareIntervals(compareTimestampsToday, compareTimestampsYesterday);
        console.log(PastDataSelector.Intervals);
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
    loadData(item) {
        // variables for what needs to change, the values are set depending on how this method was called
        const currentlyShowing = document.getElementById("currently-showing");
        let validCall = false;
        let time = [];
        let timeString = "";
        let timeCompare = "";

        if (this.state.observed && item !== "") {
                // set it to a valid call and calculate/set the timestring
                validCall = true;
                timeString = "Observations from: " + moment(new Date(item * 1000)).format("HH:mm") + " - " +
                moment(new Date((time + 5700) * 1000)).format("HH:mm");
                // update the accessible observation timestamp
                PastDataSelector.loadTimestamp = 0;
            } else if (!this.state.observed && item !== "") {
                // set it to a valid call and calculate/set the timestring
                validCall = true;
                timeString = "Predictions made at: " + moment(new Date(item * 1000)).format("HH:mm");
                // update the accessible observation timestamp
                PastDataSelector.loadTimestamp = 0;
            }
            if(this.state.compare) {
                if(item !== "") {
                    timeString = "Compare from: " + moment(new Date(item * 1000)).format("HH:mm");
                    timeCompare=item.toString()+'c'+(item-300).toString();
                }
            }

        // load new data when a valid call was made that is also different from what is currently already loaded
        if (validCall && timeString !== currentlyShowing.innerHTML) {
            if(this.state.compare){     
                this.props.compareData(-1, false, this.state.observed, timeCompare, timeString);
            }
            // call app to display the new data
            else{
                this.props.displayData(-1, false, this.state.observed, item, timeString);
            }
            // display what data should be loaded now
            
        }
    }



    selectFeature(feature) {
        //toggle class feature clicked
        if(this.state.selected[0] != undefined) {document.getElementById(this.state.selected[0]).classList.remove("previous-data-clicked");}
        if(this.state.previousItem != "") {document.getElementById(this.state.previousItem).classList.remove("previous-data-clicked");}
        document.getElementById(feature).classList.toggle("previous-data-clicked");

        let arr = this.state.selected;
        arr[0] = feature;
        // set observed and compare states
        if(feature == 'observations') {this.setState({observed: true, compare: false});}
        if(feature == 'compare') {this.setState({compare: true, observed: false});}
        if(feature == 'predictions') {this.setState({compare: false, observed: false});}
        this.setState({selected: arr, daySection: true, previousItem: ""});

        this.selectIntervals(arr);
    }
    selectDay(day) {
        //toggle class day clicked
        if(this.state.selected[1] != undefined) {document.getElementById(this.state.selected[1]).classList.remove("previous-data-clicked");}
        if(this.state.previousItem != "") {document.getElementById(this.state.previousItem).classList.remove("previous-data-clicked");}
        document.getElementById(day).classList.toggle("previous-data-clicked")
        
        let arr = this.state.selected;
        arr[1] = day;
        this.setState({selected: arr, partOfDaySection: true, previousItem: ""});

        this.selectIntervals(arr);
    }
    selectPartOfDay(partOfDay) {
        //toggle class partOfDay clicked
        if(this.state.selected[2] != undefined) {document.getElementById(this.state.selected[2]).classList.remove("previous-data-clicked");}
        if(this.state.previousItem != "") {document.getElementById(this.state.previousItem).classList.remove("previous-data-clicked");}
        document.getElementById(partOfDay).classList.toggle("previous-data-clicked");

        let arr = this.state.selected;
        arr[2] = partOfDay;
        this.setState({selected: arr, intervalsSection:true, previousItem: ""});

        this.selectIntervals(arr);
    }
    selectIntervals(arr) {
        // display intervals after the complete selection 
        if(arr.includes(undefined)) {return}
        else {
            let store = PastDataSelector.Intervals;
            for(let i=0; i<arr.length; i++){
            store = store[arr[i]];
            //console.log(store);
            }
            this.setState({selectedIntervals: store});
        }
    }
    handleClickInterval(item) {
        if(this.state.previousItem != "") 
            {document.getElementById(this.state.previousItem).classList.remove("previous-data-clicked");} 
        document.getElementById(item).classList.toggle("previous-data-clicked");
        this.setState({previousItem: item});
        this.props.setShowSidebar(); 
        this.loadData(item);
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
                <div className="description-data-section"> Tap to select data to display </div>
                <div id="past-data-feature" className="sections-previous-data">
                    <div id="observations" className="box-previous-data" onClick={() => this.selectFeature('observations')}>
                        <span> <SlGraph />  Observations </span>
                    </div>
                    <div id="predictions" className="box-previous-data" onClick={() => this.selectFeature('predictions')}>
                        <span> <TbChartInfographic />  Predictions </span>
                    </div>
                    <div id="compare" className="box-previous-data" onClick={() => this.selectFeature('compare')}>
                        <span> <MdAutoGraph />  Compare </span>
                    </div>
                </div>
                <div id="past-data-day" className={this.state.daySection ? "sections-previous-data" : "hideElement"}>
                    <div id="today" className="box-previous-data" onClick={() => this.selectDay('today')}>
                        <span> <IoTodayOutline />  Today </span>
                    </div>
                    <div id="yesterday" className="box-previous-data" onClick={() => this.selectDay('yesterday')}>
                        <span> <IoTodayOutline />  Yesterday </span>
                    </div>
                </div>
                <div id="past-data-partOfDay" className={this.state.partOfDaySection ? "sections-previous-data" : "hideElement"}>
                    <div id="morning" className="box-previous-data" onClick={() => this.selectPartOfDay('morning')}>
                        <span> <WiSunrise />  Morning </span>
                    </div>
                    <div id="afternoon" className="box-previous-data" onClick={() => this.selectPartOfDay('afternoon')}>
                        <span> <WiHorizon />  Afternoon </span>
                    </div>
                    <div id="night" className="box-previous-data" onClick={() => this.selectPartOfDay('night')}>
                        <span> <WiNightClear />  Night </span>
                    </div>
                </div>
                <div id="past-data-intervals" className={this.state.intervalsSection ? "sections-previous-intervals" : "hideElement"}>
                    <ul className="list-intervals">
                    {this.state.selectedIntervals.map((item,i) => <li id={item} className="single-interval" onClick={() => {
                        this.handleClickInterval(item);
                    }
                    }>{moment(new Date(item * 1000)).format("HH:mm")}</li>)}
                    </ul>
                </div>
            </div>);
    }
}