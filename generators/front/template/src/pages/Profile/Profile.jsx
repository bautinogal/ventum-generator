import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react";

const Profile = (props) => {
    const { logout, user, isAuthenticated, isLoading, loginWithRedirect } = useAuth0();
    return (<div>
        <img src={user.picture} alt={user.name} />
        <h2>{user.name}</h2>
        <p>{user.email}</p>
        <button onClick={logout}>logout</button>
    </div>)
}

export default withAuthenticationRequired(Profile, { onRedirecting: () => <h1>Redirecting</h1> });
