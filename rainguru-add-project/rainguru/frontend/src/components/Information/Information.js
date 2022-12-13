import React, {Component} from "react";
import AnimationBar from "./AnimationBar";
import { AiFillQuestionCircle } from "react-icons/ai";

export default class Information extends Component {

    /**
     * Sets the information section in the starting state.
     * @param props contains optional properties of the information section.
     */
    constructor(props) {
        super(props);

        // state variables to pass along to the animation bar
        this.state = {
            animationBarUpdateProp: this.props.animationBarUpdateProp,
            gradientLegend: true,
            tooltipStatsRmse: false,
            tooltipStatsBias: false,
            tooltipLegend: false
        }

        this.displayTooltipLegend = this.displayTooltipLegend.bind(this);
        
    }

    /*
    * Display the tooltip when the user click the info button
    * Rmse and bias tooltip.
    */
    displayTooltipLegend(tooltip) {
        if(tooltip == 'rmse'){
            this.setState({tooltipStatsRmse: !this.state.tooltipStatsRmse, tooltipStatsBias: false, tooltipLegend: true});
        }
        if(tooltip == 'bias'){
            this.setState({tooltipStatsBias: !this.state.tooltipStatsBias, tooltipStatsRmse: false, tooltipLegend: true});
        }
    }


    /**
     * Changes the state according to the prop to pass the change down to the animation bar.
     *
     * @param nextProps the props given down from the App component.
     * @param prevState the last state of the component before these new props.
     */
    static getDerivedStateFromProps(nextProps, prevState) {
        // if the animation bar update prop changes send it through
        if (nextProps.animationBarUpdateProp !== prevState.animationBarUpdateProp) {
            return {animationBarUpdateProp : nextProps.animationBarUpdateProp};
        }
        else return null;
    }

    /**
     * Renders the content of the information div at the bottom of the screen, so the animation bar and the legend.
     * @returns the rendered content of the information div.
     */
    render() {
        return (
        
        
        <div className="informationContents" data-testid="information">

                <div className="floating-info">
                    
                    <div className="tooltip-legend">
                        <div className={this.state.tooltipLegend ? "box-tooltip-legend" : "hideElement"} id="tooltip-legend">

                            <div className={this.state.tooltipStatsRmse ? "tooltip-stats" : "hideElement"} id="tooltip-rmse">
                                <div>Root Mean Square Error (RMSE) is the standard deviation of the residuals (prediction errors).</div>
                            </div>
                            <div className={this.state.tooltipStatsBias ? "tooltip-stats" : "hideElement"} id="tooltip-bias">
                                <div>The average of the difference between predictions and observations</div>
                            </div>

                            <div className={this.state.gradientLegend ? "gradientsLegend" : "hideElement"}>
                                <div id="gradient1container" className="gradient-container">
                                    <div id="gradient1" className="gradient-part"></div>
                                    <div className="legend-value"><p>0.1</p></div>
                                </div>
                                <div id="gradient2container" className="gradient-container">
                                    <div id="gradient2" className="gradient-part"></div>
                                    <div className="legend-value"><p>0.5</p></div>
                                </div>
                                <div id="gradient3container" className="gradient-container">
                                    <div id="gradient3" className="gradient-part"></div>
                                    <div className="legend-value"><p>1</p></div>
                                </div>
                                <div id="gradient4container" className="gradient-container">
                                    <div id="gradient4" className="gradient-part"></div>
                                    <div className="double-text-div">
                                        <div id="left-value" className="legend-value"><p>10</p></div>
                                        <div id="right-value" className="legend-value"><p>&gt;100</p></div>
                                    </div>
                                </div>
                            </div>

                        </div>
                        <div className="button-tooltip-legend" onClick={() => {this.setState({tooltipLegend: !this.state.tooltipLegend});}}><AiFillQuestionCircle /></div>
                    </div>
                </div>


            <AnimationBar updateProp={this.state.animationBarUpdateProp} displayTooltipLegend={this.displayTooltipLegend}/>
            
        </div>);
    }
}
