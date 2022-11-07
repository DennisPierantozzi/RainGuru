import React from 'react';

/**
 * Generates a div for a popup where the content will be rendered in later.
 * @param props contains state of a particular popup, method to change the state, and text to display
 * @returns a div for a sidebar popup.
 */
function AppInfoPopup(props) {

    return (props.state) ? (
        <div className="popup" data-testid="AppInfoPopupContainer" onClick={(e) => props.changePopup(e, false)}>
            <div className="popup-box" data-testid="AppInfoPopupBox" onClick={(e) => props.changePopup(e, true)}>
                <div className="popup-content">
                    <div className="popup-information">
                        {props.children}
                    </div>
                    <div className="popup-close">
                        <button className="close-button" data-testid="AppInfoCloseButton" onClick={(e) => props.changePopup(e, false)}>
                            <img className="ratioImage" src="../../../static/images/3x1.png"/>
                            <p>Close</p>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    ) : "";
}

export default AppInfoPopup