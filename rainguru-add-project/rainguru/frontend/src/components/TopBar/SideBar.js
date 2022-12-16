import React from 'react';
import PastDataSelector from "./PastDataSelector";

export default function SideBar({pastDataSelectorUpdateProp, loadingData, displayData, compareData, displayComparedData, setShowCompare, setShowSidebar}) {

    return (
        <div className="Sidebar-shown">
            <div className='container-sidebar-menu'>
                <div className="Menu-title">
                    <div>RainGuru <br/> <span className="Menu-subtitle">Weather forecast app</span></div>
                    <img src="../../static/images/TUDelft_logo_rgb.webp" width="10vw" height="13vh" alt="TUDelft Logo" />
                </div>
                <PastDataSelector updateProp={pastDataSelectorUpdateProp} loadingData={loadingData} displayData={displayData} compareData={compareData} 
                setShowSidebar={setShowSidebar}/>

                <div className='Bottom-privacy-statement'>
                    <p>This website does not store privacy sensitive information, except for the location of the user during usage if permitted.</p>
                </div>
            </div> 
        </div>
    )
}