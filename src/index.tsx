import React from "react";
import ReactDOM from "react-dom";
import { App } from "./components/app";
import "./index.scss";


const render = () => {
    ReactDOM.render(
        <App />,
        document.getElementById("app")
    );
};

window.setTimeout(render, 2000);
