import React, { useEffect } from 'react';
import { Heart, Award, Users, Calendar } from 'lucide-react';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';

interface AboutUsPageProps {
  setCurrentPage: (page: string) => void;
}

const AboutUsPage: React.FC<AboutUsPageProps> = ({ setCurrentPage }) => {
  // Set current page for navigation highlighting
  useEffect(() => {
    setCurrentPage('About');
  }, [setCurrentPage]);

  // Team members data
  const teamMembers = [
    {
      name: "Dr. Sarah Johnson",
      role: "Chief Medical Officer",
      image: "https://randomuser.me/api/portraits/women/32.jpg",
      bio: "Dr. Johnson has over 15 years of experience in cardiology and healthcare management."
    },
    {
      name: "Dr. Michael Chen",
      role: "Head of Neurology",
      image: "https://randomuser.me/api/portraits/men/44.jpg",
      bio: "An award-winning neurologist with a passion for advancing treatment techniques."
    },
    {
      name: "Dr. Emily Rodriguez",
      role: "Chief of Surgery",
      image: "https://randomuser.me/api/portraits/women/67.jpg",
      bio: "Specializing in complex surgical procedures with over a decade of experience."
    },
    {
      name: "Dr. James Wilson",
      role: "Head of Pediatrics",
      image: "https://randomuser.me/api/portraits/men/32.jpg",
      bio: "Dedicated to providing compassionate care for children and their families."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-blue-50 to-white py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">About MediCare</h1>
              <p className="text-xl mb-8 text-gray-600">
                Providing exceptional healthcare with compassion and innovation for over 25 years.
              </p>
            </div>
          </div>
        </section>
        
        {/* Our Story */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-8 text-center text-gray-900">Our Story</h2>
              
              <div className="bg-white rounded-xl shadow-md p-6 md:p-8 mb-12">
                <div className="prose prose-lg max-w-none text-gray-600">
                  <p>
                    MediCare was founded in 1998 with a mission to provide accessible, high-quality healthcare to our community. What began as a small clinic with just three doctors has grown into a comprehensive medical center serving thousands of patients annually.
                  </p>
                  
                  <p>
                    Our journey has been guided by our commitment to patient-centered care. We believe that healthcare should be both effective and compassionate, treating not just the illness but caring for the whole person.
                  </p>
                  
                  <p>
                    Over the years, we've invested in cutting-edge technology and expanded our facilities, but our core values remain unchanged. We continue to put patients first, embrace innovation, maintain the highest standards of medical practice, and contribute positively to our community.
                  </p>
                  
                  <p>
                    Today, MediCare is recognized as a leader in healthcare, known for our exceptional medical staff, comprehensive services, and commitment to making a difference in the lives of those we serve.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Our Values */}
        <section className="py-16 bg-blue-600 text-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-12 text-center">Our Core Values</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="bg-white rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Patient-Centered Care</h3>
                <p className="text-blue-100">
                  We put patients at the center of everything we do, respecting their needs, preferences, and values.
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-white rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
                  <Award className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Excellence</h3>
                <p className="text-blue-100">
                  We strive for excellence in all aspects of our service and continuously work to improve our care.
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-white rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Compassion</h3>
                <p className="text-blue-100">
                  We treat each patient with kindness, empathy, and respect, recognizing their individual needs.
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-white rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
                  <Calendar className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Innovation</h3>
                <p className="text-blue-100">
                  We embrace new technologies and approaches to deliver the most effective care possible.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Our Team */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-12 text-center text-gray-900">Our Leadership Team</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {teamMembers.map((member, index) => (
                <div key={index} className="bg-white rounded-xl shadow-md overflow-hidden">
                  <div className="h-48 bg-gray-200">
                    {/* Replace with actual image in production */}
                    <div className="h-full w-full bg-gray-300 flex items-center justify-center">
                      <span className="text-gray-500">Doctor Photo</span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-1 text-gray-900">{member.name}</h3>
                    <p className="text-blue-600 font-medium mb-3">{member.role}</p>
                    <p className="text-gray-600">{member.bio}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Achievements */}
        <section className="py-16 bg-gray-100">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-12 text-center text-gray-900">Our Achievements</h2>
            
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="bg-blue-100 rounded-full p-2 mt-1 mr-4">
                      <Award className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-1 text-gray-900">Excellence in Patient Care</h3>
                      <p className="text-gray-600">Recognized with the National Healthcare Excellence Award for three consecutive years (2021-2023).</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-blue-100 rounded-full p-2 mt-1 mr-4">
                      <Award className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-1 text-gray-900">Top-Rated Medical Facility</h3>
                      <p className="text-gray-600">Ranked among the top 5% of hospitals nationwide for patient satisfaction and quality of care.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-blue-100 rounded-full p-2 mt-1 mr-4">
                      <Award className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-1 text-gray-900">Innovation in Healthcare</h3>
                      <p className="text-gray-600">Pioneer in implementing telemedicine services, serving over 10,000 patients remotely since 2020.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-blue-100 rounded-full p-2 mt-1 mr-4">
                      <Award className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-1 text-gray-900">Community Service</h3>
                      <p className="text-gray-600">Provided over $5 million in charitable care and community health programs in the last decade.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default AboutUsPage;