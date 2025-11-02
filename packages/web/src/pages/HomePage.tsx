import { useAuth } from '../hooks';

const HomePage = () => {
  const { logout } = useAuth();

  return (
    <div>
      <h2>Welcome to the Home Page</h2>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

export default HomePage;
