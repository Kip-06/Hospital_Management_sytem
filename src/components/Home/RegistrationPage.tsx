// src/components/Home/RegistrationPage.tsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Phone, 
  Lock, 
  Eye, 
  EyeOff, 
  Calendar, 
  Shield, 
  CheckCircle, 
  XCircle,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import { useDispatch } from 'react-redux';
import { authApi} from '../../store/api/authApi';
import { setUser } from '../../store/slices/authSlice';

const RegistrationPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'patient' | 'doctor'>('patient');
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Use the register mutation from RTK Query
  const [register, { isLoading: loading }] = authApi.useRegisterMutation();

  // Form data
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    password: '',
    confirmPassword: '',
    specialization: '',
    licenseNumber: '',
    hospitalAffiliation: '',
    yearsOfExperience: '',
    agreeToTerms: false
  });

  // Password strength
  const [passwordStrength, setPasswordStrength] = useState(0);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (name === 'password') {
      checkPasswordStrength(value);
    }
  };

  const checkPasswordStrength = (password: string) => {
    let strength = 0;
    
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    
    setPasswordStrength(strength);
  };

  const handleTabChange = (tab: 'patient' | 'doctor') => {
    setActiveTab(tab);
  };

  const handleContinue = () => {
    // Validate current step
    if (step === 1) {
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
        setError('Please fill in all required fields');
        return;
      }
      
      // Basic email validation
      if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
        setError('Please enter a valid email address');
        return;
      }
    } else if (step === 2) {
      if (!formData.password || !formData.confirmPassword) {
        setError('Please create and confirm your password');
        return;
      }
      
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      
      if (passwordStrength < 3) {
        setError('Please create a stronger password');
        return;
      }
    }
    
    if (activeTab === 'doctor' && step === 3) {
      if (!formData.specialization || !formData.licenseNumber) {
        setError('Please complete all required professional information');
        return;
      }
    }
    
    setError('');
    
    // Check if this is the final step
    const finalStep = activeTab === 'patient' ? 3 : 4;
    
    if (step === finalStep) {
      if (!formData.agreeToTerms) {
        setError('You must agree to the terms and conditions');
        return;
      }
      handleSubmit();
    } else {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    setStep(Math.max(1, step - 1));
    setError('');
  };

  const handleSubmit = async () => {
    try {
      // Prepare user data based on our database schema
      const userData = {
        email: formData.email,
        password: formData.password,
        role: activeTab // 'patient' or 'doctor'
      };
      
      // Call the register endpoint with user data
      const result = await register(userData).unwrap();
      
      // Store the token and role in Redux state
      if (result.token && result.role) {
        dispatch(setUser({
          token: result.token,
          role: result.role as 'patient' | 'doctor' | 'admin'
        }));
      }
      
      // In parallel or as a next step, we'll need to add the user's additional details
      // to either the patients or doctors table as appropriate.
      // This would typically be handled by your backend after the user account is created.
      
      console.log('Registration successful:', result);
      
      // Navigate to the appropriate dashboard
      navigate(activeTab === 'doctor' ? '/doctor' : '/patient');
      
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.data?.message || 'Registration failed. Please try again.');
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Calculate password strength color
  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 1) return 'bg-red-500';
    if (passwordStrength <= 2) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 1) return 'Weak';
    if (passwordStrength <= 2) return 'Medium';
    return 'Strong';
  };

  const totalSteps = activeTab === 'patient' ? 3 : 4;
  const progressPercentage = (step / totalSteps) * 100;

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Image and Information */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-indigo-900 text-white flex-col justify-between">
        <div className="p-12">
          <h1 className="text-4xl font-bold">MediCare</h1>
          <p className="mt-2 text-blue-100">Your health, our priority</p>
        </div>
        
        <div className="p-12 space-y-6">
          <h2 className="text-3xl font-bold">Join our healthcare network</h2>
          <p className="text-xl text-blue-100">
            Create an account to access personalized healthcare services, 
            manage appointments, and connect with healthcare professionals.
          </p>
          
          <div className="space-y-4 mt-8">
            <div className="flex items-start">
              <div className="bg-blue-500 p-2 rounded-full mr-4">
                <CheckCircle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Easy Appointment Booking</h3>
                <p className="text-blue-100">Schedule appointments with just a few clicks</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="bg-blue-500 p-2 rounded-full mr-4">
                <CheckCircle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Secure Medical Records</h3>
                <p className="text-blue-100">Access your medical history anytime, anywhere</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="bg-blue-500 p-2 rounded-full mr-4">
                <CheckCircle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Direct Communication</h3>
                <p className="text-blue-100">Connect with healthcare professionals directly</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-12">
          <p className="text-sm text-blue-200">
            Already have an account? <Link to="/signin" className="text-white font-semibold underline">Sign in</Link>
          </p>
        </div>
      </div>
      
      {/* Right Panel - Registration Form */}
      <div className="w-full lg:w-1/2 flex flex-col p-6 lg:p-12 bg-white">
        <div className="lg:hidden flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-blue-600">MediCare</h1>
          <Link to="/signin" className="text-blue-600 font-medium">Sign in</Link>
        </div>
        
        <div className="flex-grow flex flex-col justify-center max-w-md mx-auto w-full">
          <h2 className="text-3xl font-bold text-gray-900 mb-1">Create an account</h2>
          <p className="text-gray-600 mb-8">
            Join as a {activeTab === 'patient' ? 'patient' : 'healthcare provider'}
          </p>
          
          {/* Account Type Selector */}
          <div className="mb-8">
            <div className="flex justify-center border border-gray-200 rounded-lg p-1 mb-2">
              <button
                type="button"
                onClick={() => handleTabChange('patient')}
                className={`flex-1 py-2 px-4 rounded-lg ${
                  activeTab === 'patient' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-700 hover:bg-gray-50'
                } transition-colors`}
              >
                Patient
              </button>
              <button
                type="button"
                onClick={() => handleTabChange('doctor')}
                className={`flex-1 py-2 px-4 rounded-lg ${
                  activeTab === 'doctor' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-700 hover:bg-gray-50'
                } transition-colors`}
              >
                Healthcare Provider
              </button>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
              <div 
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-500 flex justify-between">
              <span>Step {step} of {totalSteps}</span>
              <span>
                {step === 1 ? 'Basic Information' : 
                 step === 2 ? 'Security' : 
                 step === 3 ? (activeTab === 'patient' ? 'Review' : 'Professional Details') :
                 'Review'}
              </span>
            </div>
          </div>
          
          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700">
              <p className="text-sm">{error}</p>
            </div>
          )}
          
          {/* Form Steps */}
          <form className="space-y-6">
            {/* Step 1: Basic Information */}
            {step === 1 && (
              <>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">First Name*</label>
                    <div className="mt-1 relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        required
                        className="py-2 pl-10 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        placeholder="John"
                        value={formData.firstName}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Last Name*</label>
                    <div className="mt-1">
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        required
                        className="py-2 px-3 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Doe"
                        value={formData.lastName}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email*</label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      className="py-2 pl-10 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number*</label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      required
                      className="py-2 pl-10 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="(123) 456-7890"
                      value={formData.phone}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">Date of Birth*</label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="date"
                      id="dateOfBirth"
                      name="dateOfBirth"
                      required
                      className="py-2 pl-10 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </>
            )}
            
            {/* Step 2: Password */}
            {step === 2 && (
              <>
                <div className="space-y-6">
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">Create Password*</label>
                    <div className="mt-1 relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        id="password"
                        name="password"
                        required
                        className="py-2 pl-10 pr-10 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={handleInputChange}
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                        <button
                          type="button"
                          onClick={togglePasswordVisibility}
                          className="text-gray-400 hover:text-gray-600 focus:outline-none"
                        >
                          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                    </div>
                    
                    {formData.password && (
                      <div className="mt-2">
                        <div className="flex items-center">
                          <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                            <div
                              className={`h-2 rounded-full ${getPasswordStrengthColor()}`}
                              style={{ width: `${(passwordStrength / 4) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-500">{getPasswordStrengthText()}</span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm Password*</label>
                    <div className="mt-1 relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        id="confirmPassword"
                        name="confirmPassword"
                        required
                        className="py-2 pl-10 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        placeholder="••••••••"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                      />
                      {formData.confirmPassword && formData.password === formData.confirmPassword && (
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded border border-blue-100">
                    <h3 className="text-sm font-medium text-blue-800 mb-2 flex items-center">
                      <Shield className="h-4 w-4 mr-1" />
                      Password Requirements
                    </h3>
                    <ul className="text-xs text-blue-700 space-y-1">
                      <li className="flex items-center">
                        {formData.password && formData.password.length >= 8 ? 
                          <CheckCircle className="h-4 w-4 mr-1 text-green-500" /> : 
                          <XCircle className="h-4 w-4 mr-1 text-gray-400" />}
                        Minimum 8 characters
                      </li>
                      <li className="flex items-center">
                        {formData.password && /[A-Z]/.test(formData.password) ? 
                          <CheckCircle className="h-4 w-4 mr-1 text-green-500" /> : 
                          <XCircle className="h-4 w-4 mr-1 text-gray-400" />}
                        At least one uppercase letter
                      </li>
                      <li className="flex items-center">
                        {formData.password && /[0-9]/.test(formData.password) ? 
                          <CheckCircle className="h-4 w-4 mr-1 text-green-500" /> : 
                          <XCircle className="h-4 w-4 mr-1 text-gray-400" />}
                        At least one number
                      </li>
                      <li className="flex items-center">
                        {formData.password && /[^A-Za-z0-9]/.test(formData.password) ? 
                          <CheckCircle className="h-4 w-4 mr-1 text-green-500" /> : 
                          <XCircle className="h-4 w-4 mr-1 text-gray-400" />}
                        At least one special character
                      </li>
                    </ul>
                  </div>
                </div>
              </>
            )}
            
            {/* Step 3: Doctor Professional Details */}
            {step === 3 && activeTab === 'doctor' && (
              <div className="space-y-6">
                <div>
                  <label htmlFor="specialization" className="block text-sm font-medium text-gray-700">Specialization*</label>
                  <select
                    id="specialization"
                    name="specialization"
                    required
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    value={formData.specialization}
                    onChange={handleInputChange}
                  >
                    <option value="">Select your specialization</option>
                    <option value="cardiology">Cardiology</option>
                    <option value="dermatology">Dermatology</option>
                    <option value="endocrinology">Endocrinology</option>
                    <option value="gastroenterology">Gastroenterology</option>
                    <option value="gynecology">Gynecology</option>
                    <option value="neurology">Neurology</option>
                    <option value="orthopedics">Orthopedics</option>
                    <option value="pediatrics">Pediatrics</option>
                    <option value="psychiatry">Psychiatry</option>
                    <option value="urology">Urology</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="licenseNumber" className="block text-sm font-medium text-gray-700">Medical License Number*</label>
                  <input
                    type="text"
                    id="licenseNumber"
                    name="licenseNumber"
                    required
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="License number"
                    value={formData.licenseNumber}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div>
                  <label htmlFor="hospitalAffiliation" className="block text-sm font-medium text-gray-700">Hospital Affiliation</label>
                  <input
                    type="text"
                    id="hospitalAffiliation"
                    name="hospitalAffiliation"
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Hospital or clinic name"
                    value={formData.hospitalAffiliation}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div>
                  <label htmlFor="yearsOfExperience" className="block text-sm font-medium text-gray-700">Years of Experience</label>
                  <input
                    type="number"
                    id="yearsOfExperience"
                    name="yearsOfExperience"
                    min="0"
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Years of experience"
                    value={formData.yearsOfExperience}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            )}
            
            {/* Final Step: Review and Agree */}
            {((activeTab === 'patient' && step === 3) || (activeTab === 'doctor' && step === 4)) && (
              <div className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-3">Review Your Information</h3>
                  <dl className="space-y-2">
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-600">Full Name:</dt>
                      <dd className="text-sm font-medium">{formData.firstName} {formData.lastName}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-600">Email:</dt>
                      <dd className="text-sm font-medium">{formData.email}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-600">Phone:</dt>
                      <dd className="text-sm font-medium">{formData.phone}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-600">Date of Birth:</dt>
                      <dd className="text-sm font-medium">{formData.dateOfBirth}</dd>
                    </div>
                    {activeTab === 'doctor' && (
                      <>
                        <div className="flex justify-between">
                          <dt className="text-sm text-gray-600">Specialization:</dt>
                          <dd className="text-sm font-medium">{formData.specialization}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-sm text-gray-600">License Number:</dt>
                          <dd className="text-sm font-medium">{formData.licenseNumber}</dd>
                        </div>
                      </>
                    )}
                  </dl>
                </div>
                
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="agreeToTerms"
                      name="agreeToTerms"
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      checked={formData.agreeToTerms}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="agreeToTerms" className="font-medium text-gray-700">
                      I agree to the{' '}
                      <Link to="/terms" className="text-blue-600 hover:underline">Terms and Conditions</Link>
                      {' '}and{' '}
                      <Link to="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>
                    </label>
                  </div>
                </div>
              </div>
            )}
            
            {/* Navigation Buttons */}
            <div className="flex justify-between pt-4">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={handleBack}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back
                </button>
              ) : (
                <div></div>
              )}
              
              <button
                type="button"
                onClick={handleContinue}
                className={`inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  loading ? 'opacity-75 cursor-not-allowed' : ''
                }`}
                disabled={loading}
              >
                {loading ? (
                  'Processing...'
                ) : (
                  <>
                    {((activeTab === 'patient' && step === 3) || (activeTab === 'doctor' && step === 4))
                      ? 'Complete Registration'
                      : 'Continue'}
                    {((activeTab === 'patient' && step === 3) || (activeTab === 'doctor' && step === 4))
                      ? null
                      : <ArrowRight className="h-4 w-4 ml-1" />}
                  </>
                )}
              </button>
            </div>
          </form>
          
          {/* Mobile Only - Already have an account link */}
          <div className="mt-8 text-center lg:hidden">
            <p className="text-sm text-gray-600">
              Already have an account? <Link to="/signin" className="text-blue-600 font-semibold">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationPage;