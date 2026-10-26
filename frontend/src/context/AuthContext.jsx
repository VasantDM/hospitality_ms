import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const DEMO_USERS = [
  {
    email: "admin@grandvista.com",
    role: "admin",
    name: "Alexander Wright (GM)",
    title: "General Manager & Admin",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
  },
  {
    email: "frontdesk@grandvista.com",
    role: "front_desk",
    name: "Sarah Jenkins",
    title: "Front Desk Supervisor",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80"
  },
  {
    email: "waiter@grandvista.com",
    role: "waiter",
    name: "Marco Rossi",
    title: "F&B Head Captain",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80"
  },
  {
    email: "housekeeping@grandvista.com",
    role: "housekeeping",
    name: "Elena Rodriguez",
    title: "Housekeeping Lead",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80"
  },
];

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(DEMO_USERS[0]);
  const [loading, setLoading] = useState(false);

  const switchDemoRole = (userOrEmail) => {
    if (typeof userOrEmail === 'string') {
      const found = DEMO_USERS.find(u => u.email === userOrEmail || u.role === userOrEmail);
      if (found) setCurrentUser(found);
    } else if (userOrEmail && typeof userOrEmail === 'object') {
      setCurrentUser(userOrEmail);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        switchDemoRole,
        loading,
        isAdmin: currentUser.role === 'admin',
        isFrontDesk: currentUser.role === 'front_desk' || currentUser.role === 'admin',
        isWaiter: currentUser.role === 'waiter' || currentUser.role === 'admin',
        isHousekeeping: currentUser.role === 'housekeeping' || currentUser.role === 'admin',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
