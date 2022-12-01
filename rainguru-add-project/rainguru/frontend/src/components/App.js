import React, {Component} from "react";
import {createRoot} from "react-dom/client";
import LoadingScreen from "./LoadingScreen";
import Communication from "./Communication";
import TopBar from "./TopBar/TopBar";
import PastDataSelector from "./TopBar/PastDataSelector";
import Map from "./Map/Map";
import Information from "./Information/Information";
import AnimationBar from "./Information/AnimationBar";
import Slider from "./Information/Slider";
import PopupContainer from "./PopupContainer/PopupContainer";
import SideBar from "./TopBar/SideBar";
import InfoMenu from "./TopBar/InfoMenu";


export default class App extends Component {
    /**
     * Sets the app in the starting state.
     * @param props contains optional properties of the app.
     */
    constructor(props) {
        super(props);

        // state variables
        this.state = {
            loadingData: false,
            animationBarUpdateProp: 0,
            pastDataSelectorUpdateProp: 0,
            sidebar: false,
            compare: false,
            sidebarInfo: false,
        }

        // bind this to update the state when this function is called from the past data selector
        this.displayData = this.displayData.bind(this);
        this.compareData = this.compareData.bind(this);
        this.displayComparedData = this.displayComparedData.bind(this);
        this.setShowSidebar = this.setShowSidebar.bind(this);
        this.setShowCompare = this.setShowCompare.bind(this);
        this.setShowSidebarInfo = this.setShowSidebarInfo.bind(this);
    }

    static renderSetup() {
        const waitForSetupDOM = setInterval(function() {
            const popupContainerDiv = document.getElementById("popupContainer");
            if (!!popupContainerDiv) {
                // render the popup container in case we need to display loading errors
                const popupContainerRoot = createRoot(popupContainerDiv);
                popupContainerRoot.render(<PopupContainer/>);

                // retrieve the data from the server
                Communication.checkNewData();
                Communication.fetchUrls();


                // wait for the map to fetch the data
                const waitForDataLoad = setInterval(function () {
                    if (Communication.getDataCollected() && Map.loadedImages === 20) {
                        // end this loop render the components
                        clearInterval(waitForDataLoad);
                        const appDiv = document.getElementById("app");
                        const appRoot = createRoot(appDiv);
                        appRoot.render(<App/>);
                        clearInterval(LoadingScreen.loadingIntervalId);
                    }
                }, 50);

                clearInterval(waitForSetupDOM);
            }
        }, 50);
    }

    setShowSidebar() {
        this.setState({
            sidebarInfo: false,
            sidebar: !this.state.sidebar            
        })
    }

    setShowSidebarInfo() {
        this.setState({ 
            sidebar: false,
            sidebarInfo: !this.state.sidebarInfo
        })
    }

    setShowCompare(compare) {
        this.setState({compare: compare});
    }


    /**
     * Renders the components that the screen is divided into and set the setup to load the map into.
     */
    render() {
        return [
            <div id="map" key="map"></div>,
            <div id="information" key="information"><Information animationBarUpdateProp={this.state.animationBarUpdateProp}/></div>,
            <div id="topBar" key="topBar"><TopBar
                                     setShowSidebar = {this.setShowSidebar} displayComparedData={this.displayComparedData}
                                     loadingData={this.state.loadingData} showCompare={this.state.compare} displayData={this.displayData} 
                                     setShowSidebarInfo={this.setShowSidebarInfo}/></div>,
            <div id="menu" key="menuOverlay"  className={this.state.sidebar ? "menuOverlay" : "hideElement"}>
                <SideBar pastDataSelectorUpdateProp={this.state.pastDataSelectorUpdateProp}
                    loadingData={this.state.loadingData} displayData={this.displayData} 
                    compareData={this.compareData} 
                    displayComparedData={this.displayComparedData} setShowCompare={this.setShowCompare} setShowSidebar={this.setShowSidebar}/>
            </div>, 
            <div id="menu-info" key="menuOverlay-info" className={this.state.sidebarInfo ? "menuOverlay" : "hideElement"}>
                <InfoMenu />
            </div>
        ];
    }

    /**
     * Renders all the parts of the application.
     */
    componentDidMount() {
        // render the map
        // this is done last since it calls on other parts which could cause problems
        // another reason that it is done after the initial render is since it renders itself inside the map div
        Map.render();

        // prevent keyboard from resizing the application
        const viewport = document.querySelector("meta[name=viewport]");
        viewport.setAttribute("content", viewport.content + ", height=" + window.innerHeight);

        try {
            // Reset this on orientation change to prevent resizing issues
            window.screen.orientation.onchange = function(e) {
                const viewport = document.querySelector("meta[name=viewport]");

                let maxSize = Math.max(window.innerWidth, window.innerHeight);
                let minSize = Math.min(window.innerWidth, window.innerHeight);

                // Set the height according to the orientation
                if (e.target.type === "landscape-primary" || e.target.type === "landscape-secondary") {
                    viewport.setAttribute("content", viewport.content + ", height=" + minSize);
                } else {
                    viewport.setAttribute("content", viewport.content + ", height=" + maxSize);
                }
            }
        } catch (error) {
            try {
                // Reset this on orientation change on ios devices
                window.onorientationchange = function(e) {
                    const viewport = document.querySelector("meta[name=viewport]");

                    let maxSize = Math.max(window.innerWidth, window.innerHeight);
                    let minSize = Math.min(window.innerWidth, window.innerHeight);

                    // Set the height according to the orientation
                    if (Math.abs(window.orientation) === 90) {
                        viewport.setAttribute("content", viewport.content + ", height=" + minSize);
                    } else {
                        viewport.setAttribute("content", viewport.content + ", height=" + maxSize);
                    }
                    
                }
            } catch (error) {
                console.error(error);
            }
        }

        // start the auto updating
        this.runAutoUpdate();
    }

    /**
     * Checks for new data and updates all parts of the application that need it when there is new data.
     */
    runAutoUpdate() {
        // check for new available data every 60 seconds
        setInterval(function () {
            Communication.checkNewData()
                .then(dataUpdated => {
                    // if there is new data try to update
                    if (dataUpdated) {
                        // update the time intervals of the past data menu
                        PastDataSelector.updateTimes();
                        displayData(-1, true, false, [], "Latest data");
                        this.setState({pastDataSelectorUpdateProp: this.state.pastDataSelectorUpdateProp + 1});

                        // update the rain layers and animation bar timestamps when using the latest data
                        if (Communication.getUseLatestData()) {
                            this.displayData(1, true, false, []);
                        }
                    }
                });
        }.bind(this), 60000);
    }

    /**
     * Changes the map rain layers and the animation bar timestamps to new data that is requested.
     *
     * @param propChange the change that the animation bar prop should update which indicates how it should update.
     * @param latest a boolean value representing if the latest data should be loaded.
     * @param observed a boolean value representing if observed or predicted data should be loaded.
     * @param timestamp the timestamp from which to load the data in case it isn't the latest.
     */
    displayData(propChange, latest, observed, timestamp, timeString) {
        // only run this code if it isn't already loading data already
        if (!this.state.loadingData) {
            this.setState({loadingData: true, compare: false});
            document.getElementById("currently-showing").innerHTML = timeString;
            // set the communication variables used in the requests
            Communication.setCompare(false);
            Communication.setUseLatestData(latest);
            Communication.setObserved(observed);
            Communication.setRequestTimestamp(timestamp);

            // reset the loaded images count and then fetch the new images
            Map.loadedImages = 0;

            // Set loading data visible
            const loader = document.getElementById("loader");
            document.getElementById("loadingString").innerHTML = "";
            loader.style.display = "flex";

            Communication.fetchUrls()
                .then(() => {
                    // wait for all new images to be preloaded and then render them and update the other parts
                    const waitForNewImages = setInterval(function () {
                        if (Map.loadedImages === 20) {

                            // hide loading data visible
                            loader.style.display = "none";
                            
                            // set the rain images
                            Map.setHeatLayers();
                            
                            Slider.getPrecipitationData(Slider.lastLat, Slider.lastLong);

                            // update the animation bar timestamps and past data time intervals
                            AnimationBar.updateMarks();
                            this.setState({animationBarUpdateProp: this.state.animationBarUpdateProp + propChange});

                            // clear the interval and set the loading to be done
                            this.setState({loadingData: false});
                            clearInterval(waitForNewImages);
                        }
                    }.bind(this), 100);
                });
        }
    }


/**
     * Changes the map rain layers and the animation bar timestamps to new data that is requested
     * Prepare to compare predictions and observations
     *
     * @param propChange the change that the animation bar prop should update which indicates how it should update.
     * @param latest a boolean value representing if the latest data should be loaded.
     * @param observed a boolean value representing if observed or predicted data should be loaded.
     * @param timestamp the timestamp from which to load the data in case it isn't the latest.
     * @param compare boolean value that indicate the start of the compare feature
     */
    compareData(propChange, latest, observed, timestamp, timeString) {
        // only run this code if it isn't already loading data already
        if (!this.state.loadingData) {
            this.setState({loadingData: true});
            // set the communication variables used in the requests
            Communication.setUseLatestData(latest);
            Communication.setObserved(observed);
            Communication.setRequestTimestamp(timestamp);
            Communication.setCompare(true);

            // reset the loaded images count and then fetch the new images
            Map.loadedImages = 0;
            Communication.fetchUrlsToCompare()
                .then(() => {
                    // wait for all new images to be preloaded and then render them and update the other parts
                    const waitForNewImages = setInterval(function () {
                        if (Map.loadedImages === 20) {
                            // display switch
                            this.setState({compare: true});

                            // set the timeString
                            const currentlyShowing = document.getElementById("currently-showing");
                            currentlyShowing.innerHTML = timeString;

                            // set the rain images
                            Map.setHeatLayers();

                            // update the animation bar rain chart and location information
                            if (Slider.lastLat !== undefined) {
                                Slider.getPrecipitationData(Slider.lastLat, Slider.lastLong);
                            }

                            // update the animation bar timestamps and past data time intervals
                            AnimationBar.updateMarks();
                            this.setState({animationBarUpdateProp: this.state.animationBarUpdateProp + propChange});

                            // clear the interval and set the loading to be done
                            this.setState({loadingData: false});
                            clearInterval(waitForNewImages);
                        }
                        else {
                            // error, no intervals for predictions
                            this.setState({loadingData: false});
                            this.setState({compare: false});
                        }
                    }.bind(this), 100);
                });
        }
    }


    /**
     * Changes the map rain layers based on the compare switch
     *
     * @param pred boolean value that indicate the layers to display. 
     *        False for observation, True for predictions
     */
    displayComparedData(pred) {
        // only run this code if it isn't already loading data already
        if (!this.state.loadingData) {
            this.setState({loadingData: true});
            // set the communication variables used in the requests
            Map.loadedImages = 0;
            Map.preloadedImages(pred);
            const waitForNewImages = setInterval(function () {
                if (Map.loadedImages === 20) {
                    // set the rain images
                    Map.setHeatLayers();

                    //graph precipitation switch
                    //Slider.switchPrediction();
                    //Slider.colorLegend(pred);
                    if (Slider.lastLat !== undefined) {
                       Slider.showPredictionData(pred);
                    }

                    // update the animation bar timestamps and past data time intervals
                    AnimationBar.updateMarks();
                    this.setState({animationBarUpdateProp: this.state.animationBarUpdateProp -1});

                    // clear the interval and set the loading to be done
                    this.setState({loadingData: false});
                    clearInterval(waitForNewImages);
                }
            }.bind(this), 100);
        }
    }

}
