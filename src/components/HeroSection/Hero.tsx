
import { Calendar, Clock, Phone } from 'lucide-react';

const Hero = () => {
  return (
    <section id="home" className="pt-20 bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900">
              Your Health is Our
              <span className="text-blue-600"> Top Priority</span>
            </h1>
            <p className="text-lg text-gray-600 md:pr-8">
              Experience world-class healthcare with our team of expert doctors.
              Book appointments easily and get the care you deserve.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="bg-blue-600 text-white px-6 py-3 rounded-lg text-lg font-medium hover:bg-blue-700 transition-colors">
                Book Appointment
              </button>
              <button className="border-2 border-blue-600 text-blue-600 px-6 py-3 rounded-lg text-lg font-medium hover:bg-blue-50 transition-colors">
                Find Doctors
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <Calendar className="h-8 w-8 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Easy Scheduling</h3>
              <p className="text-gray-600">Book appointments online anytime</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <Clock className="h-8 w-8 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">24/7 Service</h3>
              <p className="text-gray-600">Round-the-clock medical support</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg col-span-2">
              <Phone className="h-8 w-8 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Emergency Care</h3>
              <p className="text-gray-600">Immediate response for emergencies</p>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 text-center">
          <div>
            <h4 className="text-3xl font-bold text-blue-600">50+</h4>
            <p className="text-gray-600 mt-2">Expert Doctors</p>
          </div>
          <div>
            <h4 className="text-3xl font-bold text-blue-600">10k+</h4>
            <p className="text-gray-600 mt-2">Happy Patients</p>
          </div>
          <div>
            <h4 className="text-3xl font-bold text-blue-600">15+</h4>
            <p className="text-gray-600 mt-2">Departments</p>
          </div>
          <div>
            <h4 className="text-3xl font-bold text-blue-600">24/7</h4>
            <p className="text-gray-600 mt-2">Available Support</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;