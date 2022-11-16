import React, {useState} from 'react';
import {BiFilter} from 'react-icons/bi';
import PastDataSelector from "./PastDataSelector";
import {SideBarData} from "./SideBarData";
import AppInfoPopup from "./AppInfoPopup";
export default function SideBar({pastDataSelectorUpdateProp, loadingData, displayData, compareData, displayComparedData, setShowCompare, setShowSidebar}) {

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

    return (
        <div className="Sidebar-shown">
                <div className="Menu-title">
                    RainGuru <br/> <span className="Menu-subtitle">Weather forecast app</span>
                </div>
                <div className="open-menu">
                        <PastDataSelector updateProp={pastDataSelectorUpdateProp} loadingData={loadingData} displayData={displayData} compareData={compareData} 
                        displayComparedData={displayComparedData} setShowCompare={setShowCompare} setShowSidebar={setShowSidebar}/>
                </div>
                <div className="Sidebar-items Bottom-menu">
                    {SideBarData.map((item, index) => {
                        return (
                            <div key={index} className={item.className} data-testid={item.id}
                                onClick={item.title === "Application information" ? (e) =>  changeAppInfoPopup(e, true) :
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
                            </div>
                        )
                    })}
                </div>
            
        </div>
    )
}