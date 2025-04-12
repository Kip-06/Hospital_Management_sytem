import React, { useState, useEffect } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import { ArrowLeft, Calendar, User, Clock, Search, Filter } from 'lucide-react';
import Navbar from '../Navbar/Navbar';

// Define props interface for the Blog component
interface BlogProps {
  setCurrentPage: React.Dispatch<React.SetStateAction<string>>;
}

// Blog Post type definition
interface BlogPost {
  id: number;
  title: string;
  summary: string;
  content: string;
  author: string;
  date: string;
  readTime: string;
  category: string;
  image: string;
  slug: string;
}

// Social Share component
const SocialShare: React.FC<{ title: string; url: string }> = ({ title, url }) => {
  return (
    <div className="flex items-center space-x-4 my-6">
      <span className="text-gray-700 font-medium">Share:</span>
      <a 
        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-400 hover:text-blue-600"
        aria-label="Share on Twitter"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.44 4.83c-.8.37-1.5.38-2.22.02.93-.56.98-.96 1.32-2.02-.88.52-1.86.9-2.9 1.1-.82-.88-2-1.43-3.3-1.43-2.5 0-4.55 2.04-4.55 4.54 0 .36.03.7.1 1.04-3.77-.2-7.12-2-9.36-4.75-.4.67-.6 1.45-.6 2.3 0 1.56.8 2.95 2 3.77-.74-.03-1.44-.23-2.05-.57v.06c0 2.2 1.56 4.03 3.64 4.44-.67.2-1.37.2-2.06.08.58 1.8 2.26 3.12 4.25 3.16-1.9 1.47-4.3 2.35-6.9 2.35-.45 0-.9-.03-1.33-.08 2.46 1.56 5.38 2.47 8.5 2.47 10.23 0 15.8-8.44 15.8-15.8 0-.24 0-.48-.02-.7.9-.67 1.7-1.5 2.3-2.45z"/>
        </svg>
      </a>
      <a 
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:text-blue-800"
        aria-label="Share on Facebook"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.77 7.46H14.5v-1.9c0-.9.6-1.1 1-1.1h3V.5h-4.33C10.24.5 9.5 3.44 9.5 5.32v2.15h-3v4h3v12h5v-12h3.85l.42-4z"/>
        </svg>
      </a>
      <a 
        href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-800 hover:text-blue-900"
        aria-label="Share on LinkedIn"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      </a>
      <a 
        href={`mailto:?subject=${encodeURIComponent(title)}&body=Check out this article: ${encodeURIComponent(url)}`}
        className="text-gray-500 hover:text-gray-700"
        aria-label="Share via Email"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
        </svg>
      </a>
    </div>
  );
};

// Newsletter signup component
const NewsletterSignup: React.FC = () => {
  const [email, setEmail] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would connect to your email service
    alert(`Thank you for subscribing with ${email}!`);
    setEmail('');
  };
  
  return (
    <div className="bg-blue-50 rounded-lg p-6 my-8">
      <h3 className="text-xl font-semibold text-gray-900 mb-2">Subscribe to Our Newsletter</h3>
      <p className="text-gray-600 mb-4">Stay updated with the latest health insights and hospital news.</p>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
        <input
          type="email"
          placeholder="Your email address"
          className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Subscribe
        </button>
      </form>
    </div>
  );
};

// Related Articles component
const RelatedArticles: React.FC<{ currentPost: BlogPost; allPosts: BlogPost[] }> = ({ currentPost, allPosts }) => {
  // Get posts in the same category, excluding the current post
  const relatedPosts = allPosts
    .filter(post => post.category === currentPost.category && post.id !== currentPost.id)
    .slice(0, 3);
    
  if (relatedPosts.length === 0) return null;
  
  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Articles</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {relatedPosts.map(post => (
          <Link to={`/blog/${post.slug}`} key={post.id} className="block">
            <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition duration-300">
              <div className="h-40 relative overflow-hidden">
                <img 
                  src={post.image} 
                  alt={post.title} 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-800 mb-1">{post.title}</h3>
                <p className="text-sm text-gray-500">{post.readTime}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

// Blog posts data - shared between components
const getBlogPosts = () => [
  {
    id: 1,
    title: 'Understanding Preventive Healthcare',
    summary: 'Learn how preventive measures can significantly improve your long-term health outcomes and quality of life.',
    content: `
      <p>Preventive healthcare focuses on measures taken to prevent diseases rather than curing them or treating their symptoms. The core components of preventive healthcare include regular check-ups, screenings, vaccinations, and maintaining a healthy lifestyle through proper diet and exercise.</p>
      
      <h3>The Importance of Regular Check-ups</h3>
      <p>Regular medical check-ups allow healthcare providers to detect potential health issues before they become serious. Early detection is crucial for effective treatment of many conditions, including cancer, heart disease, and diabetes.</p>
      
      <h3>Screenings and Their Benefits</h3>
      <p>Health screenings are tests that look for diseases before you have symptoms. Examples include blood pressure checks, cholesterol tests, and cancer screenings like mammograms and colonoscopies. These screenings can identify issues at an early stage when treatments are most effective.</p>
      
      <h3>Vaccinations: A Cornerstone of Prevention</h3>
      <p>Immunizations protect against serious and potentially life-threatening diseases. They work by stimulating the body's immune system to recognize and fight specific pathogens. Vaccines not only protect individuals but also contribute to community health by preventing the spread of infectious diseases.</p>
      
      <h3>Lifestyle Choices and Their Impact</h3>
      <p>Many chronic diseases are linked to lifestyle choices. Maintaining a balanced diet, engaging in regular physical activity, avoiding tobacco and excessive alcohol consumption, and managing stress are all critical components of preventive healthcare.</p>
      
      <h3>The Economic Benefit</h3>
      <p>Preventive care is not only beneficial for individual health but also makes economic sense. Preventing disease is typically less costly than treating it. Regular preventive care can lead to fewer emergency room visits, hospitalizations, and invasive procedures.</p>
      
      <h3>Taking Control of Your Health</h3>
      <p>Being proactive about your health means taking steps to prevent illness before it occurs. This includes staying informed about health recommendations, scheduling regular check-ups, and making healthy lifestyle choices. Remember, prevention is always better than cure.</p>
    `,
    author: 'Dr. Sarah Johnson',
    date: 'February 15, 2025',
    readTime: '8 min read',
    category: 'Wellness',
    image: 'https://via.placeholder.com/1200x600?text=Preventive+Healthcare',
    slug: 'understanding-preventive-healthcare'
  },
  {
    id: 2,
    title: 'The Importance of Mental Health',
    summary: 'Exploring the critical connection between mental health and overall physical wellbeing in modern healthcare.',
    content: `
      <p>Mental health is an essential component of overall health and well-being. It encompasses emotional, psychological, and social well-being and affects how we think, feel, act, handle stress, relate to others, and make choices.</p>
      
      <h3>The Mind-Body Connection</h3>
      <p>Research has consistently shown that mental health directly impacts physical health and vice versa. Chronic stress can lead to physical health problems such as high blood pressure, weakened immune system, and heart disease. Similarly, physical health conditions can lead to increased risk of mental health issues.</p>
      
      <h3>Common Mental Health Disorders</h3>
      <p>Mental health disorders are common, with conditions like anxiety disorders, depression, bipolar disorder, and schizophrenia affecting millions of people worldwide. These conditions can affect anyone regardless of age, gender, or socioeconomic status.</p>
      
      <h3>Breaking the Stigma</h3>
      <p>Despite the prevalence of mental health issues, stigma and misconceptions persist. This stigma can prevent people from seeking help and receiving the treatment they need. Education and open discussions about mental health are crucial for breaking down these barriers.</p>
      
      <h3>Treatment Options</h3>
      <p>Various treatment options are available for mental health disorders, including therapy, medication, lifestyle changes, and support groups. Treatment is often most effective when tailored to individual needs and may involve a combination of approaches.</p>
      
      <h3>Self-Care Strategies</h3>
      <p>Self-care plays a vital role in maintaining good mental health. Regular physical activity, adequate sleep, mindfulness practices, connecting with others, and engaging in activities you enjoy can all contribute to better mental well-being.</p>
      
      <h3>When to Seek Help</h3>
      <p>It's important to recognize when to seek professional help for mental health concerns. Warning signs may include persistent sadness or anxiety, extreme mood changes, withdrawal from social activities, fatigue, trouble sleeping, and thoughts of self-harm.</p>
      
      <h3>Creating Supportive Environments</h3>
      <p>Communities, workplaces, and educational institutions can promote mental health by creating supportive environments that foster open communication, provide resources, and acknowledge the importance of mental well-being.</p>
    `,
    author: 'Dr. Michael Chen',
    date: 'February 10, 2025',
    readTime: '10 min read',
    category: 'Mental Health',
    image: 'https://via.placeholder.com/1200x600?text=Mental+Health',
    slug: 'importance-of-mental-health'
  },
  {
    id: 3,
    title: 'Advances in Telemedicine Technology',
    summary: 'How new technologies are revolutionizing remote healthcare delivery and improving patient outcomes.',
    content: `
      <p>Telemedicine, the practice of providing healthcare remotely using telecommunications technology, has seen remarkable advancements in recent years. These innovations are transforming how healthcare is delivered, making it more accessible and efficient.</p>
      
      <h3>The Evolution of Telemedicine</h3>
      <p>Telemedicine has evolved from simple telephone consultations to sophisticated platforms that enable video conferencing, remote monitoring, and digital record-keeping. This evolution has been accelerated by improvements in internet connectivity, mobile technology, and healthcare-specific software.</p>
      
      <h3>Remote Patient Monitoring</h3>
      <p>One of the most significant advancements in telemedicine is remote patient monitoring (RPM). Wearable devices and sensors can now track vital signs, glucose levels, heart rhythm, and other health metrics, transmitting this data to healthcare providers in real-time. This allows for continuous monitoring without requiring in-person visits.</p>
      
      <h3>Artificial Intelligence in Telemedicine</h3>
      <p>AI is playing an increasingly important role in telemedicine, from chatbots that can perform initial assessments to algorithms that analyze medical images and detect patterns that might be missed by human eyes. AI can also help predict patient deterioration and recommend personalized treatment plans.</p>
      
      <h3>Virtual Reality Applications</h3>
      <p>Virtual reality (VR) is opening new possibilities in telemedicine, particularly in areas like pain management, physical therapy, and mental health treatment. VR can create immersive experiences that help patients with rehabilitation exercises or provide therapeutic environments for those with anxiety or PTSD.</p>
      
      <h3>Overcoming Barriers to Access</h3>
      <p>Telemedicine is breaking down geographical barriers, allowing patients in rural or underserved areas to access specialists and high-quality care. It also benefits patients with mobility issues, busy schedules, or those who live far from healthcare facilities.</p>
      
      <h3>Security and Privacy Considerations</h3>
      <p>As telemedicine advances, ensuring the security and privacy of patient information becomes increasingly important. Robust encryption, secure platforms, and strict adherence to privacy regulations are essential components of any telemedicine system.</p>
      
      <h3>The Future of Telemedicine</h3>
      <p>The future of telemedicine promises even greater integration with everyday life. From smart homes equipped with health monitoring technologies to augmented reality surgical consultations, the potential applications continue to expand, promising a healthcare landscape that is more connected, accessible, and patient-centered than ever before.</p>
    `,
    author: 'Dr. Emily Wilson',
    date: 'February 5, 2025',
    readTime: '7 min read',
    category: 'Technology',
    image: 'https://via.placeholder.com/1200x600?text=Telemedicine',
    slug: 'advances-in-telemedicine'
  },
  {
    id: 4,
    title: 'Nutrition Essentials for Heart Health',
    summary: 'Discover the dietary principles that can help maintain cardiovascular health and reduce the risk of heart disease.',
    content: `
      <p>Your diet plays a crucial role in maintaining heart health. Understanding which foods to include and which to limit can significantly reduce your risk of heart disease, which remains one of the leading causes of death worldwide.</p>
      
      <h3>Heart-Healthy Foods</h3>
      <p>Several food groups are particularly beneficial for heart health:</p>
      <ul>
        <li><strong>Fruits and vegetables:</strong> Rich in vitamins, minerals, and antioxidants, they help reduce inflammation and improve heart function.</li>
        <li><strong>Whole grains:</strong> Foods like brown rice, quinoa, and whole-wheat bread provide fiber that helps lower cholesterol levels.</li>
        <li><strong>Lean proteins:</strong> Fish (especially fatty fish high in omega-3 fatty acids), poultry, and plant-based proteins like legumes and tofu offer protein without excessive saturated fat.</li>
        <li><strong>Healthy fats:</strong> Sources like olive oil, avocados, and nuts contain monounsaturated and polyunsaturated fats that can improve cholesterol levels.</li>
      </ul>
      
      <h3>Foods to Limit</h3>
      <p>Some foods can contribute to heart disease risk and should be limited:</p>
      <ul>
        <li><strong>Saturated and trans fats:</strong> Found in fatty meats, full-fat dairy, and many processed foods, these can raise LDL (bad) cholesterol levels.</li>
        <li><strong>Sodium:</strong> Excess salt intake can increase blood pressure, a major risk factor for heart disease.</li>
        <li><strong>Added sugars:</strong> High sugar consumption is linked to obesity, inflammation, and elevated triglycerides, all of which can impact heart health.</li>
        <li><strong>Refined carbohydrates:</strong> White bread, pastries, and other refined grain products can contribute to inflammation and weight gain.</li>
      </ul>
      
      <h3>The Mediterranean Diet</h3>
      <p>The Mediterranean diet is consistently rated as one of the best eating patterns for heart health. This diet emphasizes:</p>
      <ul>
        <li>Abundant plant foods (fruits, vegetables, whole grains, legumes, nuts)</li>
        <li>Olive oil as the primary fat source</li>
        <li>Moderate consumption of fish, poultry, and dairy</li>
        <li>Limited red meat</li>
        <li>Optional moderate consumption of wine with meals</li>
      </ul>
      <p>Studies have shown that following the Mediterranean diet can reduce the risk of heart disease by up to 30%.</p>
      
      <h3>DASH Diet for Blood Pressure Management</h3>
      <p>The Dietary Approaches to Stop Hypertension (DASH) diet was specifically designed to help lower blood pressure. It shares many similarities with the Mediterranean diet but places additional emphasis on limiting sodium intake and increasing consumption of potassium, calcium, and magnesium-rich foods, which help regulate blood pressure.</p>
      
      <h3>Portion Control and Weight Management</h3>
      <p>Maintaining a healthy weight is essential for heart health, as excess weight—particularly around the midsection—increases the risk of heart disease. Portion control, along with a balanced diet and regular physical activity, is key to weight management.</p>
      
      <h3>Staying Hydrated</h3>
      <p>Proper hydration supports overall cardiovascular function. Water is the best choice for hydration, while sugary beverages and excessive alcohol should be limited.</p>
      
      <h3>Consulting with Healthcare Providers</h3>
      <p>Individual nutritional needs can vary based on existing health conditions, medications, and other factors. It's important to consult with healthcare providers before making significant dietary changes, especially for those with existing heart conditions or on medication.</p>
    `,
    author: 'Dr. Robert Smith',
    date: 'January 30, 2025',
    readTime: '6 min read',
    category: 'Nutrition',
    image: 'https://via.placeholder.com/1200x600?text=Heart+Health+Nutrition',
    slug: 'nutrition-essentials-heart-health'
  },
  {
    id: 5,
    title: 'Understanding Pediatric Vaccinations',
    summary: 'A comprehensive guide to childhood vaccines, their benefits, and addressing common concerns.',
    content: `
      <p>Vaccinations are one of the most important tools we have to protect children from serious diseases. They have dramatically reduced the incidence of many childhood illnesses that once caused widespread disability and death.</p>
      
      <h3>How Vaccines Work</h3>
      <p>Vaccines work by introducing a harmless form of a pathogen (or part of a pathogen) into the body. This stimulates the immune system to recognize and fight the invader without causing disease. Once the immune system has been "trained" in this way, it can quickly recognize and neutralize the real pathogen if exposure occurs later.</p>
      
      <h3>Recommended Vaccination Schedule</h3>
      <p>Pediatric vaccination schedules are carefully designed by medical experts to provide optimal protection when children are most vulnerable to specific diseases. These schedules are based on extensive research and are regularly reviewed and updated as new information becomes available.</p>
      <p>The standard childhood vaccination schedule in the United States includes protection against 14 potentially serious diseases before age 2, including:</p>
      <ul>
        <li>Hepatitis B</li>
        <li>Rotavirus</li>
        <li>Diphtheria, Tetanus, and Pertussis (DTaP)</li>
        <li>Haemophilus influenzae type b (Hib)</li>
        <li>Pneumococcal disease</li>
        <li>Polio</li>
        <li>Influenza (yearly)</li>
        <li>Measles, Mumps, Rubella (MMR)</li>
        <li>Varicella (Chickenpox)</li>
        <li>Hepatitis A</li>
      </ul>
      <p>Additional vaccines are recommended for older children and adolescents, including those for human papillomavirus (HPV) and meningococcal disease.</p>
      
      <h3>The Safety of Vaccines</h3>
      <p>Vaccines undergo rigorous testing before being approved for use and continue to be monitored for safety after implementation. The benefits of vaccination far outweigh the risks of potential side effects, which are typically mild and temporary (such as soreness at the injection site or low-grade fever).</p>
      <p>Serious adverse events following vaccination are extremely rare. The risk of serious complications from vaccine-preventable diseases is much higher than the risk of serious adverse events from the vaccines themselves.</p>
      
      <h3>Addressing Common Concerns</h3>
      <p><strong>Concern: Too many vaccines overwhelm a child's immune system.</strong><br>
      Response: A child's immune system is exposed to thousands of foreign substances every day. The antigens in vaccines represent only a tiny fraction of what a child's immune system routinely handles. Moreover, today's vaccines are more refined, containing fewer antigens than older versions, even though they protect against more diseases.</p>
      
      <p><strong>Concern: Vaccines cause autism.</strong><br>
      Response: Extensive scientific research has found no link between vaccines and autism. The original study suggesting such a link has been retracted due to serious procedural and ethical flaws, and numerous subsequent studies have consistently shown no connection.</p>
      
      <p><strong>Concern: Natural immunity is better than vaccine-induced immunity.</strong><br>
      Response: While natural immunity (acquired through infection) can sometimes be stronger than vaccine-induced immunity, the risks associated with actually contracting many vaccine-preventable diseases far outweigh any potential benefits of natural immunity. Vaccines provide immunity without the potentially serious complications of the disease itself.</p>
      
      <h3>The Importance of Herd Immunity</h3>
      <p>When a significant portion of a population is vaccinated, it creates "herd immunity" or "community protection." This means that even those who cannot be vaccinated for medical reasons (such as infants too young for certain vaccines or individuals with compromised immune systems) receive some protection because the spread of contagious disease is contained.</p>
      
      <h3>Talking to Your Pediatrician</h3>
      <p>Parents with questions or concerns about vaccines should discuss them with their child's healthcare provider. Pediatricians can provide accurate information based on scientific evidence and help parents make informed decisions about their child's health.</p>
    `,
    author: 'Dr. Lisa Chen',
    date: 'January 25, 2025',
    readTime: '9 min read',
    category: 'Pediatrics',
    image: 'https://via.placeholder.com/1200x600?text=Pediatric+Vaccinations',
    slug: 'understanding-pediatric-vaccinations'
  },
  {
    id: 6,
    title: 'Sleep Disorders: Causes and Treatments',
    summary: 'Examining common sleep disorders, their impact on health, and the latest approaches to treatment.',
    content: `
      <p>Sleep is essential for physical health, cognitive function, and emotional well-being. Yet, millions of people worldwide suffer from sleep disorders that affect the quality and quantity of their sleep, with potentially serious health consequences.</p>
      
      <h3>Common Sleep Disorders</h3>
      
      <h4>Insomnia</h4>
      <p>Insomnia is characterized by difficulty falling asleep, staying asleep, or both, despite adequate opportunity for sleep. It's the most common sleep disorder, affecting up to 30% of adults at some point in their lives.</p>
      <p><strong>Causes:</strong> Stress, anxiety, depression, poor sleep habits, certain medications, caffeine, alcohol, nicotine, and underlying medical conditions.</p>
      <p><strong>Treatments:</strong> Cognitive Behavioral Therapy for Insomnia (CBT-I), sleep hygiene education, relaxation techniques, and in some cases, short-term use of sleep medications.</p>
      
      <h4>Sleep Apnea</h4>
      <p>Sleep apnea is a disorder characterized by pauses in breathing or periods of shallow breathing during sleep. These breathing pauses can last from a few seconds to minutes and may occur 30 times or more per hour.</p>
      <p><strong>Causes:</strong> Obstructive sleep apnea (OSA) occurs when throat muscles relax and block the airway, while central sleep apnea results from the brain's failure to signal the muscles to breathe. Risk factors include obesity, age, gender (more common in men), family history, smoking, and alcohol use.</p>
      <p><strong>Treatments:</strong> Continuous Positive Airway Pressure (CPAP) therapy, oral appliances, lifestyle changes (weight loss, avoiding alcohol before bed), and in some cases, surgery.</p>
      
      <h4>Restless Legs Syndrome (RLS)</h4>
      <p>RLS is a neurological disorder characterized by uncomfortable sensations in the legs and an irresistible urge to move them, typically in the evening or at night when at rest.</p>
      <p><strong>Causes:</strong> Often idiopathic (unknown cause), but may be associated with iron deficiency, kidney failure, pregnancy, and certain medications.</p>
      <p><strong>Treatments:</strong> Iron supplementation if deficient, medications that affect dopamine in the brain, lifestyle changes, and treating underlying conditions.</p>
      
      <h4>Narcolepsy</h4>
      <p>Narcolepsy is a neurological disorder characterized by excessive daytime sleepiness, sleep attacks (falling asleep suddenly), and sometimes by additional symptoms such as cataplexy (sudden loss of muscle tone), sleep paralysis, and hallucinations.</p>
      <p><strong>Causes:</strong> Usually related to a deficiency in hypocretin, a brain chemical that regulates sleep and wakefulness. Most cases are believed to be autoimmune in nature.</p>
      <p><strong>Treatments:</strong> Stimulant medications to promote wakefulness, antidepressants for cataplexy, and sodium oxybate for improving nighttime sleep and reducing daytime symptoms.</p>
      
      <h3>The Impact of Sleep Disorders on Health</h3>
      <p>Untreated sleep disorders can lead to serious health problems, including:</p>
      <ul>
        <li>Increased risk of heart disease, stroke, and high blood pressure</li>
        <li>Compromised immune function</li>
        <li>Weight gain and obesity</li>
        <li>Type 2 diabetes</li>
        <li>Depression and anxiety</li>
        <li>Reduced cognitive function, memory problems, and impaired judgment</li>
        <li>Increased risk of accidents, especially while driving</li>
      </ul>
      
      <h3>Diagnosis of Sleep Disorders</h3>
      <p>Sleep disorders are typically diagnosed through a combination of:</p>
      <ul>
        <li>Medical history and physical examination</li>
        <li>Sleep diaries and questionnaires</li>
        <li>Sleep studies (polysomnography), which monitor brain activity, eye movements, heart rate, and breathing during sleep</li>
        <li>Multiple Sleep Latency Test (MSLT), which measures how quickly you fall asleep in a quiet environment during the day</li>
      </ul>
      
      <h3>Advances in Sleep Medicine</h3>
      <p>Recent advances in sleep medicine include:</p>
      <ul>
        <li>Improved CPAP devices that are smaller, quieter, and more comfortable</li>
        <li>Digital therapeutics and apps for insomnia that deliver CBT-I remotely</li>
        <li>Hypoglossal nerve stimulation for sleep apnea as an alternative to CPAP</li>
        <li>Improved understanding of the genetic and neurological basis of sleep disorders</li>
        <li>Advanced medication options with fewer side effects</li>
        <li>Wearable technology that can track sleep patterns and provide insights</li>
      </ul>
      
      <h3>Lifestyle Approaches for Better Sleep</h3>
      <p>Regardless of whether someone has a diagnosed sleep disorder, these lifestyle approaches can help improve sleep quality:</p>
      <ul>
        <li>Maintaining a consistent sleep schedule, even on weekends</li>
        <li>Creating a relaxing bedtime routine</li>
        <li>Ensuring the bedroom is dark, quiet, and at a comfortable temperature</li>
        <li>Limiting exposure to screens before bedtime</li>
        <li>Avoiding caffeine, alcohol, and large meals close to bedtime</li>
        <li>Regular exercise (but not too close to bedtime)</li>
        <li>Managing stress through relaxation techniques, mindfulness, or meditation</li>
      </ul>
      <h3>When to Seek Help</h3>
  <p>It's important to consult a healthcare provider if sleep problems persist for more than a few weeks, interfere with daily functioning, or are accompanied by other concerning symptoms. Many sleep disorders are highly treatable, and addressing them can lead to significant improvements in quality of life and overall health.</p>
`,
author: 'Dr. James Wilson',
date: 'January 20, 2025',
readTime: '8 min read',
category: 'Sleep Medicine',
image: 'https://via.placeholder.com/1200x600?text=Sleep+Disorders',
slug: 'sleep-disorders-causes-treatments'
  }
];

// Blog Page component
interface BlogPageProps {
    setCurrentPage: React.Dispatch<React.SetStateAction<string>>;
    }
    const BlogPage: React.FC<BlogPageProps> = ({ setCurrentPage }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    // Set current page on component mount
    useEffect(() => {
    setCurrentPage('Blog');
    }, [setCurrentPage]);
    // Get all blog posts
    const allBlogPosts = getBlogPosts();
    // Filter blog posts based on search term and category
    const filteredPosts = allBlogPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.summary.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || post.category.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
    });

    // Get unique categories
const categories = ['all', ...new Set(allBlogPosts.map(post => post.category.toLowerCase()))];
return (
<div className="min-h-screen bg-gray-50">

    <Navbar />
<main className="container mx-auto px-4 py-12">
{/* Header */}
<div className="flex items-center justify-between mb-8">
<div>
<h1 className="text-3xl md:text-4xl font-bold text-gray-900">Health Insights Blog</h1>
<p className="text-lg text-gray-600 mt-2">
Expert articles and resources to help you make informed health decisions
</p>
</div>
</div>

{/* Newsletter Signup */}
<NewsletterSignup />
    
    {/* Search and Filter */}
    <div className="bg-white rounded-lg shadow-sm p-4 mb-8">
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Search articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="w-full sm:w-auto flex items-center">
          <Filter className="h-5 w-5 text-gray-400 mr-2" />
          <select
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map((category, index) => (
              <option key={index} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
    
    {/* Featured Article */}
    {filteredPosts.length > 0 && (
      <div className="mb-12">
        <Link to={`/blog/${filteredPosts[0].slug}`} className="block">
          <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-300">
            <div className="md:flex">
              <div className="md:w-1/2">
                <img
                  src={filteredPosts[0].image}
                  alt={filteredPosts[0].title}
                  className="h-64 md:h-full w-full object-cover"
                />
              </div>
              <div className="md:w-1/2 p-6 md:p-8">
                <div className="flex items-center text-sm text-gray-500 mb-3">
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                    {filteredPosts[0].category}
                  </span>
                  <span className="mx-2">•</span>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {filteredPosts[0].date}
                  </div>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">{filteredPosts[0].title}</h2>
                <p className="text-gray-600 mb-4">{filteredPosts[0].summary}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-500">
                    <User className="w-4 h-4 mr-1" />
                    <span>{filteredPosts[0].author}</span>
                    <span className="mx-2">•</span>
                    <Clock className="w-4 h-4 mr-1" />
                    <span>{filteredPosts[0].readTime}</span>
                  </div>
                  <span className="text-blue-600 font-medium">Read More</span>
                </div>
              </div>
            </div>
          </div>
        </Link>
      </div>
    )}
    
    {/* Articles Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {filteredPosts.slice(1).map((post) => (
        <Link to={`/blog/${post.slug}`} key={post.id} className="block">
          <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition duration-300 h-full flex flex-col">
            <div className="h-48 bg-gray-200 relative overflow-hidden">
              <img 
                src={post.image} 
                alt={post.title} 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-6 flex-1 flex flex-col">
              <div className="flex items-center text-sm text-gray-500 mb-2">
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                  {post.category}
                </span>
                <span className="mx-2">•</span>
                <span>{post.date}</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">{post.title}</h3>
              <p className="text-gray-600 mb-4 flex-1">{post.summary}</p>
              <div className="flex justify-between items-center mt-auto">
                <span className="text-sm text-gray-500">By {post.author}</span>
                <span className="text-blue-600 font-medium hover:text-blue-800 flex items-center">
                  Read More
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
    
    {/* No Results Message */}
    {filteredPosts.length === 0 && (
      <div className="text-center py-12">
        <h3 className="text-xl font-medium text-gray-900 mb-2">No articles found</h3>
        <p className="text-gray-600">
          Try adjusting your search or filter to find what you're looking for.
        </p>
      </div>
    )}
  </main>
</div>
);
};
// Blog Detail Component
interface BlogDetailProps {
setCurrentPage: React.Dispatch<React.SetStateAction<string>>;
}
const BlogDetail: React.FC<BlogDetailProps> = ({ setCurrentPage }) => {
const { slug } = useParams<{ slug: string }>();
const [post, setPost] = useState<BlogPost | null>(null);
const [loading, setLoading] = useState(true);
const location = useLocation();
// Set current page on component mount
useEffect(() => {
setCurrentPage('Blog');
}, [setCurrentPage]);
// In a real app, this would be an API call
useEffect(() => {
// Get blog posts
const allBlogPosts = getBlogPosts();

// Find the post that matches the slug
const foundPost = allBlogPosts.find(p => p.slug === slug);
setPost(foundPost || null);
setLoading(false);
}, [slug]);
if (loading) {
return (
<div className="min-h-screen flex items-center justify-center">
<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
</div>
);
}
if (!post) {
return (
<div className="min-h-screen flex flex-col items-center justify-center p-4">
<h1 className="text-2xl font-bold text-gray-900 mb-4">Article Not Found</h1>
<p className="text-gray-600 mb-6">The article you're looking for doesn't exist or has been removed.</p>
<Link
       to="/blog"
       className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
     >
Return to Blog
</Link>
</div>
);
}
// Get current URL for sharing
const currentUrl = window.location.href;
// Get all blog posts for related articles
const allBlogPosts = getBlogPosts();
return (
<div className="min-h-screen bg-gray-50">
<main className="container mx-auto px-4 py-12">
{/* Back to blog link */}
<Link to="/blog" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-8">
<ArrowLeft className="w-4 h-4 mr-1" />
Back to Blog
</Link>

{/* Article Header */}
<div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
      <img 
        src={post.image} 
        alt={post.title} 
        className="w-full h-64 md:h-96 object-cover"
      />
      <div className="p-6 md:p-8">
        <div className="flex flex-wrap items-center text-sm text-gray-500 mb-4 gap-3">
          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
            {post.category}
          </span>
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-1" />
            {post.date}
          </div>
          <div className="flex items-center">
            <User className="w-4 h-4 mr-1" />
            {post.author}
          </div>
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            {post.readTime}
          </div>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{post.title}</h1>
        <p className="text-xl text-gray-600">{post.summary}</p>
      </div>
    </div>
    
    {/* Social Sharing */}
    <SocialShare title={post.title} url={currentUrl} />
    
    {/* Article Content */}
    <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
      <div 
        className="prose max-w-none prose-blue prose-lg"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />
    </div>
    
    {/* Newsletter Signup */}
    <NewsletterSignup />
    
    {/* Related Articles */}
    <RelatedArticles currentPost={post} allPosts={allBlogPosts} />
  </main>
</div>
);
};
// Main Blog Component
const Blog: React.FC<BlogProps> = ({ setCurrentPage }) => {
const { slug } = useParams<{ slug?: string }>();
// If there's a slug parameter, show the article detail page
if (slug) {
return <BlogDetail setCurrentPage={setCurrentPage} />;
}
// Otherwise show the blog listing page
return <BlogPage setCurrentPage={setCurrentPage} />;
};
export default Blog;