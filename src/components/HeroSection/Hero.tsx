// src/components/HeroSection/Hero.jsx or Hero.tsx
import React from 'react';
import { Calendar, Clock, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../authentication context/aunthenticationContextPage';

const HeroSection = () => {
  const navigate = useNavigate();
  const { isAuthenticated, setRedirectPath } = useAuth();

  // Function to handle protected navigation
  const navigateTo = (path) => {
    if (isAuthenticated) {
      // User is authenticated, navigate directly to the path
      navigate(path);
    } else {
      // User is not authenticated, store the path and redirect to sign in
      setRedirectPath(path);
      navigate('/signin');
    }
  };

  return (
    <section 
      className="relative py-20 bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url("https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80")',
        minHeight: '80vh'
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-blue-900/70 to-indigo-800/60"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-6 text-white">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold">
              Your Health is Our
              <span className="text-blue-200"> Top Priority</span>
            </h1>
            <p className="text-lg text-blue-100 md:pr-8">
              Experience world-class healthcare with our team of expert doctors.
              Book appointments easily and get the care you deserve.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                className="bg-blue-600 text-white px-6 py-3 rounded-lg text-lg font-medium hover:bg-blue-700 transition-colors"
                onClick={() => navigateTo('/patient/appointments')}
              >
                Book Appointment
              </button>
              <button 
                className="border-2 border-white text-white px-6 py-3 rounded-lg text-lg font-medium hover:bg-white/10 transition-colors"
                onClick={() => navigateTo('/patient/doctors')}
              >
                Find Doctors
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div 
              className="bg-white/90 p-6 rounded-xl shadow-lg cursor-pointer hover:shadow-xl transition-shadow"
              onClick={() => navigateTo('/patient/appointments')}
            >
              <Calendar className="h-8 w-8 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Easy Scheduling</h3>
              <p className="text-gray-700">Book appointments online anytime</p>
            </div>
            <div 
              className="bg-white/90 p-6 rounded-xl shadow-lg cursor-pointer hover:shadow-xl transition-shadow"
              onClick={() => navigateTo('/aichatbot')}
            >
              <Clock className="h-8 w-8 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">24/7 Service</h3>
              <p className="text-gray-700">Round-the-clock medical support</p>
            </div>
            <div 
              className="bg-white/90 p-6 rounded-xl shadow-lg col-span-2 cursor-pointer hover:shadow-xl transition-shadow"
              onClick={() => navigateTo('/contacts')}
            >
              <Phone className="h-8 w-8 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Emergency Care</h3>
              <p className="text-gray-700">Immediate response for emergencies</p>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 text-center">
          <div className="bg-white/90 py-4 rounded-lg">
            <h4 className="text-3xl font-bold text-blue-600">50+</h4>
            <p className="text-gray-700 mt-2">Expert Doctors</p>
          </div>
          <div className="bg-white/90 py-4 rounded-lg">
            <h4 className="text-3xl font-bold text-blue-600">10k+</h4>
            <p className="text-gray-700 mt-2">Happy Patients</p>
          </div>
          <div className="bg-white/90 py-4 rounded-lg">
            <h4 className="text-3xl font-bold text-blue-600">15+</h4>
            <p className="text-gray-700 mt-2">Departments</p>
          </div>
          <div className="bg-white/90 py-4 rounded-lg">
            <h4 className="text-3xl font-bold text-blue-600">24/7</h4>
            <p className="text-gray-700 mt-2">Available Support</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;