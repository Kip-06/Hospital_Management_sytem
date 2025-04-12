import React from 'react';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';

const TestimonialsSection = () => {
  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Patient",
      message: "Outstanding care and attention from the medical team. The doctors were incredibly thorough and took the time to explain everything clearly.",
      rating: 5,
      image: "/api/placeholder/100/100"
    },
    {
      name: "Michael Chen",
      role: "Regular Patient",
      message: "The facility is modern and clean, and the staff is professional. I've been coming here for years and always receive excellent service.",
      rating: 5,
      image: "/api/placeholder/100/100"
    },
    {
      name: "Emily Williams",
      role: "New Patient",
      message: "I was nervous about my first visit, but the staff made me feel comfortable and well-cared for. Highly recommend their services!",
      rating: 5,
      image: "/api/placeholder/100/100"
    }
  ];

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, index) => (
      <Star
        key={index}
        className={`h-5 w-5 ${
          index < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <section id="testimonials" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            What Our Patients Say
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Hear from our patients about their experiences with our medical services
            and healthcare professionals.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-gray-50 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start mb-4">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover mr-4"
                />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {testimonial.name}
                  </h3>
                  <p className="text-sm text-gray-600">{testimonial.role}</p>
                </div>
              </div>
              <div className="flex mb-4">{renderStars(testimonial.rating)}</div>
              <p className="text-gray-600 italic">"{testimonial.message}"</p>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <div className="flex justify-center gap-4">
            <button
              className="p-2 rounded-full border border-gray-300 hover:border-blue-600 hover:text-blue-600 transition-colors"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              className="p-2 rounded-full border border-gray-300 hover:border-blue-600 hover:text-blue-600 transition-colors"
              aria-label="Next testimonial"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;