import { useState, useEffect } from 'react';
import { authAPI } from '@/lib/api';

interface User {
  id: string;
  email: string;
  fullName: string;
  site: string;
  discipline: string;
  role: string;
  roleName: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem("opex_user");
    const storedToken = localStorage.getItem("opex_token");
    
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      console.log('Starting login process...');
      const response = await authAPI.login(email, password);
      console.log('API Response:', response);
      
      if (response.success && response.data) {
        const userData = {
          id: response.data.user.id ? response.data.user.id.toString() : '',
          email: response.data.user.email || '',
          fullName: response.data.user.fullName || '',
          site: response.data.user.site || '',
          discipline: response.data.user.discipline || '',
          role: response.data.user.role || '',
          roleName: response.data.user.roleName || '',
        };
        
        console.log('Setting user data:', userData);
        
        // Store data and update state immediately
        localStorage.setItem("opex_user", JSON.stringify(userData));
        localStorage.setItem("opex_token", response.data.token);
        
        // Update state immediately
        setUser(userData);
        console.log('User state updated successfully');
        
        return { success: true };
      } else {
        console.log('Login failed:', response.message);
        return { success: false, error: response.message || 'Login failed' };
      }
    } catch (error: any) {
      console.error('Login error:', error);
      let errorMessage = 'Login failed';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return { 
        success: false, 
        error: errorMessage
      };
    }
  };

  const register = async (userData: {
    fullName: string;
    email: string;
    password: string;
    site: string;
    discipline: string;
    role: string;
    roleName: string;
  }) => {
    try {
      const response = await authAPI.register(userData);
      return { success: response.success, message: response.message };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Registration failed' 
      };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("opex_user");
    localStorage.removeItem("opex_token");
  };

  return {
    user,
    isLoading,
    login,
    register,
    logout,
  };
};