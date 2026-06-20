import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer
      className="bg-neutral-900 text-neutral-300 mt-auto border-t border-neutral-800"
      role="contentinfo"
    >
      <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        {/* Brand */}
        <div>
          <h3 className="text-white font-semibold text-lg mb-3 tracking-tight">
            Maniesta Campus OS
          </h3>
          <p className="text-sm leading-relaxed text-neutral-400">
            The smart operating system for modern educational institutions.
          </p>
        </div>

        {/* Quick Links */}
        <nav aria-label="Quick links">
          <h4 className="text-white font-medium text-sm mb-3 uppercase tracking-wider">
            Quick Links
          </h4>
          <ul className="space-y-2.5 text-sm">
            <li>
              <Link
                to="/about"
                className="text-neutral-400 hover:text-white transition-colors focus:outline-none focus:underline"
              >
                About
              </Link>
            </li>
            <li>
              <Link
                to="/contact"
                className="text-neutral-400 hover:text-white transition-colors focus:outline-none focus:underline"
              >
                Contact
              </Link>
            </li>
            <li>
              <Link
                to="/login"
                className="text-neutral-400 hover:text-white transition-colors focus:outline-none focus:underline"
              >
                Login
              </Link>
            </li>
          </ul>
        </nav>

        {/* Legal */}
        <nav aria-label="Legal links">
          <h4 className="text-white font-medium text-sm mb-3 uppercase tracking-wider">
            Legal
          </h4>
          <ul className="space-y-2.5 text-sm">
            <li>
              <Link
                to="/privacy"
                className="text-neutral-400 hover:text-white transition-colors focus:outline-none focus:underline"
              >
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link
                to="/terms"
                className="text-neutral-400 hover:text-white transition-colors focus:outline-none focus:underline"
              >
                Terms of Service
              </Link>
            </li>
          </ul>
        </nav>

        {/* Contact */}
        <div>
          <h4 className="text-white font-medium text-sm mb-3 uppercase tracking-wider">
            Contact
          </h4>
          <ul className="space-y-2.5 text-sm">
            <li>
              <a
                href="mailto:maniestasuite@gmail.com"
                className="text-neutral-400 hover:text-white transition-colors focus:outline-none focus:underline"
              >
                maniestasuite@gmail.com
              </a>
            </li>
            <li>
              <a
                href="tel:+15551234567"
                className="text-neutral-400 hover:text-white transition-colors focus:outline-none focus:underline"
              >
                +1 (555) 123-4567
              </a>
            </li>
            <li className="text-neutral-400">Karachi, Pakistan</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-neutral-800 py-5 text-center text-xs text-neutral-500">
        <span>&copy; {year} Maniesta Campus OS. All rights reserved.</span>
        <span className="mx-2">&middot;</span>
        <span>Built by </span>
        <a
          href="https://usmanmurtaza.netlify.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-neutral-500 hover:text-primary-400 transition-colors font-medium underline underline-offset-2 focus:outline-none focus:underline"
          aria-label="Usman Murtaza portfolio (opens in new tab)"
        >
          Usman Murtaza
        </a>
      </div>
    </footer>
  );
};

export default Footer;