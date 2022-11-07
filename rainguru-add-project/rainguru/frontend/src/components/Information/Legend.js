import React, { Component } from "react";

export default class Legend extends Component {
    constructor(props) {
        super(props);
    }

    /**
     * Renders the legend.
     * It renders the following:
     *  - Render the top text above the legend.
     *  - Render the legend with some numbers following a logarithmic scale with rain intensity.
     *
     * @returns the rendered legend.
     */
    render() {
        return (
            <div className="legendContents" data-testid="legend-box">
                <div className="legendTitle">Precipitation [mm/h]</div>
                <div className="legendContainer">
                    <div className="legend">
                        <div id="gradient1container" className="gradient-container">
                            <div id="gradient1" className="gradient-part"></div>
                            <div className="legend-value"><p>0.1</p><i>light</i></div>
                        </div>
                        <div id="gradient2container" className="gradient-container">
                            <div id="gradient2" className="gradient-part"></div>
                        </div>
                        <div id="gradient3container" className="gradient-container">
                            <div id="gradient3" className="gradient-part"></div>
                            <div className="legend-value"><p>1</p><i className="innerRainDescription">moderate</i></div>
                        </div>
                        <div id="gradient4container" className="gradient-container">
                            <div id="gradient4" className="gradient-part"></div>
                            <div className="double-text-div">
                                <div id="left-value" className="legend-value"><p>10</p><i className="innerRainDescription">heavy</i></div>
                                <div id="right-value" className="legend-value"><p>&gt;100</p><i>extreme</i></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }


}