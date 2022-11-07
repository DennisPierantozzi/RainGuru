import React, {useState} from 'react';
import {FaBars} from 'react-icons/fa';
import {HiOutlineDatabase} from 'react-icons/hi';
import {ImLocation} from 'react-icons/im';
import {SideBarData} from "./SideBarData";
import AppInfoPopup from "./AppInfoPopup";
import Map from "../Map/Map";
import PastDataSelector from "./PastDataSelector";

export default function TopBar({pastDataSelectorUpdateProp, loadingData, displayData}) {

    /**
     * initializing a state for sidebar and function to update it. Initially, state is set to false.
     * This state is to keep track of whether the sidebar is open or not
     */
    const [sidebar, setSidebar] = useState(false)

    /**
     * toggles the value to the opposite state.
     */
    const showSidebar = () => setSidebar(!sidebar)

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

    /**
     * closes the pastData menu.
     */
    const closeMenus = () => {
        setPastDataSelector(false);
    }

    /**
     * initializing a state for pastDataSelector and function to update it. Initially, state is set to false.
     * This state is to keep track of whether pastData menu is open or not.
     */
    const [pastDataSelector, setPastDataSelector] = useState(false);

    /**
     * sets pastDataSelector state depending on the current state and closes menu if the current state is false.
     */
    const showPastDataSelector = () => {
        if (!pastDataSelector) {
            closeMenus();
            setPastDataSelector(true);
        } else {
            setPastDataSelector(false);
        }
    }

    /**
     * Initializing five states and functions to update them. Initial states are set to false for all of them.
     * These states are to keep track of whether or not a popup is displayed.
     */
    const [appInfoPopup, setAppInfoPopup] = useState(false)
    const [contributorPopup, setContributorPopup] = useState(false)
    const [disclaimerPopup, setDisclaimerPopup] = useState(false)
    const [privacyPopup, setPrivacyPopup] = useState(false)
    const [acknowledgementPopup, setAcknowledgementPopup] = useState(false);

    /**
     * Updates application information popup state.
     * @param e event parameter
     * @param bool state to be updated to
     */
    const changeAppInfoPopup = (e, bool) => {
        e.stopPropagation();
        setAppInfoPopup(bool);
    }

    /**
     * Updates disclaimer and liability popup state.
     * @param e event parameter
     * @param bool state to be updated to
     */
    const changeDisclaimerPopup = (e, bool) => {
        e.stopPropagation();
        setDisclaimerPopup(bool);
    }

    /**
     * Updates privacy statement popup state.
     * @param e event parameter
     * @param bool state to be updated to
     */
    const changePrivacyPopup = (e, bool) => {
        e.stopPropagation();
        setPrivacyPopup(bool);
    }

    /**
     * Updates contributor popup state.
     * @param e event parameter
     * @param bool state to be updated to
     */
    const changeContributorPopup = (e, bool) => {
        e.stopPropagation();
        setContributorPopup(bool);
    }

    /**
     * Updates acknowledgement popup state.
     * @param e event parameter
     * @param bool state to be updated to
     */
    const changeAcknowledgementPopup = (e, bool) => {
        e.stopPropagation();
        setAcknowledgementPopup(bool);
    }

    /**
     * Renders the content of the TopBar div at the top of the screen. This also contains sidebar.
     * @returns the rendered content of the topbar div.
     */
    return (
        <div className="topBarContents" data-testid="topBar-container">
            <div className="Sidebar" data-testid="sidebar-menu">
                <img className="ratioImage" src="../../../static/images/1x1.png"/>
                <FaBars className="Sidebar-icon" onClick={showSidebar} size="60%"/>
            </div>
            <div className="Location">
                <img className="ratioImage" src="../../../static/images/1x1.png"/>
                <ImLocation className="Location-icon" data-testid="user-location" onClick={showCurrentLocation} size="60%"/>
            </div>
            <div className="TUDelft-logo">
                <img className="ratioImage" src="../../../static/images/1x1.png"/>
                <img src="../../../static/images/TUDelftButton.png" alt="TU Delft logo"
                     className="TUDelft-logo-icon" data-testid="tudelft-location" onClick={showTUDelftLocation}></img>
            </div>
            <div className="Searchbar" id="locationField"></div>

            <nav className={sidebar ? "Sidebar-shown" : "hideElement"}>
                <ul className="Sidebar-items">
                    <li className={pastDataSelector ? "active-menu-item" : "SideBar-item"} onClick={showPastDataSelector}>
                        <span className="item-icon">
                            <img className="ratioImage" src="../../../static/images/1x1.png"/>
                            <HiOutlineDatabase className="sidebar-element-icon" size="50%"/>
                        </span>
                        <span className="item-title">Display previous data</span>
                    </li>
                    <li className={pastDataSelector ? "open-menu" : "hideElement"}>
                        <PastDataSelector updateProp={pastDataSelectorUpdateProp} loadingData={loadingData} displayData={displayData}/>
                    </li>
                    <li className={pastDataSelector ? "hideElement" : "sidebar-splitter"} id="sidebar-splitter"></li>
                    {SideBarData.map((item, index) => {
                        return (
                            <li key={index} className={item.className} data-testid={item.id}
                                onClick={item.title === "Application information" ? (e) => changeAppInfoPopup(e, true) :
                                    item.title === "Contributors" ? (e) => changeContributorPopup(e, true) :
                                    item.title === "Disclaimer & Liability" ? (e) => changeDisclaimerPopup(e, true) :
                                    item.title === "Acknowledgement" ? (e) => changeAcknowledgementPopup(e, true) :
                                        (e) => changePrivacyPopup(e, true)}>
                                <span className="item-icon">
                                    <img className="ratioImage" src="../../../static/images/1x1.png"/>
                                    {item.icon}
                                </span>
                                <span className="item-title">{item.title}</span>
                                <div className="popup-container" data-testid={item.id + "-popup-container"}>
                                    <AppInfoPopup
                                        state={item.title === "Application information" ? appInfoPopup : item.title === "Disclaimer & Liability" ? disclaimerPopup:
                                            item.title === "Contributors" ? contributorPopup : item.title === "Acknowledgement" ? acknowledgementPopup : privacyPopup}
                                        changePopup={item.title === "Application information" ? changeAppInfoPopup :
                                            item.title === "Contributors" ? changeContributorPopup:
                                            item.title === "Disclaimer & Liability" ?  changeDisclaimerPopup:
                                            item.title === "Acknowledgement" ? changeAcknowledgementPopup: changePrivacyPopup}>
                                        <div id="popup-text"data-testid={item.id + "-popuptext-topbar"}>{item.popupText}</div>
                                    </AppInfoPopup>
                                </div>
                            </li>
                        )
                    })}
                </ul>
            </nav>
        </div>
    )
}
