import React from 'react';
import { 
  Activity, 
  Brain, 
  Eye, 
  Users, 
  Star, 
  BarChart 
} from 'lucide-react';
import NavBar from '../Header/NavBar';

interface ServicesPageProps {
  setCurrentPage: (page: string) => void;
}

const ServicesPage: React.FC<ServicesPageProps> = ({ setCurrentPage }) => {
  const services = [
    {
      icon: <Activity className="h-12 w-12" />,
      title: "Cardiology",
      description: "Comprehensive heart care including diagnostics, treatment, and preventive cardiology with state-of-the-art facilities.",
      features: ["ECG & Echo", "Cardiac Surgery", "Heart Disease Treatment"]
    },
    {
      icon: <Brain className="h-12 w-12" />,
      title: "Neurology",
      description: "Expert neurological care with advanced diagnostic and therapeutic services for brain, spine, and nervous system disorders.",
      features: ["Brain Mapping", "Stroke Treatment", "Spine Surgery"]
    },
    {
      icon: <Activity className="h-12 w-12" />,
      title: "Emergency Care",
      description: "24/7 emergency medical services with rapid response teams and fully equipped emergency rooms.",
      features: ["24/7 Service", "Critical Care", "Trauma Center"]
    },
    {
      icon: <Eye className="h-12 w-12" />,
      title: "Ophthalmology",
      description: "Complete eye care services from routine check-ups to advanced surgical procedures.",
      features: ["Eye Surgery", "Vision Therapy", "Glaucoma Treatment"]
    },
    {
      icon: <Users className="h-12 w-12" />,
      title: "Family Medicine",
      description: "Specialized healthcare services for the entire family.",
      features: ["Primary Care", "Preventive Medicine", "Regular Check-ups"]
    },
    {
      icon: <BarChart className="h-12 w-12" />,
      title: "Laboratory Services",
      description: "State-of-the-art diagnostic laboratory offering a wide range of clinical tests and investigations.",
      features: ["Blood Tests", "Pathology", "Molecular Diagnostics"]
    },
    {
      icon: <Activity className="h-12 w-12" />,
      title: "Orthopedics",
      description: "Treatment for bone and joint conditions with modern techniques.",
      features: ["Fracture Treatment", "Joint Replacement", "Sports Medicine"]
    },
    {
      icon: <Brain className="h-12 w-12" />,
      title: "Psychiatry",
      description: "Mental health services including evaluation, therapy, and medication management for various conditions.",
      features: ["Psychiatric Evaluations", "Therapy Sessions", "Medication Management"]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar currentPage="services" setCurrentPage={setCurrentPage} />
      <main className="pt-16">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-blue-50 to-white py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
                Our Medical Services
              </h1>
              <p className="text-xl mb-8 text-gray-600">
                Comprehensive healthcare solutions with cutting-edge technology and expert medical professionals
              </p>
            </div>
          </div>
        </section>

        {/* Services Grid */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((service, index) => (
                <div 
                  key={index}
                  className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="text-blue-600 mb-4">{service.icon}</div>
                  <h3 className="text-2xl font-semibold mb-3">{service.title}</h3>
                  <p className="text-gray-600 mb-4">{service.description}</p>
                  <ul className="space-y-2">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-gray-600">
                        <Star className="h-4 w-4 text-blue-600 mr-2" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Additional Services */}
            <div className="mt-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Additional Services</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-md">
                  <h3 className="text-xl font-semibold mb-2">Preventive Care</h3>
                  <p className="text-gray-600">
                    Regular check-ups, screenings, and immunizations to keep you healthy and detect potential issues early.
                  </p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-md">
                  <h3 className="text-xl font-semibold mb-2">Diagnostic Services</h3>
                  <p className="text-gray-600">
                    Advanced imaging and laboratory services including X-rays, MRIs, CT scans, and comprehensive blood work.
                  </p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-md">
                  <h3 className="text-xl font-semibold mb-2">Emergency Care</h3>
                  <p className="text-gray-600">
                    24/7 emergency services with rapid response times and fully equipped facilities for urgent medical needs.
                  </p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-md">
                  <h3 className="text-xl font-semibold mb-2">Telehealth Services</h3>
                  <p className="text-gray-600">
                    Virtual consultations with our healthcare professionals from the comfort of your home.
                  </p>
                </div>
              </div>
            </div>

            {/* Call to Action */}
            <div className="text-center mt-12">
              <button 
                onClick={() => setCurrentPage('doctors')}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Book an Appointment
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default ServicesPage;