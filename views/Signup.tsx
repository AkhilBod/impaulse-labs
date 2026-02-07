import React, { useState } from 'react';
import { Icons } from '../components/Icons';
import { dbService } from '../services/dbService';

interface Props {
  onSignup: (userId: string) => void;
  onBack: () => void;
}

const Signup: React.FC<Props> = ({ onSignup, onBack }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const passwordsMatch = password && confirmPassword && password === confirmPassword;
  const isValid = fullName && email && passwordsMatch && agreeTerms;

  const handleSignup = async () => {
    if (isValid) {
      setLoading(true);
      try {
        const user = await dbService.signup(email, fullName, password);
        setError('');
        onSignup(user.id);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Signup failed. Please try again.');
        console.error('Signup error:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-[#F2F9F6] to-emerald-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header with Back Button */}
        <div className="flex items-center mb-8 -ml-2">
          <button
            onClick={onBack}
            className="p-2 text-gray-800 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <Icons.ArrowLeft size={24} />
          </button>
        </div>

        {/* Logo/Header */}
        <div className="text-center mb-12">
          <img src="/logo.png" alt="Impaulse Labs" className="w-24 h-24 mx-auto mb-4 object-contain" />
          <h2 className="text-4xl font-bold text-gray-900 mb-2">Impaulse Labs</h2>
          <p className="text-gray-600">Join us today</p>
        </div>

        {/* Signup Card */}
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-emerald-100">
          <h3 className="text-2xl font-bold text-gray-900 mb-8">Create account</h3>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm font-semibold">{error}</p>
            </div>
          )}

          {/* Full Name Input */}
          <div className="mb-6">
            <label className="text-sm font-bold text-gray-700 block mb-2">Full Name</label>
            <input
              type="text"
              placeholder="John Doe"
              className="w-full p-4 rounded-xl border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

          {/* Email Input */}
          <div className="mb-6">
            <label className="text-sm font-bold text-gray-700 block mb-2">Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              className="w-full p-4 rounded-xl border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Password Input */}
          <div className="mb-6">
            <label className="text-sm font-bold text-gray-700 block mb-2">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full p-4 rounded-xl border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* Confirm Password Input */}
          <div className="mb-6">
            <label className="text-sm font-bold text-gray-700 block mb-2">Confirm Password</label>
            <input
              type="password"
              placeholder="••••••••"
              className={`w-full p-4 rounded-xl border bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors ${
                password && confirmPassword && !passwordsMatch
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                  : 'border-gray-300 focus:border-emerald-500 focus:ring-emerald-200'
              }`}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            {password && confirmPassword && !passwordsMatch && (
              <p className="text-red-500 text-sm mt-1">Passwords don't match</p>
            )}
          </div>

          {/* Terms Checkbox */}
          <div className="mb-8 flex items-center">
            <input
              type="checkbox"
              id="terms"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="w-4 h-4 text-emerald-600 bg-white border-gray-300 rounded cursor-pointer"
            />
            <label htmlFor="terms" className="ml-2 text-sm text-gray-700">
              I agree to the <a href="#" className="text-emerald-600 hover:text-emerald-700 font-semibold">Terms of Service</a> and <a href="#" className="text-emerald-600 hover:text-emerald-700 font-semibold">Privacy Policy</a>
            </label>
          </div>

          {/* Signup Button */}
          <button
            onClick={handleSignup}
            disabled={!isValid || loading}
            className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold text-lg mb-4 transition-colors shadow-lg"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>

          {/* Login Link */}
          <p className="text-center text-gray-600 text-sm">
            Already have an account? <a onClick={onBack} className="text-emerald-600 hover:text-emerald-700 font-semibold cursor-pointer">Login</a>
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-500 text-xs mt-8">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
};

export default Signup;
