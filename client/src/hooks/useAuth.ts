import { useState, useEffect } from 'react';

interface User {
  firstName: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is stored in localStorage
    const storedUser = localStorage.getItem('food-lab-user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('food-lab-user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = (firstName: string) => {
    const newUser = { firstName };
    setUser(newUser);
    localStorage.setItem('food-lab-user', JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('food-lab-user');
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout
  };
}