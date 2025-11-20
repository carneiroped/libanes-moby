'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { usersService } from '@/lib/services/users.service';

export function useCurrentUser() {
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    const getUserId = async () => {
      try {
        // Try to get from localStorage first
        const storedUser = localStorage.getItem('moby-user');
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            if (parsedUser.id) {
              setUserId(parsedUser.id);
              setLoading(false);
              return;
            }
          } catch (e) {
            console.warn('Failed to parse stored user', e);
          }
        }

        // If we have auth user, use it directly (demo mode)
        if (isAuthenticated && user?.id) {
          try {
            // Try to get local user from service
            const localUser = await usersService.getUser(user.id);

            if (localUser?.id) {
              setUserId(localUser.id);
              // Store in localStorage for future use
              localStorage.setItem('moby-user', JSON.stringify({ id: localUser.id }));
            }
          } catch (error) {
            console.warn('Failed to get local user from service:', error);
            // Fallback: use auth user ID directly
            setUserId(user.id);
            localStorage.setItem('moby-user', JSON.stringify({ id: user.id }));
          }
        }
      } catch (error) {
        console.error('Error getting current user:', error);
      } finally {
        setLoading(false);
      }
    };

    getUserId();
  }, [user, isAuthenticated]);

  return { userId, loading };
}