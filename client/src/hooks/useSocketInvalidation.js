import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { getSocket } from '../lib/socket';

export function useSocketInvalidation() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    let socket = getSocket();
    let retryTimer;
    if (!socket) {
      // AuthContext connects the socket asynchronously after login/me() resolves;
      // retry briefly until it exists rather than silently never attaching listeners.
      retryTimer = setInterval(() => {
        socket = getSocket();
        if (socket) attach(socket);
      }, 300);
    } else {
      attach(socket);
    }

    function attach(activeSocket) {
      clearInterval(retryTimer);
      activeSocket.on('equipment:updated', invalidate);
      activeSocket.on('transaction:created', invalidate);
      activeSocket.on('maintenance:created', invalidate);
    }

    function invalidate() {
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    }

    return () => {
      clearInterval(retryTimer);
      const activeSocket = getSocket();
      if (activeSocket) {
        activeSocket.off('equipment:updated', invalidate);
        activeSocket.off('transaction:created', invalidate);
        activeSocket.off('maintenance:created', invalidate);
      }
    };
  }, [user, queryClient]);
}
