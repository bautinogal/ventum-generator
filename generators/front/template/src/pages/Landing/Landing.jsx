import { useAuth0 } from "@auth0/auth0-react";
import './Landing.css';

const Landing = (props) => {
    const { loginWithRedirect } = useAuth0();
    return (<>
    <div className="overlay"></div>
    <div className="stars" aria-hidden="true"></div>
    <div className="starts2" aria-hidden="true"></div>
    <div className="stars3" aria-hidden="true"></div>
    <main className="main">
        <section className="contact">
            <img src="./seathitchlogowhite.png" className="responsive" alt=""></img>
            <h2 className="sub-title">Comming soon! <br></br> Website under construction</h2>	
            <button className="btn" onClick={e => loginWithRedirect({ appState: { targetUrl: "/dashboard" } })}>Login</button>
            <img src="./public/seat.png" className="fix" alt=""></img>
        </section>
    </main></>)

}

export default Landing


	


