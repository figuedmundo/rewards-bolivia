import React from 'react';
import GoogleSignInButton from '../components/GoogleSignInButton';

const RegisterPage: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <h1>Register</h1>
      <div style={{ marginBottom: '20px' }}>
        <input type="text" placeholder="Name" style={{ padding: '10px', width: '300px', marginBottom: '10px' }} />
        <input type="email" placeholder="Email" style={{ padding: '10px', width: '300px', marginBottom: '10px' }} />
        <input type="password" placeholder="Password" style={{ padding: '10px', width: '300px' }} />
      </div>
      <button style={{ padding: '10px 20px', width: '320px', marginBottom: '10px' }}>Register</button>
      <GoogleSignInButton />
    </div>
  );
};

export default RegisterPage;
