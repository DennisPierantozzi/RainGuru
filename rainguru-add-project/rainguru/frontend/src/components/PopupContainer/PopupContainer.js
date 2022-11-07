import React, { Component } from "react";
import Popup from "react-popup";

export default class PopupContainer extends Component {
    constructor(props) {
        super(props);
    }

    /**
     * Renders the content of the Popup
     * @returns the rendered content of the Popup div
     */
    render() {
        return (<div data-testid="popupContainer"><Popup /></div>);
    }
}
