import React from 'react';
import PastDataSelector from "./PastDataSelector";
import {AiOutlineClose} from "react-icons/ai";

export default function SideBar({pastDataSelectorUpdateProp, loadingData, displayData, compareData, displayComparedData, setShowCompare, setShowSidebar}) {


    return (
        <div className="Sidebar-shown">
                <div className="Menu-title">
                    <div>RainGuru <br/> <span className="Menu-subtitle">Weather forecast app</span></div>
                    <img src="../../static/images/TUDelft_logo_white.png" alt="TUDelft Logo" />
                </div>
                <div className="open-menu">
                        <PastDataSelector updateProp={pastDataSelectorUpdateProp} loadingData={loadingData} displayData={displayData} compareData={compareData} 
                        setShowCompare={setShowCompare} setShowSidebar={setShowSidebar}/>
                </div>
                
                <div className='Bottom-privacy-statement'>
                    <p>This website does not store privacy sensitive information, except for the location of the user during usage if permitted.</p>
                </div>
            
        </div>
    )
}