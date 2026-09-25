import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaExternalLinkAlt, FaGithub } from 'react-icons/fa';

const FEATURES = [
  {
    title: 'Multi-Institute Support',
    desc: 'Run multiple campuses under a single roof with complete data isolation.',
  },
  {
    title: 'Role-Based Access',
    desc: 'Admins, teachers, and students see exactly what they need - nothing more.',
  },
  {
    title: 'Real-Time Attendance',
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
    desc: 'Enterprise-grade security rules protect every piece of data by organisation and role.',
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
          to="/"
          className="inline-flex items-center text-sm text-neutral-500 hover:text-neutral-900 transition-colors font-medium"
        >
          &larr; Back to Home
        </Link>
      </div>

      {/* Hero */}
      <section className="relative overflow-hidden py-24 px-6 text-center bg-gradient-to-br from-primary-50 via-white to-white">
        {/* Decorative gradient bloom */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 h-72 w-72 rounded-full bg-primary-200/40 blur-3xl"
        />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="relative"
        >
          <span className="inline-block mb-4 px-3 py-1 rounded-full text-xs font-medium tracking-wide uppercase text-primary-700 bg-primary-50 ring-1 ring-primary-100">
            About Maniesta Campus OS
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4 tracking-tight">
            Campus management, reimagined
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-neutral-600">
            The intelligent operating system for modern educational institutions.
          </p>
        </motion.div>
      </section>

      {/* Mission & Vision */}
      <section className="max-w-5xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-8">
        <div className="relative rounded-2xl p-8 bg-white ring-1 ring-neutral-200/70 shadow-sm hover:shadow-md hover:ring-primary-200 transition-all duration-300">
          <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-primary-400/60 to-transparent" />
          <h2 className="text-xl font-semibold text-neutral-900 mb-3">The Mission</h2>
          <p className="text-neutral-600 leading-relaxed text-sm">
            To simplify campus management by providing a unified platform that connects
            administrators, teachers, and students in real time. We eliminate paperwork, reduce
            overhead, and give every institute the tools to focus on what matters most: education.
          </p>
        </div>
        <div className="relative rounded-2xl p-8 bg-white ring-1 ring-neutral-200/70 shadow-sm hover:shadow-md hover:ring-primary-200 transition-all duration-300">
          <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-primary-400/60 to-transparent" />
          <h2 className="text-xl font-semibold text-neutral-900 mb-3">The Vision</h2>
          <p className="text-neutral-600 leading-relaxed text-sm">
            A world where every campus - from a small academy to a large university - operates with
            the same efficiency and insight as a modern technology company. Maniesta Campus OS is
            built to make that vision a reality.
          </p>
        </div>
      </section>

      {/* Key Features */}
      <section className="relative py-20 px-6 bg-neutral-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block mb-3 text-xs font-semibold tracking-widest uppercase text-primary-600">
              Features
            </span>
            <h2 className="text-3xl font-bold text-neutral-900 tracking-tight">
              Everything an institute needs
            </h2>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-6"
          >
            {FEATURES.map(feature => (
              <motion.div
                key={feature.title}
                variants={itemVariants}
                className="group relative rounded-2xl p-6 bg-white/70 backdrop-blur-sm ring-1 ring-neutral-200/60 transition-all duration-300 hover:-translate-y-1 hover:bg-white hover:ring-primary-300/70 hover:shadow-xl hover:shadow-primary-500/10"
              >
                <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-primary-400/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <h3 className="font-semibold text-neutral-900 mb-2 group-hover:text-primary-700 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-neutral-600 text-sm leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Why choose us */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block mb-3 text-xs font-semibold tracking-widest uppercase text-primary-600">
              Why Maniesta
            </span>
            <h2 className="text-3xl font-bold text-neutral-900 tracking-tight">
              Built for institutes that value simplicity
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-7">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary-50 ring-1 ring-primary-100 flex items-center justify-center">
                  <span className="text-primary-600 font-semibold text-sm">01</span>
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900 mb-1">Zero Infrastructure</h3>
                  <p className="text-neutral-600 text-sm leading-relaxed">
                    No servers to manage. Fully serverless on Firebase.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary-50 ring-1 ring-primary-100 flex items-center justify-center">
                  <span className="text-primary-600 font-semibold text-sm">02</span>
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900 mb-1">Always Free Tier Ready</h3>
                  <p className="text-neutral-600 text-sm leading-relaxed">
                    Optimised to stay within Firebase's free quota, even for mid-sized institutes.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary-50 ring-1 ring-primary-100 flex items-center justify-center">
                  <span className="text-primary-600 font-semibold text-sm">03</span>
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900 mb-1">Accessible Anywhere</h3>
                  <p className="text-neutral-600 text-sm leading-relaxed">
                    Responsive design that works on desktops, tablets, and phones.
                  </p>
                </div>
              </div>
            </div>

            <div className="hidden md:block">
              <div className="relative rounded-3xl p-6 bg-gradient-to-br from-primary-50 via-white to-neutral-50 ring-1 ring-neutral-200/70 shadow-sm">
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary-500/5 to-transparent" />
                <img
                  src={`${process.env.PUBLIC_URL}/favicon.png`}
                  alt="Maniesta Campus OS logo"
                  className="relative rounded-2xl shadow-lg w-full h-auto max-w-xs mx-auto"
                  width={400}
                  height={400}
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Founder & Creator */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="relative max-w-2xl mx-auto text-center rounded-2xl p-8 bg-white/80 backdrop-blur-sm ring-1 ring-neutral-200/70 shadow-sm">
          <div className="absolute top-0 left-12 right-12 h-px bg-gradient-to-r from-transparent via-primary-400/70 to-transparent" />

          <div className="relative inline-flex mb-4">
            <img
              src="https://github.com/usmannmurtazaa.png"
              alt="Usman Murtaza"
              className="w-20 h-20 rounded-full ring-2 ring-white shadow-md"
              width={80}
              height={80}
              loading="lazy"
            />
            <span
              aria-hidden="true"
              className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-500 ring-2 ring-white"
            />
          </div>

          <h2 className="text-lg font-semibold text-neutral-900 mb-1">Usman Murtaza</h2>
          <p className="text-xs uppercase tracking-widest text-primary-600 font-semibold mb-4">
            Founder &amp; Creator
          </p>

          <p className="text-neutral-600 text-sm leading-relaxed mb-6 max-w-lg mx-auto">
            Maniesta Campus OS was designed and developed end-to-end by{' '}
            <span className="font-semibold text-neutral-800">Usman Murtaza</span> — a Full Stack
            Developer building modern, responsive web applications with React, Firebase, and modern
            front-end tooling.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="https://usmanmurtaza.netlify.app"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 transition-colors shadow-sm"
            >
              Visit Portfolio <FaExternalLinkAlt className="ml-2 text-xs" />
            </a>
            <a
              href="https://github.com/usmannmurtazaa"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-white text-neutral-700 text-sm font-semibold ring-1 ring-neutral-300 hover:ring-neutral-400 hover:text-neutral-900 transition-all"
            >
              <FaGithub className="mr-2 text-base" /> GitHub
            </a>
          </div>
        </div>
      </section>

      {/* Call to action */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 to-primary-700 text-white py-20 px-6 text-center">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 left-1/3 h-64 w-64 rounded-full bg-white/10 blur-3xl"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="relative"
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-3 tracking-tight">
            Ready to transform your campus?
          </h2>
          <p className="mb-8 text-primary-100 max-w-md mx-auto">
            Start managing your campus with Maniesta Campus OS today.
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center px-8 py-3 rounded-lg bg-white text-primary-700 font-semibold hover:bg-neutral-100 transition-colors shadow-sm"
          >
            Contact Us
          </Link>
        </motion.div>
      </section>
    </div>
  );
};

export default About;
