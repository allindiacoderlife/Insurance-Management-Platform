import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch current user if token exists on initial load
  useEffect(() => {
    const fetchMe = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const response = await api.get("/auth/me");
        setUser(response.data.data.user);
      } catch (err) {
        console.error("Auth initialization error:", err.message);
        logout();
      } finally {
        setLoading(false);
      }
    };

    fetchMe();
  }, [token]);

  const login = async (email, password) => {
    setError(null);
    try {
      const response = await api.post("/auth/login", { email, password });
      const { user: userData, token: jwtToken } = response.data.data;

      localStorage.setItem("token", jwtToken);
      setToken(jwtToken);
      setUser(userData);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const register = async (formData) => {
    setError(null);
    try {
      const response = await api.post("/auth/register", formData);
      const { user: userData, token: jwtToken } = response.data.data;

      localStorage.setItem("token", jwtToken);
      setToken(jwtToken);
      setUser(userData);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const verifyOtp = async (email, otp) => {
    setError(null);
    try {
      const response = await api.post("/auth/verify-otp", { email, otp });
      if (user) {
        setUser({ ...user, isEmailVerified: true });
      }
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const resendOtp = async (email) => {
    setError(null);
    try {
      const response = await api.post("/auth/resend-otp", { email });
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const forgotPassword = async (email) => {
    setError(null);
    try {
      const response = await api.post("/auth/forgot-password", { email });
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const resetPassword = async (email, otp, newPassword) => {
    setError(null);
    try {
      const response = await api.post("/auth/reset-password", {
        email,
        otp,
        newPassword,
      });
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        setError,
        login,
        register,
        verifyOtp,
        resendOtp,
        forgotPassword,
        resetPassword,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
