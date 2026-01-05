import Cookies from 'js-cookie';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

interface User {
  id: string;
  username: string;
  role: 'admin' | 'user';
  nama: string;
  email: string;
}

export const useAuth = () => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Ensure we're on the client side before accessing cookies
    if (typeof window !== 'undefined') {
      const userCookie = Cookies.get('user');
      const token = Cookies.get('token');

      if (token && userCookie) {
        try {
          const parsedUser = JSON.parse(userCookie);
          setUser(parsedUser);
        } catch (error) {
          console.error('Error parsing user cookie:', error);
          // If there's an error parsing the cookie, remove invalid cookies and redirect to login
          Cookies.remove('token');
          Cookies.remove('user');
          router.push('/login');
        }
      } else {
        // No token or user cookie, redirect to login
        router.push('/login');
      }
    }

    setLoading(false);
  }, [router]);

  const logout = () => {
    Cookies.remove('token');
    Cookies.remove('user');
    router.push('/login');
  };

  return { user, loading, logout };
};

export const isAdmin = (user: User | null): boolean => {
  return user?.role === 'admin';
};
