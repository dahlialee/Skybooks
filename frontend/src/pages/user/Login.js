import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaEnvelope, FaLock } from 'react-icons/fa';
import { useUser } from '../../context/UserContext';
import { loginCustomer } from '../../services/customerAPI';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { loginUser, fetchUserProfile } = useUser();

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    setIsLoading(true);

    try {
      const response = await loginCustomer({ email, password });

      console.log('Login response:', response.data);

      if (response.data) {
        const { customer } = response.data;

        console.log('Customer data:', customer);

        const userData = {
          id: customer.id || customer._id,
          _id: customer._id || customer.id,
          email: customer.email,
          name: customer.name,
          phone: customer.phone,
          address: customer.address,
          gender: customer.gender,
          date_of_birth: customer.date_of_birth,
          role: 'customer',
        };

        console.log('Prepared user data:', userData);

        loginUser(userData);

        // Thử lấy thông tin chi tiết người dùng
        await fetchUserProfile();

        toast.success(`Xin chào, ${customer.name}!`);
        navigate('/');
      } else {
        toast.error('Đăng nhập không thành công');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error(
        error.response?.data?.message || 
        'Không thể đăng nhập. Vui lòng thử lại.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-md p-8">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Đăng Nhập
        </h2>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
              <FaEnvelope className="text-gray-400" />
            </div>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              required
              className="w-full pl-10 py-3 border-b border-gray-300 focus:border-blue-500 outline-none"
            />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
              <FaLock className="text-gray-400" />
            </div>
            <input
              type="password"
              placeholder="Mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              required
              className="w-full pl-10 py-3 border-b border-gray-300 focus:border-blue-500 outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 rounded-lg text-white transition ${
              isLoading 
                ? 'bg-gray-400' 
                : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            {isLoading ? 'Đang đăng nhập...' : 'Đăng Nhập'}
          </button>

          <div className="text-center mt-4">
            <span className="text-gray-600 mr-2">Chưa có tài khoản?</span>
            <a 
              href="/register" 
              className="text-blue-500 hover:text-blue-600 font-semibold"
            >
              Đăng ký
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
