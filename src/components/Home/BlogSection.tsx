import React from 'react';

const BlogSection: React.FC = () => {
  // Blog post data
  const blogPosts = [
    {
      id: 1,
      title: 'Understanding Preventive Healthcare',
      summary: 'Learn how preventive measures can significantly improve your long-term health outcomes and quality of life.',
      author: 'Dr. Sarah Johnson',
      date: 'February 15, 2025',
      category: 'Wellness',
      image: 'https://via.placeholder.com/600x400?text=Preventive+Healthcare',
      slug: 'understanding-preventive-healthcare'
    },
    {
      id: 2,
      title: 'The Importance of Mental Health',
      summary: 'Exploring the critical connection between mental health and overall physical wellbeing in modern healthcare.',
      author: 'Dr. Michael Chen',
      date: 'February 10, 2025',
      category: 'Mental Health',
      image: 'https://via.placeholder.com/600x400?text=Mental+Health',
      slug: 'importance-of-mental-health'
    },
    {
      id: 3,
      title: 'Advances in Telemedicine Technology',
      summary: 'How new technologies are revolutionizing remote healthcare delivery and improving patient outcomes.',
      author: 'Dr. Emily Wilson',
      date: 'February 5, 2025',
      category: 'Technology',
      image: 'https://via.placeholder.com/600x400?text=Telemedicine',
      slug: 'advances-in-telemedicine'
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Latest Health Insights</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Stay informed with the latest articles, research, and health tips from our medical professionals.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map((post) => (
            <div key={post.id} className="bg-gray-50 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition duration-300">
              <div className="h-48 bg-gray-200 relative overflow-hidden">
                {/* Replace with actual image component once available */}
                <img 
                  src={post.image} 
                  alt={post.title} 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center text-sm text-gray-500 mb-2">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                    {post.category}
                  </span>
                  <span className="mx-2">•</span>
                  <span>{post.date}</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{post.title}</h3>
                <p className="text-gray-600 mb-4">{post.summary}</p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">By {post.author}</span>
                  <a 
                    href={`/blog/${post.slug}`} 
                    className="text-blue-600 font-medium hover:text-blue-800 flex items-center"
                  >
                    Read More
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <a 
            href="/blog" 
            className="inline-flex items-center px-6 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition duration-150"
          >
            View All Articles
            <svg className="ml-2 -mr-1 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
};

export default BlogSection;