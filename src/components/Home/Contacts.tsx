import React, { useEffect } from 'react';
import { MapPin, Phone, Mail, Clock, ExternalLink } from 'lucide-react';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';

interface ContactsPageProps {
  setCurrentPage: (page: string) => void;
}

const ContactsPage: React.FC<ContactsPageProps> = ({ setCurrentPage }) => {
  // Set current page for navigation highlighting
  useEffect(() => {
    setCurrentPage('Contacts');
  }, [setCurrentPage]);

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically handle the form submission, e.g., send data to server
    alert('Your message has been sent. We will get back to you soon!');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-blue-50 to-white py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">Contact Us</h1>
              <p className="text-xl mb-8 text-gray-600">
                We're here to help. Reach out to us with any questions or concerns about our services.
              </p>
            </div>
          </div>
        </section>
        
        {/* Contact Information */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Contact Form */}
              <div className="bg-white rounded-xl shadow-md p-6 md:p-8">
                <h2 className="text-2xl font-bold mb-6 text-gray-900">Send us a Message</h2>
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Your Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                      Subject
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div className="mb-6">
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                      Your Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={5}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    ></textarea>
                  </div>
                  
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    Send Message
                  </button>
                </form>
              </div>
              
              {/* Contact Information */}
              <div>
                <div className="bg-white rounded-xl shadow-md p-6 md:p-8 mb-8">
                  <h2 className="text-2xl font-bold mb-6 text-gray-900">Contact Information</h2>
                  
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <MapPin className="h-6 w-6 text-blue-600 mr-3 mt-1" />
                      <div>
                        <h3 className="font-semibold text-gray-900">Our Location</h3>
                        <p className="text-gray-600">
                          123 Healthcare Avenue<br />
                          Medical District<br />
                          New York, NY 10001
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <Phone className="h-6 w-6 text-blue-600 mr-3 mt-1" />
                      <div>
                        <h3 className="font-semibold text-gray-900">Phone</h3>
                        <p className="text-gray-600">
                          <a href="tel:+11234567890" className="hover:text-blue-600">+1 (123) 456-7890</a> (Main)<br />
                          <a href="tel:+18001234567" className="hover:text-blue-600">+1 (800) 123-4567</a> (Toll-free)
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <Mail className="h-6 w-6 text-blue-600 mr-3 mt-1" />
                      <div>
                        <h3 className="font-semibold text-gray-900">Email</h3>
                        <p className="text-gray-600">
                          <a href="mailto:info@medicare.com" className="hover:text-blue-600">info@medicare.com</a><br />
                          <a href="mailto:support@medicare.com" className="hover:text-blue-600">support@medicare.com</a>
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <Clock className="h-6 w-6 text-blue-600 mr-3 mt-1" />
                      <div>
                        <h3 className="font-semibold text-gray-900">Hours of Operation</h3>
                        <p className="text-gray-600">
                          Monday - Friday: 8:00 AM - 7:00 PM<br />
                          Saturday: 9:00 AM - 5:00 PM<br />
                          Sunday: Closed<br />
                          <span className="font-semibold">Emergency Care:</span> 24/7
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Map */}
                <div className="bg-white rounded-xl shadow-md p-6 md:p-8">
                  <h2 className="text-2xl font-bold mb-6 text-gray-900">Find Us</h2>
                  <div className="rounded-lg overflow-hidden border border-gray-200 h-64 bg-gray-200 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-gray-500 mb-2">Map would be displayed here</p>
                      <a 
                        href="https://maps.google.com" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-blue-600 hover:text-blue-800"
                      >
                        View on Google Maps
                        <ExternalLink className="h-4 w-4 ml-1" />
                      </a>
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

export default ContactsPage;