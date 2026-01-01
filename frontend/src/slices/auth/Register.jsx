import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser, clearError } from './authSlice';

const Register = ({ onSwitch }) => {
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const dispatch = useDispatch();
  const { error, loading } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(registerUser(formData));
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <h2 style={styles.title}>Create Account</h2>
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Username</label>
            <input 
              type="text" 
              placeholder="johndoe"
              onChange={(e) => setFormData({...formData, username: e.target.value})} 
              required style={styles.input}
            />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email Address</label>
            <input 
              type="email" 
              placeholder="name@example.com"
              onChange={(e) => setFormData({...formData, email: e.target.value})} 
              required style={styles.input}
            />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input 
              type="password" 
              placeholder="••••••••"
              onChange={(e) => setFormData({...formData, password: e.target.value})} 
              required style={styles.input}
            />
          </div>

          {error && <div style={styles.errorBox}>{error}</div>}
          
          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <div style={styles.footer}>
          <span>Already have an account?</span>
          <button onClick={onSwitch} style={styles.switchBtn}>Login here</button>
        </div>
      </div>
    </div>
  );
};

// Use the same styles object from your Login.jsx for consistency
const styles = {
  wrapper: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', backgroundColor: '#f8f9fa' },
  card: { width: '100%', maxWidth: '400px', padding: '40px', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' },
  title: { textAlign: 'center', marginBottom: '25px' },
  form: { display: 'flex', flexDirection: 'column' },
  inputGroup: { marginBottom: '15px' },
  label: { display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: 'bold' },
  input: { width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' },
  button: { padding: '12px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' },
  errorBox: { padding: '10px', backgroundColor: '#fff1f0', color: '#cf1322', marginBottom: '15px', borderRadius: '4px' },
  footer: { marginTop: '20px', textAlign: 'center' },
  switchBtn: { background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', textDecoration: 'underline' }
};

export default Register;