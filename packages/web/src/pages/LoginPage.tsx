import React from 'react';
import GoogleSignInButton from '../components/GoogleSignInButton';

const LoginPage: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <h1>Login</h1>
      <div style={{ marginBottom: '20px' }}>
        <input type="email" placeholder="Email" style={{ padding: '10px', width: '300px', marginBottom: '10px' }} />
        <input type="password" placeholder="Password" style={{ padding: '10px', width: '300px' }} />
      </div>
      <button style={{ padding: '10px 20px', width: '320px', marginBottom: '10px' }}>Login</button>
      <GoogleSignInButton />
    </div>
  );
};

export default LoginPage;
