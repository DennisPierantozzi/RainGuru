import React, {useState, useEffect } from 'react';
import {InfoMenuData} from "./InfoMenuData";

function InfoMenu () {

    const [textToShow, setTextToShow] = useState("");
    const [previousItem, setPreviousItem] = useState("");

    // set the first info section as the default one
    useEffect(() => {
        setTextToShow(InfoMenuData[0].popupText);
    }, []);


    /**
     * handle the click on the item to show different sections of the menu
     *
     * @param item the item clicked by the user
     */
    const handleClickInfo = (item) => {
        document.getElementById(item.title).style.color = "#0076C2";
        if(previousItem != "") {document.getElementById(previousItem).style.color = "#000";}
        setPreviousItem(item.title);
        setTextToShow(item.popupText);
    }

    return(
        <div id="infoMenu" className="Sidebar-shown">
            <div className='container-sidebar-menuInfo'>
                <div className="Menu-title">
                        <div>RainGuru <br/> <span className="Menu-subtitle">Weather forecast app</span></div>
                        <img src="../../static/images/TUDelft_logo_rgb.webp" width="10vw" height="13vh" alt="TUDelft Logo" />
                </div>
                <div className="contentsMenuInfo">
                    <div className="list-menuInfo">
                        {InfoMenuData.map((item,i) => <div id={item.title} className="elements-list-menuInfo" onClick={() => {handleClickInfo(item)}}>
                        <div class="item-list-display">{item.icon}</div> <div className='item-list-display'>{item.title}</div></div>)}
                    </div>
                    {textToShow}
                </div>
                <div className='Bottom-privacy-statement'>
                    <p>This website does not store privacy sensitive information, except for the location of the user during usage if permitted.</p>
                </div>
            </div>
        </div>
    );
}

export default InfoMenu;