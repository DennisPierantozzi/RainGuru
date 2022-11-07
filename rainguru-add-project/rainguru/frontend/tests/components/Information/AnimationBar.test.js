import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import renderer from "react-test-renderer";
import "@testing-library/jest-dom/extend-expect";
import AnimationBar from "../../../src/components/Information/AnimationBar";
import Slider from "../../../src/components/Information/Slider";
import Communication from "../../../src/components/Communication";
import Map from "../../../src/components/Map/Map";
import 'jest-canvas-mock';
import PastDataSelector from "../../../src/components/TopBar/PastDataSelector";

// disable certain warnings
const warnings = console.error.bind(console.error)
beforeAll(() => { console.error = errormessage => {
    !errormessage.toString().includes("Warning: Can't call \%s on a component that is not yet mounted") && warnings(errormessage)
}});
afterAll(() => { console.error = warnings });

jest.mock("../../../src/components/Map/Map");
beforeEach(() => {
    // set up communication with a timestamp (23:50), so it can't break the tests since it will be requested in most
    // use a correction for timezones so each timezone runs it with the same local time to keep the tests intact
    const timeZoneOffset = ((new Date()).getTimezoneOffset()) * 60;
    Communication.dataTimestamp = new Date(1000 * (1653263400 + timeZoneOffset));
});
afterEach(() => {
    jest.clearAllMocks();
});

describe("Animation tests", () => {
    it("renders the animation bar correctly without render", () => {
        const ab = new AnimationBar();
        expect(ab.animation).toBeGreaterThanOrEqual(0);
        expect(ab.animationSpeed).toBe(700);
        expect(ab.playing).toBe(true);
        expect(ab.state.value).toBe(0);
        expect(AnimationBar.marks).toBeDefined();
        expect(AnimationBar.fullMarks).toBeDefined();
    });

    it("renders the animation bar correctly with render", () => {
        const ab = new AnimationBar();
        render(ab.render());
        const element = screen.getByTestId("animationBarDiv");

        expect(element).toBeTruthy();
        expect(ab.animation).toBeGreaterThanOrEqual(0);
        expect(ab.animationSpeed).toBe(700);
        expect(ab.playing).toBe(true);
        expect(ab.state.value).toBe(0);
        expect(AnimationBar.marks).toBeDefined();
        expect(AnimationBar.fullMarks).toBeDefined();
    });

    it("matches snapshot", () => {
        const state = renderer.create(<AnimationBar/>).toJSON();
        expect(state).toMatchSnapshot();
    });

    describe("bar tests", () => {
        it("renders the bar", () => {
            render(<AnimationBar/>);
            const element = screen.getByTestId("animationSlider");
            // any properties are tested in the snapshot
            expect(element).toBeTruthy();
        });

        it("updates correctly on change", () => {
            // this test tests onChange via mouseDown which only runs it with value 0 but that is good enough
            // to see that all the methods that it should call run with correct parameters
            const ab = new AnimationBar();
            render(ab.render());
            const element = screen.getByTestId("animationSlider");
            const spy1 = jest.spyOn(ab, "setState");
            const spy2 = jest.spyOn(ab, "stop");
            const spy3 = jest.spyOn(ab, "play");
            const spy4 = jest.spyOn(Map, "activateHeatLayer");

            // jsdom renders tests without width and height, so I need to use a mock to give it size values
            element.getBoundingClientRect = jest.fn(() => {
                return {
                    width: 19,
                    height: 1,
                    top: 0,
                    bottom: 0,
                    left: 0,
                    right: 0
                }
            });

            // change the interval via the bar using mouseDown that should fire onChange and the animation is on
            fireEvent.mouseDown(element);
            expect(spy1).toHaveBeenCalledWith({ value: 0 });
            expect(spy4).toHaveBeenCalledWith(0);
            expect(spy1).toHaveBeenCalledTimes(1);
            expect(spy2).toHaveBeenCalledTimes(1);
            expect(spy3).toHaveBeenCalledTimes(1);
            expect(spy4).toHaveBeenCalledTimes(1);

            // setup to make it seem like that animation isn't playing
            ab.playing = false;

            // change the interval via the bar using mouseDown that should fire onChange and the animation is off
            fireEvent.mouseDown(element);
            expect(spy1).toHaveBeenCalledWith({ value: 0 });
            expect(spy4).toHaveBeenCalledWith(0);
            expect(spy1).toHaveBeenCalledTimes(2);
            expect(spy2).toHaveBeenCalledTimes(1);
            expect(spy3).toHaveBeenCalledTimes(1);
            expect(spy4).toHaveBeenCalledTimes(2);
        });
    });

    describe("Animation button tests", () => {
        it("renders the animation button div", () => {
            render(<AnimationBar/>);
            const element = screen.getByTestId("animationButtonDiv");
            expect(element).toBeTruthy();
        });

        describe("Slow down button tests", () => {
            it("renders the slow down button", () => {
                render(<AnimationBar/>);
                const element = screen.getByTestId("slowDownButton");
                expect(element).toBeTruthy();
            });

            it("renders slow down icon correctly", () => {
                render(<AnimationBar/>);
                const element = screen.getByTestId("slowDownButton");
                expect(element).toMatchSnapshot();
            });

            it("on click changes the speed correctly and restarts the playing animation", () => {
                const ab = new AnimationBar();
                render(ab.render());
                const element = screen.getByTestId("slowDownButton");
                const spy1 = jest.spyOn(ab, "displaySpeed");
                const spy2 = jest.spyOn(ab, "stop");
                const spy3 = jest.spyOn(ab, "play");

                // state before calling testing functions
                expect(ab.animationSpeed).toBe(700);

                // click to slow down the animation
                fireEvent.click(element);
                expect(ab.animationSpeed).toBe(800);
                expect(spy1).toHaveBeenCalledTimes(1);
                expect(spy2).toHaveBeenCalledTimes(1);
                expect(spy3).toHaveBeenCalledTimes(1);
            });

            it("on click changes the speed correctly and does not restart the not playing animation", () => {
                const ab = new AnimationBar();
                render(ab.render());
                const element = screen.getByTestId("slowDownButton");
                const spy1 = jest.spyOn(ab, "displaySpeed");
                const spy2 = jest.spyOn(ab, "stop");
                const spy3 = jest.spyOn(ab, "play");

                // state before calling testing functions
                expect(ab.animationSpeed).toBe(700);
                // setup to not restart the animation
                ab.playing = false;
                expect(ab.playing).toBe(false);

                // click to slow down the animation
                fireEvent.click(element);
                expect(ab.animationSpeed).toBe(800);
                expect(spy1).toHaveBeenCalledTimes(1);
                expect(spy2).toHaveBeenCalledTimes(0);
                expect(spy3).toHaveBeenCalledTimes(0);
            });

            it("on click doesn't change the speed at the cap and restarts the playing animation", () => {
                const ab = new AnimationBar();
                render(ab.render());
                const element = screen.getByTestId("slowDownButton");
                const spy1 = jest.spyOn(ab, "displaySpeed");
                const spy2 = jest.spyOn(ab, "stop");
                const spy3 = jest.spyOn(ab, "play");

                // state before calling testing functions
                expect(ab.animationSpeed).toBe(700);
                // setup to not restart the animation
                ab.animationSpeed = 1100;
                expect(ab.animationSpeed).toBe(1100);

                // click to slow down the animation
                fireEvent.click(element);
                expect(ab.animationSpeed).toBe(1100);
                expect(spy1).toHaveBeenCalledTimes(1);
                expect(spy2).toHaveBeenCalledTimes(1);
                expect(spy3).toHaveBeenCalledTimes(1);
            });
        });

        describe("Backward button tests", () => {
            it("renders the backward button", () => {
                render(<AnimationBar/>);
                const element = screen.getByTestId("backwardButton");
                expect(element).toBeTruthy();
            });

            it("renders backward icon correctly", () => {
                render(<AnimationBar/>);
                const element = screen.getByTestId("backwardButton");
                expect(element).toMatchSnapshot();
            });

            it("calls the move method with correct parameters when clicked", () => {
                const ab = new AnimationBar();
                render(ab.render());
                const element = screen.getByTestId("backwardButton");
                const spy = jest.spyOn(ab, "move");

                // click to move backwards in the animation
                fireEvent.click(element);
                expect(spy).toHaveBeenCalledWith(false, true);
                expect(spy).toHaveBeenCalledTimes(1);
            });
        });

        describe("Pause/resume button tests", () => {
            it("renders the pause/resume button", () => {
                render(<AnimationBar/>);
                const element = screen.getByTestId("pauseResumeButton");
                expect(element).toBeTruthy();
            });

            it("renders pause icon correctly when it first loads", () => {
                render(<AnimationBar/>);
                const element = screen.getByTestId("pauseResumeButton");
                expect(element).toMatchSnapshot();
            });

            it("calls the pauseResume method when clicked", () => {
                const ab = new AnimationBar();
                render(ab.render());
                const element = screen.getByTestId("pauseResumeButton");
                const spy = jest.spyOn(ab, "pauseResume");

                // click to pause the animation
                fireEvent.click(element);
                expect(spy).toHaveBeenCalledTimes(1);
            });
        });

        describe("Forward button tests", () => {
            it("renders the forward button", () => {
                render(<AnimationBar/>);
                const element = screen.getByTestId("forwardButton");
                expect(element).toBeTruthy();
            });

            it("renders forward icon correctly", () => {
                render(<AnimationBar/>);
                const element = screen.getByTestId("forwardButton");
                expect(element).toMatchSnapshot();
            });

            it("calls the move method with correct parameters when clicked", () => {
                const ab = new AnimationBar();
                render(ab.render());
                const element = screen.getByTestId("forwardButton");
                const spy = jest.spyOn(ab, "move");

                // click to move forwards in the animation
                fireEvent.click(element);
                expect(spy).toHaveBeenCalledWith(true, true);
                expect(spy).toHaveBeenCalledTimes(1);
            });
        });

        describe("Speed up button tests", () => {
            it("renders the speed up button", () => {
                render(<AnimationBar/>);
                const element = screen.getByTestId("speedUpButton");
                expect(element).toBeTruthy();
            });

            it("renders speed up icon correctly", () => {
                render(<AnimationBar/>);
                const element = screen.getByTestId("speedUpButton");
                expect(element).toMatchSnapshot();
            });

            it("on click changes the speed correctly and restarts the playing animation", () => {
                const ab = new AnimationBar();
                render(ab.render());
                const element = screen.getByTestId("speedUpButton");
                const spy1 = jest.spyOn(ab, "displaySpeed");
                const spy2 = jest.spyOn(ab, "stop");
                const spy3 = jest.spyOn(ab, "play");

                // state before calling testing functions
                expect(ab.animationSpeed).toBe(700);

                // click to speed up the animation
                fireEvent.click(element);
                expect(ab.animationSpeed).toBe(600);
                expect(spy1).toHaveBeenCalledTimes(1);
                expect(spy2).toHaveBeenCalledTimes(1);
                expect(spy3).toHaveBeenCalledTimes(1);
            });

            it("on click changes the speed correctly and does not restart the not playing animation", () => {
                const ab = new AnimationBar();
                render(ab.render());
                const element = screen.getByTestId("speedUpButton");
                const spy1 = jest.spyOn(ab, "displaySpeed");
                const spy2 = jest.spyOn(ab, "stop");
                const spy3 = jest.spyOn(ab, "play");

                // state before calling testing functions
                expect(ab.animationSpeed).toBe(700);
                // setup to not restart the animation
                ab.playing = false;
                expect(ab.playing).toBe(false);

                // click to speed up the animation
                fireEvent.click(element);
                expect(ab.animationSpeed).toBe(600);
                expect(spy1).toHaveBeenCalledTimes(1);
                expect(spy2).toHaveBeenCalledTimes(0);
                expect(spy3).toHaveBeenCalledTimes(0);
            });

            it("on click doesn't change the speed at the cap and restarts the playing animation", () => {
                const ab = new AnimationBar();
                render(ab.render());
                const element = screen.getByTestId("speedUpButton");
                const spy1 = jest.spyOn(ab, "displaySpeed");
                const spy2 = jest.spyOn(ab, "stop");
                const spy3 = jest.spyOn(ab, "play");

                // state before calling testing functions
                expect(ab.animationSpeed).toBe(700);
                // setup to not restart the animation
                ab.animationSpeed = 200;
                expect(ab.animationSpeed).toBe(200);

                // click to speed up the animation
                fireEvent.click(element);
                expect(ab.animationSpeed).toBe(200);
                expect(spy1).toHaveBeenCalledTimes(1);
                expect(spy2).toHaveBeenCalledTimes(1);
                expect(spy3).toHaveBeenCalledTimes(1);
            });
        });
    });

    describe("Data bar tests", () => {
        describe("Animation speed data tests", () => {
            it("renders the animation speed data", () => {
                render(<AnimationBar/>);
                const element = screen.getByTestId("speedValue");
                expect(element).toBeTruthy();
            });

            it("renders the animation speed data with value 5 at first", () => {
                render(<AnimationBar/>);
                const element = screen.getByTestId("speedValue");
                expect(element).toHaveTextContent("Animation speed: 5");
            });
        });

        describe("Interval info data tests", () => {
            it("renders the interval info data", () => {
                render(<AnimationBar/>);
                const element = screen.getByTestId("intervalInfo");
                expect(element).toBeTruthy();
            });

            it("renders the interval info data empty with the hardcoded timestamp of the first interval at first", () => {
                // this test uses the timestamp from communication which is mocked
                render(<AnimationBar/>);
                const element = screen.getByTestId("intervalInfo");
                expect(element).toBeEmptyDOMElement();
            });

            it("update the interval info correctly", () => {
                const ab = new AnimationBar({updateProp: 0});
                render(ab.render());
                const element = screen.getByTestId("intervalInfo");

                // state before the method calls
                expect(element).toBeEmptyDOMElement();
                // set up as if there are predictions
                Slider.predictions = [2.05, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];
                Slider.sliderValue = ab.state.value;

                // update the interval info
                ab.componentDidUpdate({updateProp: 0}, {updateProp: 0});
                expect(element).toHaveTextContent("23:50 - 2.05 mm/h");
            });

            it("update the interval info correctly when an extra .0 is needed", () => {
                const ab = new AnimationBar({updateProp: 0});
                render(ab.render());
                const element = screen.getByTestId("intervalInfo");

                // state before the method calls
                expect(element).toBeEmptyDOMElement();
                // set up as if there are predictions
                Slider.predictions = [27, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];

                // update the interval info
                ab.componentDidUpdate({updateProp: 0}, {updateProp: 0});
                expect(element).toHaveTextContent("23:50 - 27.0 mm/h");
            });

            it("when there is no selected location it renders with just the timestamp", () => {
                const ab = new AnimationBar({updateProp: 0});
                render(ab.render());
                const element = screen.getByTestId("intervalInfo");

                // state before the method calls
                expect(element).toBeEmptyDOMElement();
                // set up as if there are no predictions
                Slider.predictions = false;

                // update the interval info
                ab.componentDidUpdate({updateProp: 0}, {updateProp: 0});
                expect(element).toHaveTextContent("23:50");
            });
        });

        describe("Max rain data tests", () => {
            it("renders the max rain data", () => {
                render(<AnimationBar/>);
                const element = screen.getByTestId("maxRain");
                expect(element).toBeTruthy();
            });

            it("renders the max rain data empty at first", () => {
                render(<AnimationBar/>);
                const element = screen.getByTestId("maxRain");
                expect(element).toBeEmptyDOMElement();
            });
        });
    });

    describe("Scale value test", () => {
        it("renders the scale values", () => {
            render(<AnimationBar/>);
            const maxScale = screen.getByTestId("max-scale");
            const midScale = screen.getByTestId("mid-scale");
            const minScale = screen.getByTestId("min-scale");
            expect(maxScale).toBeTruthy();
            expect(midScale).toBeTruthy();
            expect(minScale).toBeTruthy();
        });

        it("renders the min scale value with 0", () => {
            render(<AnimationBar/>);
            const minScale = screen.getByTestId("min-scale");
            expect(minScale).toHaveTextContent("0");
        });

        it("renders the max-scale and mid-value as empty dom", () => {
                // this test uses the timestamp from communication which is mocked
            render(<AnimationBar/>);
            const maxScale = screen.getByTestId("max-scale");
            const midScale = screen.getByTestId("mid-scale");
            expect(maxScale).toBeEmptyDOMElement();
            expect(midScale).toBeEmptyDOMElement();
            });

        it("renders the max-scale and mid-scale correctly when location is selected", () => {
            render(<AnimationBar/>);
            const maxScale = screen.getByTestId("max-scale");
            const midScale = screen.getByTestId("mid-scale");
            const mockFetchPrecipitation = jest.fn().mockReturnValue([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19]);
            Communication.fetchPrecipitation = mockFetchPrecipitation;
            const mockMakeChart = jest.fn().mockReturnValue(null)
            Slider.makeChart = mockMakeChart;
            Slider.showPrecipitationData(1,1).then(() => expect(midScale).toHaveTextContent("9.50"));
            Slider.showPrecipitationData(1,1).then(() => expect(maxScale).toHaveTextContent("19"));
            });

        it("renders the max-scale and mid-scale correctly when max precipitation is 0", () => {
            render(<AnimationBar/>);
            const maxScale = screen.getByTestId("max-scale");
            const midScale = screen.getByTestId("mid-scale");
            const mockFetchPrecipitation = jest.fn().mockReturnValue([0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]);
            Communication.fetchPrecipitation = mockFetchPrecipitation;
            const mockMakeChart = jest.fn().mockReturnValue(null)
            Slider.makeChart = mockMakeChart;
            Slider.showPrecipitationData(1,1).then(() => expect(midScale).toHaveTextContent("0.05"));
            Slider.showPrecipitationData(1,1).then(() => expect(maxScale).toHaveTextContent("0.1"));
            });
    });


    describe("passing props tests", () => {
        it("no change in update prop", () => {
            expect(AnimationBar.getDerivedStateFromProps({updateProp: 4}, {updateProp: 4})).toBeNull();
        });

        it("change in update prop", () => {
            expect(AnimationBar.getDerivedStateFromProps({updateProp: 5}, {updateProp: 4})).toStrictEqual({updateProp: 5});
        });

        it("update on prop change, prop change was up and we can go a frame back, and the animation does not need to be restarted", () => {
            const ab = new AnimationBar({updateProp: 0});
            render(ab.render());
            const spy1 = jest.spyOn(ab, "setState");
            const spy2 = jest.spyOn(ab, "pauseResume");
            const spy3 = jest.spyOn(Map, "activateHeatLayer");

            // state before the method is called
            expect(ab.state.value).toBe(0);
            // set up the animation to not need to be restarted, and setup to go a frame back
            ab.stop();
            ab.playing = false;
            expect(ab.animation).toBe(false);
            expect(ab.playing).toBe(false);
            ab.state.value = 8;
            expect(ab.state.value).toBe(8);

            // call the method and check the changes
            ab.componentDidUpdate({updateProp: 0}, {updateProp: -1});
            expect(spy1).toBeCalledTimes(1);
            expect(spy1).toBeCalledWith({value: 7});
            expect(spy2).toHaveBeenCalledTimes(0);
            expect(spy3).toHaveBeenCalledTimes(1);
        });

        it("update on prop change, prop change was up and we can't go a frame back, and the animation does need to be restarted", () => {
            const ab = new AnimationBar({updateProp: 0});
            render(ab.render());
            const spy1 = jest.spyOn(ab, "setState");
            const spy2 = jest.spyOn(ab, "pauseResume");
            const spy3 = jest.spyOn(Map, "activateHeatLayer");

            // state before the method is called
            expect(ab.state.value).toBe(0);

            // call the method and check the changes
            ab.componentDidUpdate({updateProp: 0}, {updateProp: -1});
            expect(spy1).toBeCalledTimes(2);
            expect(spy1).toBeCalledWith({value: 0});
            expect(spy2).toHaveBeenCalledTimes(1);
            expect(spy3).toHaveBeenCalledTimes(1);
        });

        it("update on prop change, prop change was down so the value goes to zero, and the animation does need to be restarted", () => {
            const ab = new AnimationBar({updateProp: 0});
            render(ab.render());
            const spy1 = jest.spyOn(ab, "setState");
            const spy2 = jest.spyOn(ab, "pauseResume");
            const spy3 = jest.spyOn(Map, "activateHeatLayer");

            // state before the method is called
            expect(ab.state.value).toBe(0);
            // setup to now have the value at zero
            ab.state.value = 17;
            expect(ab.state.value).toBe(17);

            // call the method and check the changes
            ab.componentDidUpdate({updateProp: 0}, {updateProp: 1});
            expect(spy1).toBeCalledTimes(2);
            expect(spy1).toBeCalledWith({value: PastDataSelector.loadTimestamp});
            expect(spy2).toHaveBeenCalledTimes(1);
            expect(spy3).toHaveBeenCalledTimes(1);
        });

        it("update but no update prop change", () => {
            const ab = new AnimationBar({updateProp: 0});
            render(ab.render());
            const spy1 = jest.spyOn(ab, "setState");
            const spy2 = jest.spyOn(ab, "pauseResume");
            const spy3 = jest.spyOn(Map, "activateHeatLayer");

            // state before the method is called
            expect(ab.state.value).toBe(0);

            // call the method and check the changes
            ab.componentDidUpdate({updateProp: 0}, {updateProp: 0});
            expect(spy1).toBeCalledTimes(0);
            expect(spy2).toHaveBeenCalledTimes(0);
            expect(spy3).toHaveBeenCalledTimes(0);
        });
    });

    describe("method tests", () => {
        it("make marks labels test using xx:x5 labels", () => {
            // this test just uses the communication setup (timestamp (23:50)) from the before each since it works out
            // update the marks
            AnimationBar.updateMarks();

            // this will test if the labels loop correctly and add zeros where needed
            expect(AnimationBar.marks).toStrictEqual([
                {value: 0, label: ""}, {value: 1, label: "23:55"}, {value: 2, label: ""}, {value: 3, label: "0:05"},
                {value: 4, label: ""}, {value: 5, label: "0:15"}, {value: 6, label: ""}, {value: 7, label: "0:25"},
                {value: 8, label: ""}, {value: 9, label: "0:35"}, {value: 10, label: ""}, {value: 11, label: "0:45"},
                {value: 12, label: ""}, {value: 13, label: "0:55"}, {value: 14, label: ""}, {value: 15, label: "1:05"},
                {value: 16, label: ""}, {value: 17, label: "1:15"}, {value: 18, label: ""}, {value: 19, label: ""}
            ]);
            expect(AnimationBar.fullMarks).toStrictEqual(["23:50", "23:55", "0:00", "0:05", "0:10", "0:15", "0:20",
                "0:25", "0:30", "0:35", "0:40", "0:45", "0:50", "0:55", "1:00", "1:05", "1:10", "1:15", "1:20", "1:25"])
        });

        it("make marks labels test using xx:x0 labels", () => {
            // this test doesn't use the communication setup from the before each since it needs a different time
            // change the communication setup to timestamp (23:55)
            // use a correction for timezones so each timezone runs it with the same local time to keep the tests intact
            const timeZoneOffset = ((new Date()).getTimezoneOffset()) * 60;
            Communication.dataTimestamp = new Date(1000 * (1653263700 + timeZoneOffset));
            // update the marks
            AnimationBar.updateMarks();

            // this will test if the labels loop correctly, also for the first label and add zeros where needed
            expect(AnimationBar.marks).toStrictEqual([
                {value: 0, label: ""}, {value: 1, label: "0:00"}, {value: 2, label: ""}, {value: 3, label: "0:10"},
                {value: 4, label: ""}, {value: 5, label: "0:20"}, {value: 6, label: ""}, {value: 7, label: "0:30"},
                {value: 8, label: ""}, {value: 9, label: "0:40"}, {value: 10, label: ""}, {value: 11, label: "0:50"},
                {value: 12, label: ""}, {value: 13, label: "1:00"}, {value: 14, label: ""}, {value: 15, label: "1:10"},
                {value: 16, label: ""}, {value: 17, label: "1:20"}, {value: 18, label: ""}, {value: 19, label: ""}
            ]);
            expect(AnimationBar.fullMarks).toStrictEqual(["23:55", "0:00", "0:05", "0:10", "0:15", "0:20", "0:25",
                "0:30", "0:35", "0:40", "0:45", "0:50", "0:55", "1:00", "1:05", "1:10", "1:15", "1:20", "1:25", "1:30"])
        });

        it("stop & play test", () => {
            const ab = new AnimationBar();

            // setInterval coverage test for play
            const spy = jest.spyOn(ab, "move");
            jest.useFakeTimers();

            // state before calling testing functions
            expect(ab.animation).toBeGreaterThanOrEqual(0);

            // stop the animation
            ab.stop();
            expect(ab.animation).toBe(false);

            // play the animation
            ab.play();
            expect(ab.animation).toBeGreaterThanOrEqual(0);
            jest.advanceTimersByTime(ab.animationSpeed);
            expect(spy).toHaveBeenCalledTimes(1);

            // return the timers to normal just in case
            jest.useRealTimers();
        });

        it("pauseResume pause & resume test", () => {
            const ab = new AnimationBar();
            const spy1 = jest.spyOn(ab, "stop");
            const spy2 = jest.spyOn(ab, "play");

            // render the animation bar since this method changes parts of the html
            render(ab.render());
            // state before calling testing functions
            expect(ab.playing).toBe(true);

            // pause the animation
            ab.pauseResume();
            expect(ab.playing).toBe(false);
            expect(spy1).toHaveBeenCalledTimes(1);

            // resume the animation
            ab.pauseResume();
            expect(ab.playing).toBe(true);
            expect(spy2).toHaveBeenCalledTimes(1);
        });

        it("move from button backward without loop", () => {
            // this test doesn't test the value of the state, but instead the value in the update method call
            const ab = new AnimationBar();
            const spy1 = jest.spyOn(ab, "setState");
            const spy2 = jest.spyOn(ab, "stop");
            const spy3 = jest.spyOn(ab, "play");
            const spy4 = jest.spyOn(Map, "activateHeatLayer");

            // state before calling testing functions
            expect(ab.state.value).toBe(0);
            // setup to not loop the value
            ab.state.value = 10;
            expect(ab.state.value).toBe(10);

            // call move that should not make the value loop
            ab.move(false, true);
            expect(spy1).toHaveBeenCalledWith({ value: 9 });
            expect(spy4).toHaveBeenCalledWith(9);
            expect(spy1).toHaveBeenCalledTimes(1);
            expect(spy2).toHaveBeenCalledTimes(1);
            expect(spy3).toHaveBeenCalledTimes(1);
            expect(spy4).toHaveBeenCalledTimes(1);
        });

        it("move from button backward with loop", () => {
            // this test doesn't test the value of the state, but instead the value in the update method call
            const ab = new AnimationBar();
            const spy1 = jest.spyOn(ab, "setState");
            const spy2 = jest.spyOn(ab, "stop");
            const spy3 = jest.spyOn(ab, "play");
            const spy4 = jest.spyOn(Map, "activateHeatLayer");

            // state before calling testing functions
            expect(ab.state.value).toBe(0);

            // call move that should make the value loop
            ab.move(false, true);
            expect(spy1).toHaveBeenCalledWith({ value: 19 });
            expect(spy4).toHaveBeenCalledWith(19);
            expect(spy1).toHaveBeenCalledTimes(1);
            expect(spy2).toHaveBeenCalledTimes(1);
            expect(spy3).toHaveBeenCalledTimes(1);
            expect(spy4).toHaveBeenCalledTimes(1);
        });

        it("move from button forward without loop", () => {
            // this test doesn't test the value of the state, but instead the value in the update method call
            const ab = new AnimationBar();
            const spy1 = jest.spyOn(ab, "setState");
            const spy2 = jest.spyOn(ab, "stop");
            const spy3 = jest.spyOn(ab, "play");
            const spy4 = jest.spyOn(Map, "activateHeatLayer");

            // state before calling testing functions
            expect(ab.state.value).toBe(0);

            // call move that should not make the value loop
            ab.move(true, true);
            expect(spy1).toHaveBeenCalledWith({ value: 1 });
            expect(spy4).toHaveBeenCalledWith(1);
            expect(spy1).toHaveBeenCalledTimes(1);
            expect(spy2).toHaveBeenCalledTimes(1);
            expect(spy3).toHaveBeenCalledTimes(1);
            expect(spy4).toHaveBeenCalledTimes(1);
        });

        it("move from button forward with loop", () => {
            // this test doesn't test the value of the state, but instead the value in the update method call
            const ab = new AnimationBar();
            const spy1 = jest.spyOn(ab, "setState");
            const spy2 = jest.spyOn(ab, "stop");
            const spy3 = jest.spyOn(ab, "play");
            const spy4 = jest.spyOn(Map, "activateHeatLayer");

            // state before calling testing functions
            expect(ab.state.value).toBe(0);
            // setup to loop the value
            ab.state.value = 19;
            expect(ab.state.value).toBe(19);

            // call move that should make the value loop
            ab.move(true, true);
            expect(spy1).toHaveBeenCalledWith({ value: 0 });
            expect(spy4).toHaveBeenCalledWith(0);
            expect(spy1).toHaveBeenCalledTimes(1);
            expect(spy2).toHaveBeenCalledTimes(1);
            expect(spy3).toHaveBeenCalledTimes(1);
            expect(spy4).toHaveBeenCalledTimes(1);
        });

        it("move from button but the animation isn't playing", () => {
            const ab = new AnimationBar();
            const spy1 = jest.spyOn(ab, "setState");
            const spy2 = jest.spyOn(ab, "stop");
            const spy3 = jest.spyOn(ab, "play");
            const spy4 = jest.spyOn(Map, "activateHeatLayer");

            // state before calling testing functions
            expect(ab.state.value).toBe(0);
            // setup to make it seem like that animation isn't playing
            ab.playing = false;

            // call move with the correct parameters
            ab.move(true, true);
            expect(spy1).toHaveBeenCalledWith({ value: 1 });
            expect(spy4).toHaveBeenCalledWith(1);
            expect(spy1).toHaveBeenCalledTimes(1);
            expect(spy2).toHaveBeenCalledTimes(0);
            expect(spy3).toHaveBeenCalledTimes(0);
            expect(spy4).toHaveBeenCalledTimes(1);
        })

        it("move from animation", () => {
            const ab = new AnimationBar();
            const spy1 = jest.spyOn(ab, "setState");
            const spy2 = jest.spyOn(ab, "stop");
            const spy3 = jest.spyOn(ab, "play");
            const spy4 = jest.spyOn(Map, "activateHeatLayer");

            // state before calling testing functions
            expect(ab.state.value).toBe(0);

            // call move with the correct parameters
            ab.move(true, false);
            expect(spy1).toHaveBeenCalledWith({ value: 1 });
            expect(spy4).toHaveBeenCalledWith(1);
            expect(spy1).toHaveBeenCalledTimes(1);
            expect(spy2).toHaveBeenCalledTimes(0);
            expect(spy3).toHaveBeenCalledTimes(0);
            expect(spy4).toHaveBeenCalledTimes(1);
        });

        it("display speed test", () => {
            const ab = new AnimationBar();
            render(ab.render());
            const element = screen.getByTestId("speedValue");

            // state before calling testing functions
            expect(ab.animationSpeed).toBe(700);
            expect(element).toHaveTextContent("Animation speed: 5");
            // setup to have a different new animation speed value
            ab.animationSpeed = 400;

            // call displaySpeed to show this new animation speed value
            ab.displaySpeed();
            expect(element).toHaveTextContent("Animation speed: 8");
        });
    });
});
