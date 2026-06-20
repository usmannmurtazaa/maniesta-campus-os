import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaExternalLinkAlt } from 'react-icons/fa';

const FEATURES = [
  {
    title: 'Multi‑Institute Support',
    desc: 'Run multiple campuses under a single roof with complete data isolation.',
  },
  {
    title: 'Role‑Based Access',
    desc: 'Admins, teachers, and students see exactly what they need – nothing more.',
  },
  {
    title: 'Real‑Time Attendance',
    desc: 'Mark attendance live and view instant reports without manual consolidation.',
  },
  {
    title: 'Smart Mark Sheets',
    desc: 'Enter marks once; grades and percentages are calculated automatically.',
  },
  {
    title: 'Dashboard Insights',
    desc: 'Charts and key metrics give you a pulse of your institution at a glance.',
  },
  {
    title: 'Firebase Security',
    desc: 'Enterprise‑grade security rules protect every piece of data by organisation and role.',
  },
];

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const About = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Back navigation */}
      <div className="max-w-5xl mx-auto px-6 pt-6">
        <Link
          to="/login"
          className="text-sm text-neutral-500 hover:text-neutral-700 transition-colors font-medium"
        >
          &larr; Back to Home
        </Link>
      </div>

      {/* Hero */}
      <section className="py-20 px-6 text-center bg-gradient-to-br from-primary-50 to-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4 tracking-tight">
            About Maniesta Campus OS
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-neutral-600">
            The intelligent operating system for modern educational institutions.
          </p>
        </motion.div>
      </section>

      {/* Mission & Vision */}
      <section className="max-w-5xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-12">
        <div className="prose prose-neutral">
          <h2>Our Mission</h2>
          <p>
            To simplify campus management by providing a unified platform that
            connects administrators, teachers, and students in real time. We
            eliminate paperwork, reduce overhead, and give every institute the
            tools to focus on what matters most: education.
          </p>
        </div>
        <div className="prose prose-neutral">
          <h2>Our Vision</h2>
          <p>
            A world where every campus – from a small academy to a large
            university – operates with the same efficiency and insight as a
            modern technology company. Maniesta Campus OS is built to make that
            vision a reality.
          </p>
        </div>
      </section>

      {/* Key Features */}
      <section className="bg-neutral-50 py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-neutral-900 mb-10">
            Key Features
          </h2>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-8"
          >
            {FEATURES.map((feature) => (
              <motion.div
                key={feature.title}
                variants={itemVariants}
                className="stat-card hover:shadow-lg transition-shadow"
              >
                <h3 className="font-semibold text-neutral-800 mb-2">{feature.title}</h3>
                <p className="text-neutral-600 text-sm">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Why choose us */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-neutral-900 mb-10">
            Why Choose Maniesta Campus OS?
          </h2>
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div className="space-y-6">
              <div>
                <h3 className="font-medium text-neutral-900">Zero Infrastructure</h3>
                <p className="text-neutral-600 text-sm">
                  No servers to manage. Fully serverless on Firebase.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-neutral-900">Always Free Tier Ready</h3>
                <p className="text-neutral-600 text-sm">
                  Optimised to stay within Firebase’s free quota, even for mid‑sized
                  institutes.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-neutral-900">Accessible Anywhere</h3>
                <p className="text-neutral-600 text-sm">
                  Responsive design that works on desktops, tablets, and phones.
                </p>
              </div>
            </div>
            <div className="hidden md:block">
              <img
                src={`${process.env.PUBLIC_URL}/favicon.png`}
                alt="Maniesta Campus OS logo"
                className="rounded-xl shadow-lg w-full h-auto max-w-xs mx-auto"
                width={800}
                height={533}
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Founder & Creator */}
      <section className="max-w-5xl mx-auto px-6 py-12">
        <div className="stat-card max-w-2xl mx-auto text-center">
          <h2 className="text-xl font-semibold text-neutral-900 mb-3">Founder &amp; Creator</h2>
          <p className="text-neutral-600 text-sm leading-relaxed mb-5">
            Maniesta Campus OS was designed and developed by{' '}
            <span className="font-semibold text-neutral-800">Usman Murtaza</span> with a
            focus on delivering a modern, scalable, and user‑friendly campus management
            experience for educational institutions.
          </p>
          <a
            href="https://usmanmurtaza.netlify.app"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-5 py-2.5 rounded-lg bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 transition-colors shadow-sm"
          >
            Visit Portfolio <FaExternalLinkAlt className="ml-2 text-xs" />
          </a>
        </div>
      </section>

      {/* Call to action */}
      <div className="bg-primary-600 text-white py-16 px-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-2">Ready to transform your campus?</h2>
          <p className="mb-6 text-primary-100 max-w-md mx-auto">
            Join hundreds of institutes already using Maniesta Campus OS.
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center px-8 py-3 rounded-lg bg-white text-primary-700 font-semibold hover:bg-neutral-100 transition-colors shadow-sm"
          >
            Contact Us
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default About;