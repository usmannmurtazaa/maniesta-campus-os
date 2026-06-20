import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase';
import { FaSpinner, FaCheckCircle } from 'react-icons/fa';

const INITIAL = { name: '', email: '', message: '' };

const Contact = () => {
  const [form, setForm] = useState(INITIAL);
  const [status, setStatus] = useState('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errorMsg) setErrorMsg('');
  };

  const validate = () => {
    if (!form.name.trim()) return 'Full name is required.';
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email))
      return 'A valid email is required.';
    if (!form.message.trim()) return 'Message cannot be empty.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setErrorMsg(validationError);
      return;
    }

    setStatus('submitting');
    setErrorMsg('');
    try {
      await addDoc(collection(db, 'contactMessages'), {
        name: form.name.trim(),
        email: form.email.trim(),
        message: form.message.trim(),
        createdAt: serverTimestamp(),
      });
      setStatus('success');
      setForm(INITIAL);
    } catch (err) {
      console.error('Contact form submission error:', err);
      setStatus('error');
      setErrorMsg('Something went wrong. Please try again later.');
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="max-w-lg w-full"
      >
        {/* Back link */}
        <div className="mb-6">
          <Link
            to="/login"
            className="text-sm text-neutral-500 hover:text-neutral-700 transition-colors font-medium"
          >
            &larr; Back to Login
          </Link>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-2 text-center tracking-tight">
          Contact Us
        </h1>
        <p className="text-sm text-neutral-500 mb-8 text-center">
          Have a question or want a demo? Send us a message.
        </p>

        {status === 'success' ? (
          <div className="bg-success-50 border border-success-200 rounded-2xl p-8 text-center">
            <div className="w-14 h-14 rounded-full bg-success-100 flex items-center justify-center mx-auto mb-4">
              <FaCheckCircle className="text-success-600 text-2xl" />
            </div>
            <p className="font-semibold text-neutral-900">Thank you for reaching out!</p>
            <p className="text-sm text-neutral-500 mt-1">We will get back to you as soon as possible.</p>
            <button
              onClick={() => setStatus('idle')}
              className="mt-5 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
            >
              Send another message
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {errorMsg && (
              <div
                className="bg-danger-50 border border-danger-200 text-danger-700 rounded-lg p-3 text-sm"
                role="alert"
              >
                {errorMsg}
              </div>
            )}

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-neutral-700 mb-1.5">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={form.name}
                onChange={handleChange}
                className="w-full"
                placeholder="Your name"
                aria-required="true"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-1.5">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={form.email}
                onChange={handleChange}
                className="w-full"
                placeholder="you@example.com"
                aria-required="true"
              />
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-neutral-700 mb-1.5">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                rows="5"
                required
                value={form.message}
                onChange={handleChange}
                className="w-full"
                placeholder="How can we help you?"
                aria-required="true"
              />
            </div>
            <button
              type="submit"
              disabled={status === 'submitting'}
              className="btn-primary w-full py-3 text-sm font-semibold inline-flex items-center justify-center"
            >
              {status === 'submitting' ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  Sending...
                </>
              ) : (
                'Send Message'
              )}
            </button>
          </form>
        )}

        <div className="mt-10 text-center text-sm text-neutral-500">
          <p>
            Or email us directly at{' '}
            <a href="mailto:maniestasuite@gmail.comm" className="text-primary-600 hover:text-primary-700 font-medium transition-colors">
              maniestasuite@gmail.com
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Contact;