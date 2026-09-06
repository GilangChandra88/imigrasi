import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';

const AuthContext = createContext({});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        if (user.email && user.email.toLowerCase() === 'bakmiekt@gmail.com') {
          setUserRole('Super Admin');
          setUserData({ nama: 'Master Admin', email: user.email });
        } else {
          try {
            const q = query(collection(db, 'pegawai'), where('email', '==', user.email));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
              const data = querySnapshot.docs[0].data();
              setUserRole(data.role || 'Pegawai');
              setUserData({ ...data, id: querySnapshot.docs[0].id });
            } else {
              setUserRole('Pegawai');
              setUserData({ email: user.email });
            }
          } catch (error) {
            console.error('Error fetching user role:', error);
            setUserRole('Pegawai');
          }
        }
      } else {
        setUserRole(null);
        setUserData(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userRole,
    userData,
    isSuperAdmin: userRole === 'Super Admin',
    isAdmin: userRole === 'Admin' || userRole === 'Super Admin',
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
