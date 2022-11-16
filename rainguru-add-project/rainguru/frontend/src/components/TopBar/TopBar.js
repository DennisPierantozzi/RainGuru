import React, {useState} from 'react';
import {BiFilter} from 'react-icons/bi';
import {ImLocation} from 'react-icons/im';
import { FormGroup, FormControlLabel, Switch } from '@mui/material';
import Map from "../Map/Map";

export default function TopBar({setShowSidebar, displayComparedData, loadingData, showCompare}) {

    /**
     * displays precipitation information over user's current location and also leave a marker at that location.
     */
    const showCurrentLocation = () => {
        Map.map.locate();
    }

    /**
     * displays precipitation information at TU Delft and also marks the location.
     */
    const showTUDelftLocation = () => {
        const latlngPoint = new L.LatLng(52.0022,4.3736);
        Map.map.fireEvent('click',{latlng:latlngPoint});
    }

    const[compareDisplay, setCompareDisplay] = useState(false);
    const[compareLabel, setCompareLabel] = useState("Obs");

    /**
     * handle click on compare switch.
     * Change the values to observation or predictions and show them
     *
     * @returns the images requested for the comparison
     */
    const handleCompare = (e) => {
        displayComparedData(e.target.checked);
        setCompareDisplay(e.target.checked);
        if(e.target.checked) {setCompareLabel("Prec")}
        else {setCompareLabel("Obs")}
    }


    /**
     * Renders the content of the TopBar div at the top of the screen. This also contains sidebar.
     * @returns the rendered content of the topbar div.
     */
    return (
        <div className="topBarContents" data-testid="topBar-container">

            <div className="PastData" id="past-data-explanation">
                <div className={showCompare ? "SwitchCompare" : "hideElement"} id="compareField">
                        <FormGroup>
                            <FormControlLabel control={<Switch size="small" checked={compareDisplay}
                            onChange={(e) => handleCompare(e)}/>} label={compareLabel} />
                        </FormGroup>
                </div>
                <span id="currently-showing" data-testid="currently-showing">Latest data</span>
            </div>

            <div className="Sidebar" data-testid="sidebar-menu">
                <img id="img-menu" className="ratioImage" src="../../../static/images/1x1.png"/>
                <BiFilter className="Sidebar-icon" onClick={() => setShowSidebar()} size="90%"/>
            </div>
            <div className="Location">
                <img className="ratioImage" src="../../../static/images/1x1.png"/>
                <ImLocation className="Location-icon" data-testid="user-location" onClick={showCurrentLocation} size="60%"/>
            </div>
            <div className="TUDelft-logo">
                {loadingData}
                <img className="ratioImage" src="../../../static/images/1x1.png"/>
                <img src="../../../static/images/TUDELFT.png" alt="TU Delft logo"
                     className="TUDelft-logo-icon" data-testid="tudelft-location" onClick={showTUDelftLocation}></img>
            </div>
            <div className="Searchbar" id="locationField"></div>
        </div>
    )
}
