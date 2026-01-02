import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, clearError } from './authSlice';
import { useNavigate } from 'react-router-dom';

const Login = ({ onSwitch }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const dispatch = useDispatch();
  const navigate = useNavigate(); // 2. Initialize navigate

  
  // 3. Pull 'user' from state
  const { error, loading, user } = useSelector((state) => state.auth);

// 4. If user exists, kick them to the home page immediately
useEffect(() => {
    if (user) {
      navigate('/'); 
    }
  }, [user, navigate]);


  // Clear any existing errors when the component first loads
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    // credentials must match what your backend expects
    dispatch(loginUser({ email, password }));
  };

  
    const handleGoogleLogin = () => {
      // Redirect the browser to the backend route
      //window.location.href = 'http://localhost:3000/api/auth/google';

      const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
  
      window.location.href = `${backendUrl}/auth/google`;

    };
    
   

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <h2 style={styles.title}>Login</h2>
        <p style={styles.subtitle}>Enter your credentials to access your account</p>
        
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email Address</label>
            <input 
              type="email" 
              placeholder="name@example.com"
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input 
              type="password" 
              placeholder="••••••••"
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              style={styles.input}
            />
          </div>

          {/* Error message from backend */}
          {error && <div style={styles.errorBox}>{error}</div>}
          
          <button 
            type="submit" 
            disabled={loading} 
            style={{...styles.button, backgroundColor: loading ? '#ccc' : '#007bff'}}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div style={styles.footer}>
          <span>Don't have an account?</span>
          <button onClick={onSwitch} style={styles.switchBtn}>
            Register here
          </button>
        </div>

        {/* Google Login Button */}
        <button type="button" className="btn-google" onClick={handleGoogleLogin}>
          <img 
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
            alt="Google icon" 
          />
          Continue with Google
        </button>
      </div>
    </div>
  );
};

// Simple inline styles to get you started
const styles = {
  wrapper: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '80vh',
    backgroundColor: '#f8f9fa'
  },
  card: {
    width: '100%',
    maxWidth: '400px',
    padding: '40px',
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
  },
  title: { margin: '0 0 10px 0', textAlign: 'center', color: '#333' },
  subtitle: { margin: '0 0 25px 0', textAlign: 'center', color: '#666', fontSize: '14px' },
  form: { display: 'flex', flexDirection: 'column' },
  inputGroup: { marginBottom: '20px' },
  label: { display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '14px' },
  input: {
    width: '100%',
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    boxSizing: 'border-box' // Ensures padding doesn't affect width
  },
  errorBox: {
    padding: '10px',
    marginBottom: '20px',
    backgroundColor: '#fff1f0',
    border: '1px solid #ffa39e',
    color: '#cf1322',
    borderRadius: '4px',
    fontSize: '14px'
  },
  button: {
    padding: '12px',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
    transition: 'background-color 0.2s'
  },
  footer: { marginTop: '25px', textAlign: 'center', fontSize: '14px' },
  switchBtn: {
    background: 'none',
    border: 'none',
    color: '#007bff',
    cursor: 'pointer',
    textDecoration: 'underline',
    marginLeft: '5px'
  }
};

export default Login;