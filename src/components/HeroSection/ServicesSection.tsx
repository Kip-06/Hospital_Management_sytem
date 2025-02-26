import React from 'react';
import { 
  Heart,
  Brain,
  Activity,
  Eye,
  Clipboard,
  Users,
  Star,
  BarChart
} from 'lucide-react';

const ServicesSection = () => {
  const services = [
    {
      icon: <Clipboard className="h-8 w-8" />,
      title: 'General Medicine',
      description: 'Comprehensive health check-ups and primary care services for all ages.'
    },
    {
      icon: <Brain className="h-8 w-8" />,
      title: 'Neurology',
      description: 'Expert care for neurological conditions with advanced treatment options.'
    },
    {
      icon: <Heart className="h-8 w-8" />,
      title: 'Cardiology',
      description: 'Specialized heart care with state-of-the-art diagnostic facilities.'
    },
    {
      icon: <Eye className="h-8 w-8" />,
      title: 'Ophthalmology',
      description: 'Complete eye care services from routine check-ups to advanced surgeries.'
    },
    {
      icon: <Activity className="h-8 w-8" />,
      title: 'Orthopedics',
      description: 'Treatment for bone and joint conditions with modern techniques.'
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: 'Family Medicine',
      description: 'Specialized healthcare services for the entire family.'
    },
    {
      icon: <Star className="h-8 w-8" />,
      title: 'Emergency Care',
      description: 'Round-the-clock emergency medical services.'
    },
    {
      icon: <BarChart className="h-8 w-8" />,
      title: 'Laboratory',
      description: 'Advanced diagnostic testing and laboratory services.'
    }
  ];

  return (
    <section id="services" className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Our Medical Services
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We offer a wide range of medical services and specialties to provide
            comprehensive healthcare for you and your family.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="text-blue-600 mb-4">{service.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
              <p className="text-gray-600">{service.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <button className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-blue-700 transition-colors">
            View All Services
          </button>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;