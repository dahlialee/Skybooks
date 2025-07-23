import React from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AppRoutes from './routes';
import { UserProvider } from './context/UserContext';
import { CartProvider } from './context/CartContext';

function App() {
  return (
    <CartProvider>
      <UserProvider>
        <AppRoutes />
        <ToastContainer position="top-right" autoClose={2000} />
      </UserProvider>
    </CartProvider>
  );
}

export default App;
