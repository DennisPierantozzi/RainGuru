import React from "react";
import "@testing-library/jest-dom/extend-expect";
import Communication from "../../src/components/Communication";
import Popup from "react-popup";


jest.mock('react-popup', () => ({ alert: jest.fn() }))
jest.mock("../../src/components/Map/Map", () => ({ preloadedImages: jest.fn() }))

beforeEach(() => {
  fetch.mockClear();
});

describe("Communication tests", () => {

    it("fetches urls", async () => {
        await Communication.fetchUrls();
        expect(Communication.getUseLatestData()).toEqual(true);
        expect(Communication.getDataCollected()).toEqual(true);
        expect(Communication.getImageUrls()).toEqual(["url1", "url2"]);
        expect(Communication.getLatestTimestamp()).toEqual(0);
        expect(Communication.getRequestTimestamp()).toEqual([]);
        expect(Communication.getDataTimestamp()).toEqual(new Date("2018-06-01T13:13:00.000Z"));
        expect(Popup.alert).toHaveBeenCalledWith("Message from server:\nQuota exceeded!" , "Warning: Model might be using old data.");
    });


    it("fetches precipitation", async () => {
        const precipitation = await Communication.fetchPrecipitation(300, 200)
        expect(precipitation).toEqual([1, 2, 3, 4, 5, 6, 7])
    });

    it("checks new data same timestamp", async () => {
        Communication.latestTimestamp = 1654627800;
        const dataUpdated = await Communication.checkNewData();
        expect(dataUpdated).toEqual(false);
    });

    it("checks new data different timestamp", async () => {
        Communication.latestTimestamp = 1654627500;
        const dataUpdated = await Communication.checkNewData();
        expect(dataUpdated).toEqual(true);
    });

    it("fetches availability", async () => {
            const result = await Communication.fetchDataAvailability()
            expect(result).toEqual({
                                   available: "true",
                                   predictedTimes: [1654626300, 1654626600, 1654626900, 1654627200, 1654627500, 1654627800,
                                       1654628100, 1654628700, 1654629000, 1654629300, 1654629600, 1654629900,
                                       1654630200, 1654630500, 1654630800, 1654631100, 1654631400, 1654632000,
                                       1654632300, 1654632600, 1654632900, 1654633200, 1654633500, 1654633800,
                                       1654634100, 1654634400, 1654635000, 1654635300, 1654635600, 1654635900,
                                       1654636200, 1654636500, 1654636800, 1654637100, 1654638300],
                                   observedTimes: [1654626300, 1654626600, 1654626900, 1654627200, 1654627500,
                                       1654627800, 1654628100, 1654628400, 1654628700, 1654629300, 1654629600, 1654629900,
                                       1654630200, 1654630500, 1654630800, 1654631100, 1654631400, 1654631700, 1654632000,
                                       1654632300, 1654632600, 1654632900, 1654633200, 1654633500, 1654633800, 1654634100,
                                       1654634400, 1654634700, 1654635000, 1654635300, 1654635600, 1654635900, 1654636200,
                                       1654636500, 1654636800, 1654637100]
                               })
        });
});

global.fetch = jest.fn((url) =>
    {
        if(url == "api/fetch?observed=false") {
            return Promise.resolve({
                json: () => Promise.resolve(
                        {
                            timestamp: "1527858780",
                            exception_active: "true",
                            exception_message: "Quota exceeded!",
                            urls: ["url1", "url2"]
                        }
                    ),
              })
        } else if(url == "api/precipitation?x=" + 300 + "&y=" + 200 + "&observed=false") {
            return Promise.resolve({
                json: () => Promise.resolve(
                        {
                            precipitation: [1, 2, 3, 4, 5, 6, 7]
                        }
                    ),
              })
        } else if (url === "api/available") {
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
        } else if(url == "api/check") {
             return Promise.resolve({
                 json: () => Promise.resolve(
                         {
                             timestamp: 1654627800
                         }
                     ),
               })
        }
    }

);