import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getData, setSelectedCat, setIsExpanded } from "./DashboardSlice";

import GenericCat from '../../components/GenericCat.jsx';
import { Avatar, Badge, Button, IconButton, Stack, Typography } from '@mui/material';
import { CreditCard, Delete, Event, Notifications as NotificationIcon, LocalActivity, Person, Receipt, Timeline } from '@mui/icons-material';
import './Dashboard.css';

//import DashboardCat from './DashboardCat/DashboardCat.jsx';

const Dashboard = (props) => {

    const dispatch = useDispatch();
    useEffect(() => { dispatch(getData()) }, []);

    //const { logout, user, isAuthenticated, isLoading, loginWithRedirect } = useAuth0();
    const user = {
        given_name: 'admin',
        family_name: 'admin',
        picture: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSVhtFJc9v3hEBfhJiOhYMS_60ieEbiOjPJyxl8F2dIBw&s'
    };

    const Sidebar = () => {

        const isExpanded = useSelector(state => state.dashboard.isExpanded);
        const schema = useSelector(state => state.dashboard.data?.schema);

        const Logo = () => {
            return (<div className="logo-container">
                <img
                    src="https://www.blender.org/wp-content/uploads/2020/07/blender_logo_no_socket_white.png"
                    alt="Descripción"
                    className="logo-image" />
            </div>)
        }

        const SidebarOptions = () => {

            return (<div className="sidebar-category-options">
                {Object.keys(schema || {}).filter(x => !x.includes('knex') && !x.includes('cdc')).map((cat, i) => {
                    const onClick = (e) => e.stopPropagation() || dispatch(setSelectedCat(cat));
                    return <div onClick={onClick} className="sidebar-category-button" key={`sidebar-btn-${cat}`}>
                        <IconButton children={<Receipt className="sidebar-category-button-icon" />} />
                        <Button className="sidebar-category-button-text" children={cat.toUpperCase()} />
                    </div>
                })}
            </div>)
        }

        const Profile = () => {
            return (<Avatar className="sidebar-profile" alt={`${user.given_name} ${user.family_name}`} src={user.picture} />)
        }

        const Notifications = () => {
            return (<Badge className="sidebar-notifications" badgeContent={4} color="primary" > <NotificationIcon color="action" /> </Badge>)
        }

        return (<div className={`sidebar ${isExpanded ? 'expanded' : ''}`} onClick={e => dispatch(setIsExpanded(!isExpanded))}>
            <Logo />
            <SidebarOptions />
        </div>);
    };

    const TopRigth = () => {
        const Profile = () => {
            return (<Avatar alt={`${user.given_name} ${user.family_name}`} src={user.picture} />)
        }

        const Notifications = () => {
            return (<Badge className="sidebar-notifications" badgeContent={4} color="info" >
                <NotificationIcon color="terciary" />
            </Badge>)
        }
        return (<div className="sidebar-profile">
            <Notifications />
            <Profile />

        </div>);
    };

    const Main = () => {
        const isExpanded = useSelector(state => state.dashboard.isExpanded);
        const schema = useSelector(state => state.dashboard.data?.schema);
        const selectedCat = useSelector(state => state.dashboard.selectedCat);

        return <div className={`main-content ${isExpanded ? 'expanded' : ''}`}>
            {(schema && selectedCat) ? <GenericCat selectedCat={selectedCat} auth={{}} /> : null};
        </div>
    };

    return (<div className="container">
        <Sidebar />
        <TopRigth />
        <Main />
    </div>)
}

// export default withAuthenticationRequired(Dashboard, { onRedirecting: () => <h1>Redirecting</h1> });
export default Dashboard;