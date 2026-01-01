import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCredentials } from './authSlice';

const LoginSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');

    if (token) {
      // 1. Save to localStorage IMMEDIATELY (Sync)
      localStorage.setItem('token', token);
      
      // 2. Update Redux
      dispatch(setCredentials({ token }));

      // 3. Wait a tiny bit or just navigate
      // Navigating home will trigger the App.js useEffect/checkAuthStatus
      navigate('/', { replace: true });
    }
  }, [dispatch, navigate, location]);

  return <div>Logging you in...</div>;
};

export default LoginSuccess;