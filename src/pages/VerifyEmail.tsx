import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const VerifyEmail = () => {
  const navigate = useNavigate();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value[0];
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    const newOtp = [...otp];
    pastedData.split('').forEach((char, i) => {
      if (i < 6) newOtp[i] = char;
    });
    setOtp(newOtp);
    // Focus the last filled input or the next empty one
    const nextEmptyIndex = newOtp.findIndex(val => val === '');
    if (nextEmptyIndex !== -1) {
      inputRefs.current[nextEmptyIndex]?.focus();
    } else {
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // TODO: Implement actual OTP verification API call
    console.log('OTP:', otp.join(''));

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      navigate('/login');
    }, 1000);
  };

  const handleResend = () => {
    // TODO: Implement resend code functionality
    console.log('Resend code');
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
        style={{ borderRadius: '24px', maxWidth: '400px' }}
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
          className="text-2xl font-semibold mb-1"
          style={{ fontFamily: 'Poppins', color: '#393939' }}
        >
          Verify Email Address
        </h2>
        <p 
          className="text-sm mb-1"
          style={{ fontFamily: 'Poppins', color: '#f30100', fontWeight: 500 }}
        >
          Check your inbox!
        </p>
        <p 
          className="text-sm mb-6"
          style={{ fontFamily: 'Poppins', color: '#777777' }}
        >
          We sent a 6-digit verification code to your email. Please enter it below to continue
        </p>

        {/* OTP Input */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-between gap-2">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                className="w-12 h-12 text-center text-xl font-semibold rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#f30100]/20 transition-colors"
                style={{ 
                  fontFamily: 'Poppins', 
                  borderColor: digit && index === 3 ? '#f30100' : '#e3e3e3',
                  borderWidth: digit && index === 3 ? '2px' : '1px'
                }}
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={isLoading || otp.some(d => !d)}
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
            {isLoading ? 'Verifying...' : 'Verify email'}
          </button>
        </form>

        {/* Resend Link */}
        <p 
          className="mt-6 text-center text-sm"
          style={{ fontFamily: 'Poppins', color: '#777777' }}
        >
          Didn't receive it?{' '}
          <button
            type="button"
            onClick={handleResend}
            className="font-medium"
            style={{ color: '#f30100', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            Resend Code
          </button>
        </p>
      </div>
    </div>
  );
};

export default VerifyEmail;
