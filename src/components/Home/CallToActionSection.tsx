import React from 'react';
import { Calendar, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../authentication context/aunthenticationContextPage';

const CallToActionSection: React.FC = () => {
  const { isAuthenticated, setRedirectPath } = useAuth();
  const navigate = useNavigate();

  // Handle protected route navigation
  const navigateTo = (path: string): void => {
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
    <section className="py-16 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center justify-between">
          <div className="mb-8 lg:mb-0 lg:mr-8 text-center lg:text-left">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to prioritize your health?</h2>
            <p className="text-xl text-blue-100 max-w-2xl">
              Schedule an appointment today and take the first step towards better healthcare for you and your family.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={() => navigateTo('/patient/appointments')}
              className="px-6 py-3 bg-white text-blue-600 font-bold rounded-lg shadow-lg hover:bg-blue-50 transition-colors duration-300 inline-flex items-center justify-center"
            >
              <Calendar className="w-5 h-5 mr-2" />
              Book Appointment
            </button>
            <a 
              href="tel:+11234567890" 
              className="px-6 py-3 bg-transparent border-2 border-white text-white font-bold rounded-lg hover:bg-white hover:text-blue-600 transition-colors duration-300 inline-flex items-center justify-center"
            >
              <Phone className="w-5 h-5 mr-2" />
              Call Now
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToActionSection;