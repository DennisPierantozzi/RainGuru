import React, {Component} from "react";

export default class LoadingScreen extends Component {

    // id for the set interval to rotate between the images
    static loadingIntervalId;

    // images for the loading screen
    loadingImages = ["../../static/images/loading1.webp", "../../static/images/loading2.webp", "../../static/images/loading3.webp"];

    /**
     * Sets the loading screen in the starting state.
     * @param props contains optional properties of the loading screen.
     */
    constructor(props) {
        super(props);

        // state variables
        this.state = {
            loadingImagesCount: 3,
            activeImage: this.loadingImages[0],
            activeImageIndex: 0
        }

        // start the interval to change between the 3 loading screens
        this.startLoading();
    }

    /**
     * Sets an interval to update the currently visible loading image to the next image.
     */
    startLoading() {
        // set the interval to every 300ms calculate the next index and set the image using the index
        LoadingScreen.loadingIntervalId = setInterval(function() {
            const newIndex = (this.state.activeImageIndex + 1) % this.state.loadingImagesCount;
            this.setState({activeImage: this.loadingImages[newIndex], activeImageIndex: newIndex});
        }.bind(this), 300);
    }

    /**
     * Renders the loading screen images.
     * @returns the rendered loading screen image.
     */
    render() {
        return <div id="loadingScreen" data-testid="loadingScreen"><img src={this.state.activeImage}
            alt={"Loading screen image " + this.state.activeImageIndex}/></div>;
    }
}