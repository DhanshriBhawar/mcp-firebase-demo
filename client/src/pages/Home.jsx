import Header from '../components/Header';
import Hero from '../components/Hero';
import NotificationCenter from '../components/NotificationCenter';
import BlogCard from '../components/BlogCard';
import About from '../components/About';
import Contact from '../components/Contact';
import Footer from '../components/Footer';

const blogPosts = [
  {
    title: 'React Basics',
    description: 'Understand React components, hooks, and JSX for building modern interfaces.',
    image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Express Server Setup',
    description: 'Learn how to configure a lightweight Express API server for your app.',
    image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Firebase Introduction',
    description: 'A gentle overview of Firebase features for web push and realtime workflows.',
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'MCP Overview',
    description: 'Explore Salesforce Marketing Cloud Personalization concepts in a demo context.',
    image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'REST APIs',
    description: 'Build and consume REST APIs with Express and Axios for client-server communication.',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Web Push Notifications',
    description: 'Prepare your UI for browser push notifications with a clear placeholder experience.',
    image: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1200&q=80',
  },
];

function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />

        <section className="section container" id="notification-center">
          <div className="section-heading">
            <h2>Notification Center</h2>
            <p>Firebase Web Push is initialized automatically so visitors can receive notifications without manual setup. MCP integration will be added later.</p>
          </div>
          <NotificationCenter />
        </section>

        <section className="section container" id="blogs">
          <div className="section-heading">
            <h2>Featured Blog Articles</h2>
            <p>Read simple technical stories and preparatory content for Firebase and MCP integration.</p>
          </div>
          <div className="blog-grid">
            {blogPosts.map((post) => (
              <BlogCard key={post.title} title={post.title} description={post.description} image={post.image} />
            ))}
          </div>
        </section>

        <section className="section container" id="about">
          <div className="section-heading">
            <h2>About This Project</h2>
            <p>This full-stack demo site is being built to learn Firebase Web Push Notifications and Salesforce MCP integration. It uses React, Express, and placeholder features for the next phase.</p>
          </div>
          <About />
        </section>

        <section className="section container" id="contact">
          <div className="section-heading">
            <h2>Contact</h2>
            <p>Send us a message using the demo contact form. Validation is handled on the client side.</p>
          </div>
          <Contact />
        </section>
      </main>
      <Footer />
    </>
  );
}

export default Home;
