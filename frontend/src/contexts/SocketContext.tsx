import { createContext, useEffect, useState, type ReactNode } from 'react';
import { socket } from '../lib/socket';
import { useAuth } from '../hooks/useAuth';

interface SocketContextType {
  connected: boolean;
  socket: typeof socket;
}

export const SocketContext = createContext<SocketContextType | null>(null);

export function SocketProvider({ children }: { children: ReactNode }) {
  return <SocketProviderInner>{children}</SocketProviderInner>;
}

function SocketProviderInner({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (token) {
      socket.auth = { token };
      socket.connect();
    } else {
      socket.disconnect();
    }

    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, [token]);

  return (
    <SocketContext.Provider value={{ connected, socket }}>
      {children}
    </SocketContext.Provider>
  );
}
