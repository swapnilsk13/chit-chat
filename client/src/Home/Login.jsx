import React from 'react';
import Button from '@material-ui/core/Button';
import { Formik } from 'formik';
import Grid from '@material-ui/core/Grid';
import Link from '@material-ui/core/Link';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import * as Yup from 'yup';

import history from '../Utilities/history';
import { useLogin } from '../Services/authenticationService';

const useStyles = makeStyles(theme => ({
    paper: {
        marginTop: theme.spacing(8),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    form: {
        width: '100%',
        marginTop: theme.spacing(1),
    },
    submit: {
        margin: theme.spacing(3, 0, 2),
    },
}));

const Login = props => {
    const login = useLogin();
    const classes = useStyles();

    return (
        <div className={classes.paper}>
            <Grid container>
                <Grid item>
                    <Typography component="h1" variant="h5" align="center">
                        Sign in
                    </Typography>
                    <Formik
                        initialValues={{
                            userName: '',
                            password: '',
                        }}
                        validationSchema={Yup.object().shape({
                            userName: Yup.string()
                                .required('userName is required')
                                .max(40, 'userName is too long'),
                            password: Yup.string()
                                .required('Password is required')
                                .max(100, 'Password is too long')
                                .min(6, 'Password too short'),
                        })}
                        onSubmit={(
                            { userName, password },
                            { setStatus, setSubmitting }
                        ) => {
                            setStatus();
                            login(userName, password).then(
                                () => {
                                    const { from } = history.location.state || {
                                        from: { pathname: '/chat' },
                                    };
                                    history.push(from);
                                },
                                error => {
                                    setSubmitting(false);
                                    setStatus(error);
                                }
                            );
                        }}
                    >
                        {({
                            handleSubmit,
                            handleChange,
                            values,
                            touched,
                            errors,
                        }) => (
                            <form
                                onSubmit={handleSubmit}
                                className={classes.form}
                            >
                                <TextField
                                    id="userName"
                                    className={classes.textField}
                                    name="userName"
                                    label="userName"
                                    fullWidth={true}
                                    variant="outlined"
                                    margin="normal"
                                    required={true}
                                    helperText={
                                        touched.userName ? errors.userName : ''
                                    }
                                    error={
                                        touched.userName &&
                                        Boolean(errors.userName)
                                    }
                                    value={values.userName}
                                    onChange={handleChange}
                                />
                                <TextField
                                    id="password"
                                    className={classes.textField}
                                    name="password"
                                    label="Password"
                                    fullWidth={true}
                                    variant="outlined"
                                    margin="normal"
                                    required={true}
                                    helperText={
                                        touched.password ? errors.password : ''
                                    }
                                    error={
                                        touched.password &&
                                        Boolean(errors.password)
                                    }
                                    value={values.password}
                                    onChange={handleChange}
                                    type="password"
                                />
                                <Button
                                    type="submit"
                                    fullWidth={true}
                                    variant="contained"
                                    color="primary"
                                    className={classes.submit}
                                >
                                    Login
                                </Button>
                            </form>
                        )}
                    </Formik>
                </Grid>
                <Grid item xs={9}>
                    <Typography>
                        <Link
                            onClick={() => props.handleClick('register')}
                            href="#"
                        >
                            Don't have an account?
                        </Link>
                    </Typography>
                </Grid>
            </Grid>
        </div>
    );
};

export default Login;
