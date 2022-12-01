import React, {useState, useEffect } from 'react';
import {InfoMenuData} from "./InfoMenuData";

function InfoMenu () {

    const [textToShow, setTextToShow] = useState("");
    const [previousItem, setPreviousItem] = useState("");

    useEffect(() => {
        setTextToShow(InfoMenuData[0].popupText);
    }, []);

    const handleClickInfo = (item) => {
        document.getElementById(item.title).style.textDecoration = "underline";
        if(previousItem != "") {document.getElementById(previousItem).style.textDecoration = "";}
        setPreviousItem(item.title);
        setTextToShow(item.popupText);
    }

    return(
        <div id="infoMenu" className="Sidebar-shown">
            <div className='container-sidebar-menuInfo'>
                <div className="Menu-title">
                        <div>RainGuru <br/> <span className="Menu-subtitle">Weather forecast app</span></div>
                        <img src="../../static/images/TUDelft_logo_white.png" alt="TUDelft Logo" />
                </div>
                <div className="contents-menuInfo">
                    <ul className="list-menuInfo">
                        {InfoMenuData.map((item,i) => <li id={item.title} className="elements-list-menuInfo" onClick={() => {handleClickInfo(item)}}>
                        {item.icon} <span>{item.title}</span></li>)}
                    </ul>
                    <div className="menu-info-box">
                        <div class="info-text">
                            {textToShow}
                        </div>
                    </div>
                </div>
            </div>
            <div className='Bottom-privacy-statement'>
                <p>This website does not store privacy sensitive information, except for the location of the user during usage if permitted.</p>
            </div>
        </div>
    );
}

export default InfoMenu;