import React from "react";
import { render } from "react-dom";
import App from "./components/App.jsx";
import * as io from 'socket.io-client';
import { BrowserRouter } from "react-router-dom";
render(
    <BrowserRouter>
        <App socket={io("http://localhost:3000")} />
    </BrowserRouter>,
    document.getElementById("root")
);
