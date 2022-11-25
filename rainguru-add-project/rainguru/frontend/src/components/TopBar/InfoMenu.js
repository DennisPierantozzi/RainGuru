import React, {useState, useEffect } from 'react';
import {SideBarData} from "./SideBarData";
import AppInfoPopup from "./AppInfoPopup";

function InfoMenu () {

    const [textToShow, setTextToShow] = useState("");

    useEffect(() => {
        setTextToShow(SideBarData[0].popupText);
    }, []);

    return(
        <div id="infoMenu" className="Sidebar-shown">
            <div className="Menu-title">
                    <div>RainGuru <br/> <span className="Menu-subtitle">Weather forecast app</span></div>
                    <img src="../../static/images/TUDelft_logo_white.png" alt="TUDelft Logo" />
            </div>
            <div className="Sidebar-items Bottom-menu">
                        {SideBarData.map((item, index) => {
                            return (
                                <div key={index} className={item.className} data-testid={item.id}
                                    onClick={item.title === "Application information" ? (e) =>  setTextToShow(item.popupText) :
                                        item.title === "Contributors" ? (e) => setTextToShow(item.popupText) :
                                        item.title === "Disclaimer & Liability" ? (e) => setTextToShow(item.popupText) :
                                        item.title === "Acknowledgement" ? (e) => setTextToShow(item.popupText) :
                                            (e) => changePrivacyPopup(e, true)}>
                                    <span className="item-icon">
                                        <img className="ratioImage" src="../../../static/images/1x1.png"/>
                                        {item.icon}
                                    </span>
                                    <span className="item-title">{item.title}</span>
                                    
                                </div>
                            )
                        })}
            </div>
            <div className="info-box">
                <div class="info-text">
                    {textToShow}
                </div>
            </div>
            <div className='Bottom-privacy-statement'>
                <p>This website does not store privacy sensitive information, except for the location of the user during usage if permitted.</p>
            </div>
        </div>
    );
}

export default InfoMenu;