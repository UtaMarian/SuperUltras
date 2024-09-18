import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import AuthContext from './AuthContext';

const PrivateRoute = ({ component: Component, allowedRoles, ...rest }) => {
  const { isAuthenticated, loading, user } = useContext(AuthContext);

  if (loading) return <div>Loading...</div>;

  // Check if the user's role is included in the allowedRoles array
  const userHasRequiredRole = allowedRoles
    ? allowedRoles.includes(user?.user.role) // user.role is a single string
    : true;

  return isAuthenticated && userHasRequiredRole ? (
    <Component {...rest} />
  ) : (
    <Navigate to="/login" />
  );
};

export default PrivateRoute;
