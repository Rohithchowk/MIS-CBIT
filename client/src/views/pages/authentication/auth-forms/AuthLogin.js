import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import axios from 'axios';
import {
  Button,
  CircularProgress,
  FormControl,
  FormHelperText,
  Typography,
  Checkbox,
  Alert,
  InputLabel,
  OutlinedInput,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import * as Yup from 'yup';
import { Formik } from 'formik';
import { FormControlLabel } from '@mui/material';

const FirebaseLogin = ({ ...others }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleLogin = async (values, actions) => {
    setLoading(true);
    try {
      const response = await axios.post('https://miscbit-10.onrender.com/auth/login', values);
      const { token, usertype } = response.data;
      localStorage.setItem('token', token);
      if (usertype === 'admin') {
        localStorage.setItem('role', 'admin');
      } else {
        localStorage.setItem('role', 'user');
      }
      setLoading(false);
      setSuccessMessage('Login Successful!');
      navigate('/');
      window.location.reload();
    } catch (error) {
      if (error.response && error.response.status === 401) {
        setError('Incorrect email or password. Please try again.');
      } else {
        setError('An error occurred. Please try again later.');
      }
      setLoading(false);
      actions.resetForm();
    }
  };

  const handleForgotPassword = async (email) => {
    setLoading(true);
    try {
      await axios.post('http://localhost:8000/auth/forgot-password', { email });
      setSuccessMessage('An email with instructions for resetting your password has been sent.');
    } catch (error) {
      setError('Failed to initiate password reset. Please try again later.');
    }
    setLoading(false);
  };

  return (
    <>
      <Dialog
  open={forgotPasswordOpen}
  PaperProps={{
    sx: {
      maxWidth: '100%', // Adjust to take full width on smaller screens
      width: '80%', // Adjust to take full width on smaller screens
      margin: '0', // Remove margin to fit full width
      padding: '16px', // Add padding for better spacing
    }
  }}
  onClose={() => setForgotPasswordOpen(false)}
>
  <DialogTitle>Forgot Password</DialogTitle>
  <DialogContent>
    <Formik
      initialValues={{ email: '' }}
      validationSchema={Yup.object().shape({
        email: Yup.string().email('Must be a valid email').max(255).required('Email is required')
      })}
      onSubmit={(values, actions) => {
        handleForgotPassword(values.email);
        actions.setSubmitting(false);
        setForgotPasswordOpen(false);
      }}
    >
      {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => (
        <form onSubmit={handleSubmit}>
          <FormControl fullWidth style={{ marginTop: '10px' }}>
            <InputLabel htmlFor="outlined-adornment-forgot-email" sx={{ marginBottom: '8px' }}>
              Email Address
            </InputLabel>
            <OutlinedInput
              id="outlined-adornment-forgot-email"
              type="email"
              value={values.email}
              name="email"
              onBlur={handleBlur}
              onChange={handleChange}
              label="Email Address"
              sx={{
                padding: '12px', // Adjust padding for smaller screens
                '& .MuiInputLabel-root': {
                  transform: 'none' // Remove label transform
                }
              }}
            />
            {touched.email && errors.email && <FormHelperText error>{errors.email}</FormHelperText>}
          </FormControl>
          <DialogActions>
            <Button onClick={() => setForgotPasswordOpen(false)} color="primary">
              Cancel
            </Button>
            <Button type="submit" color="primary" variant="contained">
              Submit
            </Button>
          </DialogActions>
        </form>
      )}
    </Formik>
  </DialogContent>
</Dialog>


      <Formik
        initialValues={{ email: email, password: '' }}
        validationSchema={Yup.object().shape({
          email: Yup.string().email('Must be a valid email').max(255).required('Email is required'),
          password: Yup.string().max(255).required('Password is required')
        })}
        onSubmit={(values, actions) => {
          handleLogin(values, actions);
        }}
      >
        {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => (
          <form noValidate onSubmit={handleSubmit} {...others}>
            <FormControl fullWidth error={Boolean(touched.email && errors.email)}>
              <InputLabel htmlFor="outlined-adornment-email-login">Email Address / Username</InputLabel>
              <OutlinedInput
                id="outlined-adornment-email-login"
                type="email"
                value={values.email}
                name="email"
                onBlur={handleBlur}
                onChange={handleChange}
                label="Email Address / Username"
              />
              {touched.email && errors.email && <FormHelperText error>{errors.email}</FormHelperText>}
            </FormControl>

            <div style={{ marginBottom: '20px' }} />

            <FormControl fullWidth error={Boolean(touched.password && errors.password)}>
              <InputLabel htmlFor="outlined-adornment-password-login">Password</InputLabel>
              <OutlinedInput
                id="outlined-adornment-password-login"
                type="password"
                value={values.password}
                name="password"
                onBlur={handleBlur}
                onChange={handleChange}
                label="Password"
              />
              {touched.password && errors.password && <FormHelperText error>{errors.password}</FormHelperText>}
            </FormControl>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {successMessage && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {successMessage}
              </Alert>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <FormControlLabel
                control={<Checkbox color="primary" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />}
                label="Remember me"
              />
              <Typography
                variant="subtitle1"
                color="secondary"
                style={{ textDecoration: 'none', cursor: 'pointer' }}
                onClick={() => setForgotPasswordOpen(true)}
              >
                Forgot Password?
              </Typography>
            </div>

            <Button disableElevation disabled={isSubmitting} fullWidth size="large" type="submit" variant="contained" color="secondary">
              {loading ? <CircularProgress size={24} /> : 'Sign in'}
            </Button>
          </form>
        )}
      </Formik>
    </>
  );
};

export default FirebaseLogin;
