import React, { useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import history from "../lib/utils/history.js";
import Landing from './Landing/Landing.jsx';
import Dashboard from './Dashboard/Dashboard.jsx';
import theme from '../theme.js';

//Inject theme vars into css
const themeToCSSVariables = () => {
    let cssVars = '';
    Object.keys(theme.palette).forEach(key => {
        const color = theme.palette[key];
        Object.keys(color).forEach(shade => {
            cssVars += `--${key}-${shade}: ${color[shade]};\n`;
        });
    });
    document.documentElement.style.cssText += cssVars;
};

const Pages = (props) => {

    //Inject theme vars into css
    useEffect(() => { themeToCSSVariables() }, []);

    //const { isLoading } = useAuth0();
    //if (isLoading) { return <h1>Is Loading</h1> }

    return (<Router history={history}>
        <div id="app" className="d-flex flex-column h-100">
            <Routes>
                {/* <Route exact path="/" element={<Landing />} /> */}
                {/* <Route path="/dashboard" element={<Dashboard />} /> */}
                <Route path="/*" element={<Dashboard />} /> 
            </Routes>
        </div>
    </Router>)
}

export default Pages