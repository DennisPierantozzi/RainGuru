import React, {useState} from 'react';
import {ImLocation} from 'react-icons/im';
import {BsInfoLg} from 'react-icons/Bs';
import { FormGroup, FormControlLabel, Switch } from '@mui/material';
import { IoIosArrowForward } from "react-icons/io";
import Map from "../Map/Map";

export default function TopBar({setShowSidebar, displayComparedData, showCompare, displayData, setShowSidebarInfo}) {

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
    const[menuOnClick, setmenuOnClick] = useState(true);

    /**
     * handle click on compare switch.
     * Change the values to observation or predictions and show them
     *
     * @returns the images requested for the comparison
     */
    const handleCompare = (e) => {
        e.preventDefault();
        displayComparedData(e.target.checked);
        setCompareDisplay(e.target.checked);
        if(e.target.checked) {setCompareLabel("Pred")}
        else {setCompareLabel("Obs")}
    }


    const displayMenu = () => {
        setmenuOnClick(!menuOnClick)
        if(menuOnClick) {
            document.getElementById("IconTopBar").style.transform = "rotate(-180deg)";
            document.getElementById("TopBarContents").style.width = "22em";
            document.getElementById("TopBarContents").style.pointerEvents = "auto";
        }
        else {
            document.getElementById("IconTopBar").style.transform = "rotate(-360deg)";
            document.getElementById("TopBarContents").style.width = "0em";
            document.getElementById("TopBarContents").style.pointerEvents = "none";
        }
    }

    /**
     * Renders the content of the TopBar div at the top of the screen. This also contains sidebar.
     * @returns the rendered content of the topbar div.
     */
    return (
        <div className="topBar-container" data-testid="topBar-container">
            <div className="PastData" id="past-data-explanation" onClick={() => displayMenu()}>
                <div className={showCompare ? "SwitchCompare" : "hideElement"} id="compareField">
                        <FormGroup>
                            <FormControlLabel control={<Switch size="small" checked={compareDisplay}
                            onChange={(e) => handleCompare(e)}/>} label={compareLabel} />
                        </FormGroup>
                </div>
                <span id="currently-showing" data-testid="currently-showing">Latest data </span>
            </div>
            <div id="IconTopBar" className='openMenu-icon' onClick={() => displayMenu()}><IoIosArrowForward /></div>
            
            <div id="TopBarContents" className="topBarContents">
                <div className="Sidebar" data-testid="sidebar-menu">
                    <span className="Menu-icon" onClick={() => { 
                        setCompareDisplay(false);
                        displayData(-1, true, false, [], "Latest data")}}>Live Data</span>
                </div>
                <div className="Sidebar" data-testid="sidebar-menu">
                    <span className="Menu-icon" onClick={() => setShowSidebar()}>Menu</span>
                </div>
                <div className="Sidebar" data-testid="sidebar-menu">
                    <span onClick={() => setShowSidebarInfo()}><BsInfoLg /></span>
                </div>
                <div className="Location">
                    <ImLocation className="Location-icon" data-testid="user-location" onClick={showCurrentLocation} size="1em"/>
                </div>
                <div className="TUDelft-logo">
                    <img src="../../../static/images/TUDelft_logo_white.svg" alt="TU Delft logo"
                        data-testid="tudelft-location" size="1em" onClick={showTUDelftLocation}></img>
                </div>
                <div className="Searchbar" id="locationField"></div>
            </div>
        </div>
    )
}
