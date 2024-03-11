import { useSelector, useDispatch } from "react-redux";
import { useState } from "react";
import {
    Button, Card, CardActions, CardContent, CircularProgress, Dialog, DialogActions,
    DialogContent, DialogTitle, DialogContentText, TextField, Typography
} from '@mui/material';
import './SignIn.css';
import { signIn, cleanError } from "../../redux/reducers/authSlice.js";

const SignIn = (props) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const dispatch = useDispatch();

    const ErrorMessage = () => {

        const error = useSelector(state => state.auth.error);

        return <Dialog open={error != null}  >
            <DialogTitle >
                {"Error al logearse!"}
            </DialogTitle>
            <DialogContent>
                <DialogContentText >
                    {error}
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={e => dispatch(cleanError())} autoFocus>
                    Agree
                </Button>
            </DialogActions>
        </Dialog>
    };

    const LoadingDialog = () => {
        const fetching = useSelector(state => state.auth.fetching);
        //const fetching = useSelector(state => state.genericCat.fetching);
        return <Dialog open={fetching > 0}
            PaperProps={{ style: { backgroundColor: 'transparent', boxShadow: 'none' } }}
            BackdropProps={{ sx: { backgroundColor: 'rgba(0, 0, 0, 0.75)', } }}
        >
            <DialogContent sx={{ backgroundColor: 'transparent', overflow: "hidden" }}>
                <CircularProgress sx={{ color: 'var(--primary-contrastText) !important' }} />
            </DialogContent>
        </Dialog>

    };

    return (<>
        <ErrorMessage />
        <LoadingDialog />
        <main className="main">
            <section className="contact">
                <Card>
                    <CardContent>
                        <Typography sx={{ fontSize: 16 }} color="text.secondary" gutterBottom>
                            Logearse
                        </Typography>
                        <div style={{ paddingTop: '1rem' }}>
                            <TextField id="email" label="Email" value={email}
                                onChange={e => setEmail(e.target.value)} variant="outlined" />
                        </div>
                        <div style={{ paddingTop: '1rem' }}>
                            <TextField id="password" label="Password" value={password} type="password"
                                onChange={e => setPassword(e.target.value)} variant="outlined" />
                        </div>
                    </CardContent>
                    <CardActions>
                        <Button onClick={e => dispatch(signIn({ email, password }))}>Login</Button>
                    </CardActions>
                </Card>

            </section>
        </main></>)

}

export default SignIn





