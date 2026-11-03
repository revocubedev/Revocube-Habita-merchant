import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import { loginEstateManager, getApiErrorMessage } from '@/api';
import { useAuth } from '@/lib/auth';
import type { User } from '@/types';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const loginMutation = useMutation({
    mutationFn: loginEstateManager,
    onSuccess: (response) => {
      console.log("Login successful:", response);

      // Extract token and user data from response
      const token = response.data?.token || response.token || '';

      if (!token) {
        console.error('No token received from server');
        Swal.fire({
          icon: 'error',
          title: 'Login Failed',
          text: 'No authentication token received',
          confirmButtonColor: '#f30100',
          confirmButtonText: 'OK',
        });
        return;
      }

      // Extract user data with fallback
      const managerData = response.data?.manager || response.manager;
      const userData: User = {
        id: (managerData?.id as string) || '1',
        name: (managerData?.name as string) || response.data?.name || 'Estate Manager',
        email: (managerData?.email as string) || email,
        role: (managerData?.role as string) || 'Admin',
      };

      // Store token and user data
      login(token, userData);

      // Show success alert
      Swal.fire({
        icon: 'success',
        title: 'Login Successful',
        text: 'Welcome back!',
        confirmButtonColor: '#f30100',
        confirmButtonText: 'OK',
        timer: 1500,
        timerProgressBar: true,
      }).then(() => {
        // Navigate to dashboard
        navigate('/');
      });
    },
    onError: (error) => {
      console.error("Login error:", getApiErrorMessage(error));
      const errorMessage = getApiErrorMessage(error);

      Swal.fire({
        icon: 'error',
        title: 'Login Failed',
        text: errorMessage,
        confirmButtonColor: '#f30100',
        confirmButtonText: 'OK',
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    loginMutation.mutate({ email, password });
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center bg-no-repeat"
      style={{ 
        backgroundImage: 'url(/assets/bgauthimg.png)',
        fontFamily: 'Poppins'
      }}
    >
      <div 
        className="w-full max-w-md bg-white rounded-2xl p-8 shadow-2xl"
        style={{ borderRadius: '24px' }}
      >
        {/* Logo */}
        <div className="mb-8">
          <img 
            src="/assets/spacesl.png" 
            alt="Revocube Spaces Logo"
            className="h-12 w-auto"
          />
        </div>

        {/* Heading */}
        <h2 
          className="text-2xl font-semibold mb-2"
          style={{ fontFamily: 'Poppins', color: '#393939' }}
        >
          Welcome back!
        </h2>
        <p 
          className="text-sm mb-6"
          style={{ fontFamily: 'Poppins', color: '#777777' }}
        >
          Please enter your details to sign in
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label 
              className="block text-sm font-medium mb-2"
              style={{ fontFamily: 'Poppins', color: '#4c4c4c' }}
            >
              Email Address
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#f30100]/20 transition-colors"
              style={{ 
                fontFamily: 'Poppins', 
                borderColor: '#e3e3e3',
                height: '48px'
              }}
            />
          </div>

          <div>
            <label 
              className="block text-sm font-medium mb-2"
              style={{ fontFamily: 'Poppins', color: '#4c4c4c' }}
            >
              Password
            </label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#f30100]/20 transition-colors"
              style={{ 
                fontFamily: 'Poppins', 
                borderColor: '#e3e3e3',
                height: '48px'
              }}
            />
          </div>

          <div className="flex justify-end">
            <a
              href="#"
              className="text-sm"
              style={{ fontFamily: 'Poppins', color: '#f30100' }}
            >
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="w-full text-white transition-colors"
            style={{
              fontFamily: 'Poppins',
              borderRadius: '12px',
              backgroundColor: '#f30100',
              border: 'none',
              height: '48px',
              fontSize: '16px',
              fontWeight: 500
            }}
          >
            {loginMutation.isPending ? 'Signing in...' : 'Login'}
          </button>
        </form>

        {/* Sign Up Link */}
        <p 
          className="mt-6 text-center text-sm"
          style={{ fontFamily: 'Poppins', color: '#777777' }}
        >
          Don't have an account?{' '}
          <a 
            href="#"
            className="font-medium"
            style={{ color: '#f30100' }}
          >
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;
