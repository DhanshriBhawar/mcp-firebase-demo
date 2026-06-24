import { useState } from 'react';

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="header">
      <div className="container header-inner">
        <a href="#home" className="site-logo">
          MCP Push Demo
        </a>

        <button className="menu-toggle" onClick={() => setMenuOpen((prev) => !prev)} aria-label="Toggle navigation menu">
          ☰
        </button>

        <nav className={`nav-links ${menuOpen ? 'open' : ''}`}>
          <a href="#home" className="nav-link" onClick={() => setMenuOpen(false)}>
            Home
          </a>
          <a href="#blogs" className="nav-link" onClick={() => setMenuOpen(false)}>
            Blogs
          </a>
          <a href="#about" className="nav-link" onClick={() => setMenuOpen(false)}>
            About
          </a>
          <a href="#contact" className="nav-link" onClick={() => setMenuOpen(false)}>
            Contact
          </a>
        </nav>
      </div>
    </header>
  );
}

export default Header;
