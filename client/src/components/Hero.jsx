function Hero() {
  return (
    <section className="hero" id="home">
      <div className="hero-content">
        <p className="eyebrow">Firebase Web Push Notification Demo</p>
        <h1 className="hero-title">React + Express + Firebase + MCP</h1>
        <p className="hero-subtitle">
          This demo website provides a modern base for future Firebase Cloud Messaging and Salesforce MCP personalization integration.
        </p>
        <div className="hero-buttons">
          <a href="#notification-center" className="btn btn-primary">
            Notification Center
          </a>
          <a href="#blogs" className="btn btn-secondary">
            Explore Articles
          </a>
        </div>
      </div>
    </section>
  );
}

export default Hero;
