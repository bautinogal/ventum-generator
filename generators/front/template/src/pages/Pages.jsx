import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useAuth0 } from "@auth0/auth0-react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import history from "../lib/utils/history.js";
import SignIn from './SignIn/SignIn.jsx';
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

    const auth = useSelector(state => state.auth.data?.jwt);
    //Inject theme vars into css
    useEffect(() => { themeToCSSVariables() }, []);

    return (<Router history={history}>
        <div id="app" className="d-flex flex-column h-100">
            <Routes>
                <Route path="/*" element={auth ? <Dashboard /> : <SignIn />} />
            </Routes>
        </div>
    </Router>)
}

export default Pages