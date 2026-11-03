import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    estateName: '',
    estateAddress: '',
    estateEmail: '',
    managerName: '',
    managerEmail: '',
    managerPhone: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // TODO: Implement actual signup API call
    console.log('Signup data:', formData);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      navigate('/login');
    }, 1000);
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
        className="w-full bg-white rounded-2xl p-8 shadow-2xl"
        style={{ borderRadius: '24px', maxWidth: '748px' }}
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
          Create Account
        </h2>
        <p 
          className="text-sm mb-6"
          style={{ fontFamily: 'Poppins', color: '#777777' }}
        >
          Please enter your estate details to sign up
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label 
                className="block text-sm font-medium mb-2"
                style={{ fontFamily: 'Poppins', color: '#4c4c4c' }}
              >
                Estate Name
              </label>
              <input
                type="text"
                name="estateName"
                placeholder="Enter your estate name"
                value={formData.estateName}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#f30100]/20 transition-colors"
                style={{ 
                  fontFamily: 'Poppins', 
                  borderColor: '#e3e3e3',
                  height: '48px',
                  fontSize: '14px'
                }}
              />
            </div>

            <div>
              <label 
                className="block text-sm font-medium mb-2"
                style={{ fontFamily: 'Poppins', color: '#4c4c4c' }}
              >
                Estate Address
              </label>
              <input
                type="text"
                name="estateAddress"
                placeholder="Enter your estate full address"
                value={formData.estateAddress}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#f30100]/20 transition-colors"
                style={{ 
                  fontFamily: 'Poppins', 
                  borderColor: '#e3e3e3',
                  height: '48px',
                  fontSize: '14px'
                }}
              />
            </div>

            <div>
              <label 
                className="block text-sm font-medium mb-2"
                style={{ fontFamily: 'Poppins', color: '#4c4c4c' }}
              >
                Estate Email Address
              </label>
              <input
                type="email"
                name="estateEmail"
                placeholder="Enter your estate email address"
                value={formData.estateEmail}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#f30100]/20 transition-colors"
                style={{ 
                  fontFamily: 'Poppins', 
                  borderColor: '#e3e3e3',
                  height: '48px',
                  fontSize: '14px'
                }}
              />
            </div>

            <div>
              <label 
                className="block text-sm font-medium mb-2"
                style={{ fontFamily: 'Poppins', color: '#4c4c4c' }}
              >
                Estate Manager Name
              </label>
              <input
                type="text"
                name="managerName"
                placeholder="Enter your estate admin name"
                value={formData.managerName}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#f30100]/20 transition-colors"
                style={{ 
                  fontFamily: 'Poppins', 
                  borderColor: '#e3e3e3',
                  height: '48px',
                  fontSize: '14px'
                }}
              />
            </div>

            <div>
              <label 
                className="block text-sm font-medium mb-2"
                style={{ fontFamily: 'Poppins', color: '#4c4c4c' }}
              >
                Estate Manager Email
              </label>
              <input
                type="email"
                name="managerEmail"
                placeholder="Enter estate admin email address"
                value={formData.managerEmail}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#f30100]/20 transition-colors"
                style={{ 
                  fontFamily: 'Poppins', 
                  borderColor: '#e3e3e3',
                  height: '48px',
                  fontSize: '14px'
                }}
              />
            </div>

            <div>
              <label 
                className="block text-sm font-medium mb-2"
                style={{ fontFamily: 'Poppins', color: '#4c4c4c' }}
              >
                Estate Manager Phone No
              </label>
              <input
                type="tel"
                name="managerPhone"
                placeholder="Enter estate admin phone no"
                value={formData.managerPhone}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#f30100]/20 transition-colors"
                style={{ 
                  fontFamily: 'Poppins', 
                  borderColor: '#e3e3e3',
                  height: '48px',
                  fontSize: '14px'
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
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
            {isLoading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        {/* Login Link */}
        <p 
          className="mt-6 text-center text-sm"
          style={{ fontFamily: 'Poppins', color: '#777777' }}
        >
          Already have an account?{' '}
          <a 
            href="/login"
            className="font-medium"
            style={{ color: '#f30100' }}
          >
            login in
          </a>
        </p>
      </div>
    </div>
  );
};

export default Signup;
