import { useAuth } from '../hooks';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold mb-6">Welcome to the Home Page</h2>
      <div className="flex gap-4">
        <button
          onClick={() => navigate('/wallet')}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Go to Wallet
        </button>
        <button
          onClick={() => navigate('/settings')}
          className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
        >
          Settings
        </button>
        <button
          onClick={logout}
          className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default HomePage;
