import React, {Component} from "react";
import AnimationBar from "./AnimationBar";
import Legend from "./Legend";

export default class Information extends Component {

    /**
     * Sets the information section in the starting state.
     * @param props contains optional properties of the information section.
     */
    constructor(props) {
        super(props);

        // state variables to pass along to the animation bar
        this.state = {
            animationBarUpdateProp: this.props.animationBarUpdateProp
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
        return (<div className="informationContents" data-testid="information">
            <AnimationBar updateProp={this.state.animationBarUpdateProp}/>
            <Legend/>
        </div>);
    }
}
