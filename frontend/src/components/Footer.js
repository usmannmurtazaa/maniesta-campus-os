import React from 'react';
import { Link } from 'react-router-dom';
import { FaGithub, FaLinkedin, FaTwitter, FaDev } from 'react-icons/fa';

const SOCIAL_LINKS = [
  {
    name: 'GitHub',
    href: 'https://github.com/usmannmurtazaa',
    icon: FaGithub,
    label: 'GitHub profile',
  },
  {
    name: 'LinkedIn',
    href: 'https://www.linkedin.com/in/Usmannmurtazaa/',
    icon: FaLinkedin,
    label: 'LinkedIn profile',
  },
  {
    name: 'Twitter',
    href: 'https://twitter.com/usman_murtazaa',
    icon: FaTwitter,
    label: 'Twitter profile',
  },
  {
    name: 'Dev.to',
    href: 'https://dev.to/usmanmurtaza',
    icon: FaDev,
    label: 'Dev.to profile',
  },
];

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer
      className="relative bg-neutral-900 text-neutral-300 mt-auto border-t border-neutral-800"
      role="contentinfo"
    >
      {/* Top accent line */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary-500/60 to-transparent" />

      <div className="max-w-6xl mx-auto px-6 py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        {/* Brand */}
        <div>
          <Link
            to="/"
            className="inline-block text-white font-semibold text-lg mb-3 tracking-tight hover:text-primary-300 transition-colors"
          >
            Maniesta Campus OS
          </Link>
          <p className="text-sm leading-relaxed text-neutral-400 mb-4">
            The smart operating system for modern educational institutions.
          </p>
          <p className="text-xs text-neutral-500">
            Part of the{' '}
            <a
              href="https://maniesta.netlify.app"
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-400 hover:text-primary-300 underline underline-offset-2 transition-colors"
            >
              Maniesta ecosystem
            </a>
          </p>
        </div>

        {/* Quick Links */}
        <nav aria-label="Quick links">
          <h4 className="text-white font-semibold text-xs mb-4 uppercase tracking-wider">
            Quick Links
          </h4>
          <ul className="space-y-3 text-sm">
            <li>
              <Link
                to="/about"
                className="text-neutral-400 hover:text-white transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900 rounded"
              >
                About
              </Link>
            </li>
            <li>
              <Link
                to="/contact"
                className="text-neutral-400 hover:text-white transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900 rounded"
              >
                Contact
              </Link>
            </li>
            <li>
              <Link
                to="/login"
                className="text-neutral-400 hover:text-white transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900 rounded"
              >
                Login
              </Link>
            </li>
          </ul>
        </nav>

        {/* Legal */}
        <nav aria-label="Legal links">
          <h4 className="text-white font-semibold text-xs mb-4 uppercase tracking-wider">Legal</h4>
          <ul className="space-y-3 text-sm">
            <li>
              <Link
                to="/privacy"
                className="text-neutral-400 hover:text-white transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900 rounded"
              >
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link
                to="/terms"
                className="text-neutral-400 hover:text-white transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900 rounded"
              >
                Terms of Service
              </Link>
            </li>
          </ul>
        </nav>

        {/* Contact & Social */}
        <div>
          <h4 className="text-white font-semibold text-xs mb-4 uppercase tracking-wider">
            Get in touch
          </h4>
          <ul className="space-y-3 text-sm mb-5">
            <li>
              <a
                href="mailto:usmanmurtazaportfolio@gmail.com"
                className="text-neutral-400 hover:text-white transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900 rounded"
              >
                usmanmurtazaportfolio@gmail.com
              </a>
            </li>
            <li className="text-neutral-400">Karachi, Pakistan</li>
          </ul>

          <div className="flex flex-wrap gap-3" aria-label="Social links">
            {SOCIAL_LINKS.map(({ name, href, icon: Icon, label }) => (
              <a
                key={name}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-neutral-800/60 ring-1 ring-neutral-700 text-neutral-400 hover:text-white hover:bg-primary-600 hover:ring-primary-500 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900"
              >
                <Icon className="w-4 h-4" aria-hidden="true" />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="relative border-t border-neutral-800 py-5 text-center text-xs text-neutral-500">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 flex-wrap">
          <span>&copy; {year} Maniesta Campus OS. All rights reserved.</span>
          <span className="hidden sm:inline text-neutral-700">&middot;</span>
          <span>
            Built by{' '}
            <a
              href="https://usmanmurtaza.netlify.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-400 hover:text-primary-300 transition-colors font-medium underline underline-offset-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900 rounded"
              aria-label="Usman Murtaza portfolio (opens in new tab)"
            >
              Usman Murtaza
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
