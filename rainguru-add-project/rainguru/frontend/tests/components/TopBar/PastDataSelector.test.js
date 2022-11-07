import React from "react";
import {fireEvent, render, screen, within} from "@testing-library/react";
import renderer from "react-test-renderer";
import "@testing-library/jest-dom/extend-expect";
import moment from "moment";
import {MenuItem} from "@mui/material";
import PastDataSelector from "../../../src/components/TopBar/PastDataSelector";

// list with all the times
const times = [1654638300, 1654638000, 1654637700, 1654637400, 1654637100,
                    1654636800, 1654636500, 1654636200, 1654635900, 1654635600, 1654635300, 1654635000, 1654634700,
                    1654634400, 1654634100, 1654633800, 1654633500, 1654633200, 1654632900, 1654632600, 1654632300,
                    1654632000, 1654631700, 1654631400, 1654631100, 1654630800, 1654630500, 1654630200, 1654629900,
                    1654629600, 1654629300, 1654629000, 1654628700, 1654628400, 1654628100, 1654627800];
// list with all the times in hour:minute format
const hourMins = [];
// disable certain warnings
const warnings = console.error.bind(console.error)
beforeAll(() => {
    console.error = errormessage => {
        !errormessage.toString().includes("Warning: Can't call \%s on a component that is not yet mounted") && warnings(errormessage)
    };
    for (let i = 0; i < times.length; i++) {
        hourMins.push(moment(new Date(times[i] * 1000)).format("HH:mm"));
    }
});
afterAll(() => { console.error = warnings });

describe("PastDataSelector tests", () => {
    it("matches snapshot", () => {
        const state = renderer.create(<PastDataSelector/>).toJSON();
        expect(state).toMatchSnapshot();
    });

    it("matches snapshot with disabled buttons", () => {
        // set loading data to be true which means the buttons are disabled
        const pds = new PastDataSelector({loadingData: true, updateProp: 0, displayData: jest.fn()});
        const state = renderer.create(pds.render()).toJSON();
        expect(state).toMatchSnapshot();
    });

    it("matches snapshot with enabled observation timestamp selector", () => {
        // set loading data to be true which means the buttons are disabled
        const pds = new PastDataSelector({loadingData: true, updateProp: 0, displayData: jest.fn()});

        // set the observed value to enable the observation timestamp chooser
        pds.state.observedValue = 5;
        expect(pds.state.observedValue).toBe(5);

        // match the state to a snapshot
        const state = renderer.create(pds.render()).toJSON();
        expect(state).toMatchSnapshot();
    });

    it("renders the past data selector", () => {
        render(<PastDataSelector/>);
        const element = screen.getByTestId("pastDataSelector");
        expect(element).toBeTruthy();
    });

    describe("element event tests", () => {
        it("clicking to load the latest data calls the loadData method correctly", () => {
            const pds = new PastDataSelector({updateProp: 0, displayData: jest.fn()});
            render(pds.render());
            const element = screen.getByTestId("latest-loader");
            const spy = jest.spyOn(pds, "loadData");

            // click to load the latest data
            fireEvent.click(element);
            expect(spy).toBeCalledTimes(1);
            expect(spy).toBeCalledWith(true, false);
        });

        it("clicking to load observed data calls the loadData method correctly", () => {
            const pds = new PastDataSelector({updateProp: 0, displayData: jest.fn()});
            render(pds.render());
            const element = screen.getByTestId("observed-loader");
            const spy = jest.spyOn(pds, "loadData");

            // click to load the latest data
            fireEvent.click(element);
            expect(spy).toBeCalledTimes(1);
            expect(spy).toBeCalledWith(false, true);
        });

        it("clicking to load predicted data calls the loadData method correctly", () => {
            const pds = new PastDataSelector({updateProp: 0, displayData: jest.fn()});
            render(pds.render());
            const element = screen.getByTestId("predicted-loader");
            const spy = jest.spyOn(pds, "loadData");

            // click to load the latest data
            fireEvent.click(element);
            expect(spy).toBeCalledTimes(1);
            expect(spy).toBeCalledWith(false, false);
        });

        it("selects the correct option of the predicted drop down menu", () => {
            const pds = new PastDataSelector({updateProp: 0, displayData: jest.fn()});
            const {getByRole} = render(pds.render());
            const spy = jest.spyOn(pds, "setState");

            fireEvent.mouseDown(screen.getByTestId("predicted-drop-down").firstChild);
            const listbox = within(getByRole("listbox"));
            fireEvent.click(listbox.getByText(hourMins[8]));
            expect(spy).toHaveBeenCalledTimes(1);
            expect(spy).toHaveBeenCalledWith({predictedValue: 8});
        });

        it("selects the correct option of the observed drop down menu", () => {
            const pds = new PastDataSelector({updateProp: 0, displayData: jest.fn()});
            const {getByRole} = render(pds.render());
            const spy1 = jest.spyOn(pds, "setState");
            const spy2 = jest.spyOn(pds, "updateObservationTimestamps");

            fireEvent.mouseDown(screen.getByTestId("observed-drop-down").firstChild);
            const listbox = within(getByRole("listbox"));
            fireEvent.click(listbox.getByText(hourMins[23] + " - " + hourMins[4]));
            expect(spy1).toHaveBeenCalledTimes(1);
            expect(spy1).toHaveBeenCalledWith({observedValue: 23, observedTimestamp: 9});
            expect(spy2).toBeCalledTimes(1);
            expect(spy2).toBeCalledWith(23);
        });

        it("selects the correct option of the observation drop down menu", () => {
            const pds = new PastDataSelector({updateProp: 0, displayData: jest.fn()});
            const {getByRole} = render(pds.render());
            const spy = jest.spyOn(pds, "setState");

            // set the state to enable the select menu just in case
            pds.updateObservationTimestamps(23);

            fireEvent.mouseDown(screen.getByTestId("timestamp-observed-drop-down").firstChild);
            const listbox = within(getByRole("listbox"));
            fireEvent.click(listbox.getByText(hourMins[11]));
            expect(spy).toHaveBeenCalledTimes(1);
            expect(spy).toHaveBeenCalledWith({observedTimestamp: 12});
        });
    });

    describe("passing props tests", () => {
        it("no change in both loading data and update prop", () => {
            expect(PastDataSelector.getDerivedStateFromProps({loadingData: false, updateProp: 4}, {loadingData: false, updateProp: 4})).toStrictEqual({});
        });

        it("change in loading data prop", () => {
            expect(PastDataSelector.getDerivedStateFromProps({loadingData: true, updateProp: 4}, {loadingData: false, updateProp: 4})).toStrictEqual({loadingData: true});
        });

        it("change in update prop", () => {
            expect(PastDataSelector.getDerivedStateFromProps({loadingData: false, updateProp: 5}, {loadingData: false, updateProp: 4})).toStrictEqual({updateProp: 5});
        });

        it("change in both loading data and update prop", () => {
            expect(PastDataSelector.getDerivedStateFromProps({loadingData: true, updateProp: 5}, {loadingData: false, updateProp: 4}))
                .toStrictEqual({loadingData: true, updateProp: 5});
        });

        it("update on prop change, predicted stays at none, observed goes up a number", () => {
            const pds = new PastDataSelector({updateProp: 0});
            const spy = jest.spyOn(pds, "setState");

            // state before the method is called
            expect(pds.state.predictedValue).toBe("");
            expect(pds.state.observedValue).toBe("");
            // setup observedValue to update
            pds.state.observedValue = 20;
            expect(pds.state.observedValue).toBe(20);

            // call the method and check the changes
            pds.componentDidUpdate({updateProp: 5}, {updateProp: 4});
            expect(spy).toBeCalledTimes(1);
            expect(spy).toBeCalledWith({predictedValue: "", observedValue: 21})
        });

        it("update on prop change, predicted goes to none from last, observed goes up a number", () => {
            const pds = new PastDataSelector({updateProp: 0});
            const spy = jest.spyOn(pds, "setState");

            // state before the method is called
            expect(pds.state.predictedValue).toBe("");
            expect(pds.state.observedValue).toBe("");
            // setup predictedValue to go to none and observedValue to update
            pds.state.predictedValue = 35;
            pds.state.observedValue = 25;
            expect(pds.state.predictedValue).toBe(35);
            expect(pds.state.observedValue).toBe(25);

            // call the method and check the changes
            pds.componentDidUpdate({updateProp: 5}, {updateProp: 4});
            expect(spy).toBeCalledTimes(1);
            expect(spy).toBeCalledWith({predictedValue: "", observedValue: 26})
        });

        it("update on prop change, predicted goes up a number, observed stays at none", () => {
            const pds = new PastDataSelector({updateProp: 0});
            const spy = jest.spyOn(pds, "setState");

            // state before the method is called
            expect(pds.state.predictedValue).toBe("");
            expect(pds.state.observedValue).toBe("");
            // setup observedValue to update
            pds.state.predictedValue = 7;
            expect(pds.state.predictedValue).toBe(7);

            // call the method and check the changes
            pds.componentDidUpdate({updateProp: 5}, {updateProp: 4});
            expect(spy).toBeCalledTimes(1);
            expect(spy).toBeCalledWith({predictedValue: 8, observedValue: ""})
        });

        it("update on prop change, predicted goes up a number, observed goes to none from last", () => {
            const pds = new PastDataSelector({updateProp: 0});
            const spy = jest.spyOn(pds, "setState");

            // state before the method is called
            expect(pds.state.predictedValue).toBe("");
            expect(pds.state.observedValue).toBe("");
            // setup predictedValue to go to none and observedValue to update
            pds.state.predictedValue = 28;
            pds.state.observedValue = 35;
            expect(pds.state.predictedValue).toBe(28);
            expect(pds.state.observedValue).toBe(35);

            // call the method and check the changes
            pds.componentDidUpdate({updateProp: 5}, {updateProp: 4});
            expect(spy).toBeCalledTimes(1);
            expect(spy).toBeCalledWith({predictedValue: 29, observedValue: ""})
        });

        it("update but no update prop change", () => {
            const pds = new PastDataSelector({updateProp: 0});
            const spy = jest.spyOn(pds, "setState");

            // state before the method is called
            expect(pds.state.predictedValue).toBe("");
            expect(pds.state.observedValue).toBe("");

            // call the method and check the changes
            pds.componentDidUpdate({updateProp: 0}, {updateProp: 0});
            expect(spy).toBeCalledTimes(0);
            expect(pds.state.predictedValue).toBe("");
            expect(pds.state.observedValue).toBe("");
        });
    });


    describe("method tests", () => {
        it("updateTimes generates correct menu items", () => {
            // the data that is given in the mock triggers all cases in this single test
            // set the lists to contain random numbers to check if it also resets them first
            PastDataSelector.times = [735737353, 8342, 7459563, 5347469, 35869324, 5854536];
            PastDataSelector.predictionTimes = [935238, 446832, 694, 95476, 4620052, 2352816];
            PastDataSelector.observationIntervals = [971341, 138136513, 4586345, 923, 986];
            expect(PastDataSelector.times).toStrictEqual([735737353, 8342, 7459563, 5347469, 35869324, 5854536]);
            expect(PastDataSelector.predictionTimes).toStrictEqual([935238, 446832, 694, 95476, 4620052, 2352816]);
            expect(PastDataSelector.observationIntervals).toStrictEqual([971341, 138136513, 4586345, 923, 986]);

            // update the time data lists
            PastDataSelector.updateTimes().then(() => {
                // generate result lists
                let predictionTimesResult = [];
                let observationIntervalsResult = [];
                for (let i = 0; i < 36; i++) {
                    if (i === 1 || i === 2 || i === 3 || i === 12 || i === 22 || i === 33) {
                        predictionTimesResult.push(<MenuItem disabled value={i} key={i}>{hourMins[i]}</MenuItem>);
                    } else {
                        predictionTimesResult.push(<MenuItem value={i} key={i}>{hourMins[i]}</MenuItem>);
                    }

                    if (i >= 19) {
                        if (i < 23 || i > 30) {
                            observationIntervalsResult.push(<MenuItem disabled value={i} key={i}>{hourMins[i] + " - " + hourMins[i - 19]}</MenuItem>);
                        } else {
                            observationIntervalsResult.push(<MenuItem value={i} key={i}>{hourMins[i] + " - " + hourMins[i - 19]}</MenuItem>);
                        }
                    }
                }

                // check the result of updating the times
                expect(PastDataSelector.times).toStrictEqual(times);
                expect(PastDataSelector.predictionTimes).toStrictEqual(predictionTimesResult);
                expect(PastDataSelector.observationIntervals).toStrictEqual(observationIntervalsResult);
            });
        });

        it("updates the observation timestamps to an empty list when the value is none", () => {
            const pds = new PastDataSelector({updateProp: 0});

            // state before the method is called
            expect(PastDataSelector.observedTimestamps).toStrictEqual([]);

            // call to update the observation timestamps
            pds.updateObservationTimestamps("");
            expect(PastDataSelector.observedTimestamps).toStrictEqual([]);
        });

        it("updates the observation timestamps with a number value", () => {
            const pds = new PastDataSelector({updateProp: 0});

            // state before the method is called
            expect(PastDataSelector.observedTimestamps).toStrictEqual([]);

            // generate the updated timestamps to check them
            let timestampsResult = [];
            for (let i = 0; i < 20; i++) {
                timestampsResult.push(<MenuItem value={i} key={i}>{hourMins[23 - i]}</MenuItem>);
            }

            // call to update the observation timestamps
            pds.updateObservationTimestamps(23);
            expect(PastDataSelector.observedTimestamps).toStrictEqual(timestampsResult);
        });

        it("load latest data, showing no updates are made since there is no change", () => {
            // setup
            const displayDataMethod = jest.fn();
            const pds = new PastDataSelector({updateProp: 0, displayData: displayDataMethod});
            render(pds.render());
            const element = screen.getByTestId("currently-showing");

            // state before load data is called
            expect(element).toHaveTextContent("Latest data");

            // try to load the latest data
            pds.loadData(true, false);
            expect(element).toHaveTextContent("Latest data");
            expect(displayDataMethod).toHaveBeenCalledTimes(0);
        });

        it("load latest data, when there is to be a change", () => {
            // setup
            const displayDataMethod = jest.fn();
            const pds = new PastDataSelector({updateProp: 0, displayData: displayDataMethod});
            render(pds.render());
            const element = screen.getByTestId("currently-showing");

            // state before load data is called
            expect(element).toHaveTextContent("Latest data");
            // set up the interval info so that we can load new data
            element.innerHTML = "Predictions made at: 12:05";

            // try to load the latest data
            pds.loadData(true, false);
            expect(element).toHaveTextContent("Latest data");
            expect(displayDataMethod).toHaveBeenCalledTimes(1);
            expect(displayDataMethod).toHaveBeenCalledWith(-1, true, false, []);
        });

        it("load observed data", () => {
            // setup
            const displayDataMethod = jest.fn();
            const pds = new PastDataSelector({updateProp: 0, displayData: displayDataMethod});
            render(pds.render());
            const element = screen.getByTestId("currently-showing");

            // state before load data is called
            expect(element).toHaveTextContent("Latest data");

            // try to load observed data when the none interval is still selected
            pds.loadData(false, true);
            expect(element).toHaveTextContent("Latest data");
            expect(displayDataMethod).toHaveBeenCalledTimes(0);

            // set up a time interval to be selected
            pds.state.observedValue = 27;
            expect(pds.state.observedValue).toBe(27);

            // try to load observed data after selecting a time interval
            pds.loadData(false, true);
            expect(element).toHaveTextContent("Observations from: " + hourMins[27] + " - " + hourMins[8]);
            expect(displayDataMethod).toHaveBeenCalledTimes(1);
            expect(displayDataMethod).toHaveBeenCalledWith(-1, false, true, 1654630200);
        });

        it("don't load observed data, set predicted to have data since there it could go wrong with", () => {
            // setup
            const displayDataMethod = jest.fn();
            const pds = new PastDataSelector({updateProp: 0, displayData: displayDataMethod});
            render(pds.render());
            const element = screen.getByTestId("currently-showing");

            // state before load data is called
            expect(element).toHaveTextContent("Latest data");

            // try to load observed data when the none interval is still selected
            pds.loadData(false, true);
            expect(element).toHaveTextContent("Latest data");
            expect(displayDataMethod).toHaveBeenCalledTimes(0);

            // set up a timestamp that is selected by predicted
            pds.state.predictedValue = 27;
            expect(pds.state.predictedValue).toBe(27);

            // try to load observed data after selecting a time interval
            pds.loadData(false, true);
            expect(element).toHaveTextContent("Latest data");
            expect(displayDataMethod).toHaveBeenCalledTimes(0);
        });

        it("load predicted data", () => {
            // setup
            const displayDataMethod = jest.fn();
            const pds = new PastDataSelector({updateProp: 0, displayData: displayDataMethod});
            render(pds.render());
            const element = screen.getByTestId("currently-showing");

            // state before load data is called
            expect(element).toHaveTextContent("Latest data");

            // try to load observed data when the none interval is still selected
            pds.loadData(false, true);
            expect(element).toHaveTextContent("Latest data");
            expect(displayDataMethod).toHaveBeenCalledTimes(0);

            // set up a time interval to be selected
            pds.state.predictedValue = 21;
            expect(pds.state.predictedValue).toBe(21);

            // try to load predicted data after selecting a time interval
            pds.loadData(false, false);
            expect(element).toHaveTextContent("Predictions made at: " + hourMins[21]);
            expect(displayDataMethod).toHaveBeenCalledTimes(1);
            expect(displayDataMethod).toHaveBeenCalledWith(-1, false, false, 1654632000);
        });

        it("don't load predicted data, set observed to have data since there it could go wrong with", () => {
            // setup
            const displayDataMethod = jest.fn();
            const pds = new PastDataSelector({updateProp: 0, displayData: displayDataMethod});
            render(pds.render());
            const element = screen.getByTestId("currently-showing");

            // state before load data is called
            expect(element).toHaveTextContent("Latest data");

            // try to load observed data when the none interval is still selected
            pds.loadData(false, true);
            expect(element).toHaveTextContent("Latest data");
            expect(displayDataMethod).toHaveBeenCalledTimes(0);

            // set up a timestamp that is selected by predicted
            pds.state.predictedValue = 24;
            expect(pds.state.predictedValue).toBe(24);

            // try to load observed data after selecting a time interval
            pds.loadData(false, true);
            expect(element).toHaveTextContent("Latest data");
            expect(displayDataMethod).toHaveBeenCalledTimes(0);
        });
    });
});

// mock for the fetch data availability method
global.fetch = jest.fn((url) => {
        if(url === "api/available") {
            return Promise.resolve({
                json: () => Promise.resolve(
                        {
                            store_data: "true",
                            predictions_stored: [1654626300, 1654626600, 1654626900, 1654627200, 1654627500, 1654627800,
                                1654628100, 1654628700, 1654629000, 1654629300, 1654629600, 1654629900,
                                1654630200, 1654630500, 1654630800, 1654631100, 1654631400, 1654632000,
                                1654632300, 1654632600, 1654632900, 1654633200, 1654633500, 1654633800,
                                1654634100, 1654634400, 1654635000, 1654635300, 1654635600, 1654635900,
                                1654636200, 1654636500, 1654636800, 1654637100, 1654638300],
                            observations_stored: [1654626300, 1654626600, 1654626900, 1654627200, 1654627500,
                                1654627800, 1654628100, 1654628400, 1654628700, 1654629300, 1654629600, 1654629900,
                                1654630200, 1654630500, 1654630800, 1654631100, 1654631400, 1654631700, 1654632000,
                                1654632300, 1654632600, 1654632900, 1654633200, 1654633500, 1654633800, 1654634100,
                                1654634400, 1654634700, 1654635000, 1654635300, 1654635600, 1654635900, 1654636200,
                                1654636500, 1654636800, 1654637100]
                        }
                    ),
              })
        }
    }
);