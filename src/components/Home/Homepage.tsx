import React from 'react';
import Header from '../Header/Header';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';
import HeroSection from '../HeroSection/Hero';
import FeaturesSection from './FeaturesSection';
import ServicesSection from './ServicesSection';
import TestimonialsSection from './TestimonialsSection';
import BlogSection from './BlogSection';
import CallToActionSection from './CallToActionSection';
import AIChatbot from '../ChatbotPage/AIChatbotPage'; // Import the chatbot component

const Homepage: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation */}
      <Navbar />
      
      {/* Main Content */}
      <main className="flex-grow">
        {/* Hero Section */}
        <HeroSection />
        
        {/* Features Section */}
        <FeaturesSection />
        
        {/* Services Section */}
        <ServicesSection />
        
        {/* Testimonials Section */}
        <TestimonialsSection />
        
        {/* Blog Section */}
        <BlogSection />
        
        {/* Call to Action Section */}
        <CallToActionSection />
      </main>
      
      {/* Footer */}
      <Footer />
      
      {/* Floating Chatbot - will be positioned in bottom-right by its own styling */}
      <AIChatbot />
    </div>
  );
};

export default Homepage;