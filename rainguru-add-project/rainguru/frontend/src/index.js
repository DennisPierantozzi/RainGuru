import React from "react";
import {createRoot} from "react-dom/client";
import LoadingScreen from "./components/LoadingScreen";
import App from "./components/App";

// render the app, the layout first and the components second
const AppDiv = document.getElementById("app");
const AppRoot = createRoot(AppDiv);
AppRoot.render([<LoadingScreen/>]);
App.renderSetup();