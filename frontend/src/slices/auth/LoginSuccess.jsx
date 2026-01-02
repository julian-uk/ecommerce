import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCredentials } from './authSlice';

const LoginSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  useEffect(() => {
    console.log("LoginSuccess component mounted"); // 1
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    console.log("Token found:", !!token); // 2

    if (token) {
      localStorage.setItem('token', token);
      console.log("Token saved to localStorage"); // 3
      dispatch(setCredentials({ token }));
      console.log("Dispatched to Redux"); // 4
      navigate('/', { replace: true });
    }
  }, [dispatch, navigate, location]);
  
  return <div>Logging you in...</div>;
};

export default LoginSuccess;