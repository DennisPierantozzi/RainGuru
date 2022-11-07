import React from "react";
import {render, screen} from "@testing-library/react";
import renderer from "react-test-renderer";
import "@testing-library/jest-dom/extend-expect";
import App from "../../src/components/App";
import Communication from "../../src/components/Communication";
import Map from "../../src/components/Map/Map";

const imageUrlsUsed = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9",
        "10", "11", "12", "13", "14", "15", "16", "17", "18", "19"]

beforeEach(() => {
    // set up communication with fake image urls
    Communication.imageUrls = imageUrlsUsed;

    // mock the search functionality since it gives problems when testing
    Map.addMapSearch = jest.fn();

    // set up communication with a timestamp (23:50), so it can't break the tests since it will be requested in most
    // use a correction for timezones so each timezone runs it with the same local time to keep the tests intact
    const timeZoneOffset = ((new Date()).getTimezoneOffset()) * 60;
    Communication.dataTimestamp = new Date(1000 * (1653263400 + timeZoneOffset));
});

describe("App tests", () => {
    it("matches snapshot", () => {
        const app = new App();
        app.componentDidMount = jest.fn(() => {
            Map.render();
        });

        render(<div id="main" data-testid="main">app.render()</div>);
        const state = renderer.create(screen.getByTestId("main").innerHTML).toJSON();
        expect(state).toMatchSnapshot();
    });


    it("renders the app", () => {
        const app = new App();
        app.componentDidMount = jest.fn(() => {
            Map.render();
        });

        render(<div id="main" data-testid="main">app.render()</div>);
        const element = screen.getByTestId("main");
        expect(element).toBeTruthy();
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