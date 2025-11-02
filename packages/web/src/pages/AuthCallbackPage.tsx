import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks';

const AuthCallbackPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const accessToken = params.get('accessToken');
    // You could also grab and store the refreshToken here if you adapt the login function

    if (accessToken) {
      console.log('AuthCallbackPage: Access token found, logging in...');
      login(accessToken);
      // Navigate to the home page after successful login
      navigate('/', { replace: true });
    } else {
      console.error('AuthCallbackPage: No access token found in URL');
      // Handle error, maybe navigate to login with an error message
      navigate('/login', { replace: true });
    }
  }, [login, navigate, location]);

  return <div>Loading...</div>;
};

export default AuthCallbackPage;