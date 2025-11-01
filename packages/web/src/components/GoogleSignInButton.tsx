import React from 'react';

const GoogleSignInButton: React.FC = () => {
  const handleGoogleSignIn = () => {
    // Redirect to the backend endpoint that starts the Google OAuth flow
    window.location.href = '/api/auth/google';
  };

  return (
    <button
      onClick={handleGoogleSignIn}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '10px 15px',
        fontSize: '16px',
        fontWeight: 'bold',
        cursor: 'pointer',
        border: '1px solid #ccc',
        borderRadius: '4px',
        backgroundColor: '#fff',
        color: '#757575',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      }}
    >
      <img
        src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg"
        alt="Google logo"
        style={{ width: '20px', height: '20px', marginRight: '10px' }}
      />
      Sign in with Google
    </button>
  );
};

export default GoogleSignInButton;
