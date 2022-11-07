import React from "react";
import {render, screen} from "@testing-library/react";
import renderer from "react-test-renderer";
import "@testing-library/jest-dom/extend-expect";
import LoadingScreen from "../../src/components/LoadingScreen";

// disable certain warnings
const warnings = console.error.bind(console.error)
beforeAll(() => { console.error = errormessage => {
    !errormessage.toString().includes("Warning: Can't call \%s on a component that is not yet mounted") && warnings(errormessage)
}})
afterAll(() => { console.error = warnings })

describe("Loading screen tests", () => {
    it("matches snapshot", () => {
        const state = renderer.create(<LoadingScreen/>).toJSON();
        expect(state).toMatchSnapshot();
    });

    it("renders loading screen", () => {
        const ls = new LoadingScreen();
        render(ls.render());
        const element = screen.getByTestId("loadingScreen");

        expect(element).toBeTruthy();
        expect(LoadingScreen.loadingIntervalId).toBeDefined();
        expect(ls.loadingImages).toStrictEqual(["../../static/images/loading1.png",
            "../../static/images/loading2.png", "../../static/images/loading3.png"]);
        expect(ls.state.loadingImagesCount).toBe(3);
        expect(ls.state.activeImage).toBe("../../static/images/loading1.png");
        expect(ls.state.activeImageIndex).toBe(0);
    });

    it("goes to next loading frame correctly", () => {
        const ls = new LoadingScreen();
        // clear the current interval for refreshing the images, so it can be started again and the method can be tested
        clearInterval(LoadingScreen.loadingIntervalId);
        const spy = jest.spyOn(ls, "setState");

        // use fake timers to test the switching between loading images
        jest.useFakeTimers();

        // call startLoading to start the loading again
        ls.startLoading();

        // advance the timer to run the content of the set interval
        jest.advanceTimersByTime(300);
        expect(spy).toBeCalledTimes(1);
        expect(spy).toHaveBeenCalledWith({activeImage: "../../static/images/loading2.png", activeImageIndex: 1});

        // return the timers to normal just in case
        jest.useRealTimers();
    });

    it("goes to next loading frame correctly when it has to loop", () => {
        const ls = new LoadingScreen();
        // clear the current interval for refreshing the images, so it can be started again and the method can be tested
        clearInterval(LoadingScreen.loadingIntervalId);
        const spy = jest.spyOn(ls, "setState");

        // use fake timers to test the switching between loading images
        jest.useFakeTimers();

        // setup to loop the images
        ls.state.activeImage = "../../static/images/loading3.png";
        ls.state.activeImageIndex = 2;
        expect(ls.state.activeImage).toBe("../../static/images/loading3.png");
        expect(ls.state.activeImageIndex).toBe(2);

        // call startLoading to start the loading again
        ls.startLoading();

        // advance the timer to run the content of the set interval
        jest.advanceTimersByTime(300);
        expect(spy).toBeCalledTimes(1);
        expect(spy).toHaveBeenCalledWith({activeImage: "../../static/images/loading1.png", activeImageIndex: 0});

        // return the timers to normal just in case
        jest.useRealTimers();
    });
});
