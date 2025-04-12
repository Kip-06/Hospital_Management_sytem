// src/hooks/useProtectedNavigation.ts
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../authentication context/aunthenticationContextPage';

/**
 * Custom hook for handling navigation to protected routes
 * Returns a function that navigates to the specified path if authenticated,
 * or redirects to sign-in with a saved redirect path if not authenticated
 * 
 * @returns {(path: string) => void} - Navigation function
 */
const useProtectedNavigation = (): ((path: string) => void) => {
  const navigate = useNavigate();
  const { isAuthenticated, setRedirectPath } = useAuth();

  const navigateTo = (path: string): void => {
    if (isAuthenticated) {
      // User is authenticated, navigate directly to the path
      navigate(path);
    } else {
      // User is not authenticated, store the path and redirect to sign in
      setRedirectPath(path);
      navigate('/signin');
    }
  };

  return navigateTo;
};

export default useProtectedNavigation;