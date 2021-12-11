import React from "react";
import ReactDOM from "react-dom";
import { App } from "./components/app";

import "./index.scss";

setTimeout( () => {
        ReactDOM.render(
            <App/>,
            document.getElementById("app")
        );
    }, 2000);
