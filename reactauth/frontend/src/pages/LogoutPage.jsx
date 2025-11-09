import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LogoutPage = () => {
  const navigate = useNavigate();
  const { clearAuth } = useAuth();

  useEffect(() => {
    clearAuth();
    navigate('/login', { replace: true });
  }, [clearAuth, navigate]);

  return (
    <div className="page-loading">
      <p>Signing you out...</p>
    </div>
  );
};

export default LogoutPage;
