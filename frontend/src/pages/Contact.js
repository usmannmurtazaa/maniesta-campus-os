import { useState } from 'react';
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

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errorMsg) setErrorMsg('');
  };

  const validate = () => {
    if (!form.name.trim()) return 'Full name is required.';
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) return 'A valid email is required.';
    if (!form.message.trim()) return 'Message cannot be empty.';
    return null;
  };

  const handleSubmit = async e => {
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
    <div className="min-h-screen bg-surface-subtle flex items-center justify-center px-4 py-16">
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
            className="inline-flex items-center text-sm text-content-muted hover:text-content-primary transition-colors duration-200 font-medium rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
          >
            &larr; Back to Login
          </Link>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-content-primary mb-2 text-center tracking-tight">
          Contact
        </h1>
        <p className="text-sm text-content-muted mb-8 text-center">
          Have a question or want a demo? Send me a message.
        </p>

        {status === 'success' ? (
          <div className="bg-success-50/70 border border-success-500/30 rounded-2xl p-8 text-center">
            <div className="w-14 h-14 rounded-full bg-success-500/15 flex items-center justify-center mx-auto mb-4">
              <FaCheckCircle className="text-success-600 text-2xl" aria-hidden="true" />
            </div>
            <p className="font-semibold text-content-primary">Thank you for reaching out!</p>
            <p className="text-sm text-content-muted mt-1">
              I will get back to you as soon as possible.
            </p>
            <button
              type="button"
              onClick={() => setStatus('idle')}
              className="mt-5 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors duration-200 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
            >
              Send another message
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {errorMsg && (
              <div
                className="bg-danger-50/70 border border-danger-500/30 text-danger-700 rounded-lg p-3 text-sm"
                role="alert"
              >
                {errorMsg}
              </div>
            )}

            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-content-primary mb-1.5"
              >
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={form.name}
                onChange={handleChange}
                className="input"
                placeholder="Your name"
                aria-required="true"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-content-primary mb-1.5"
              >
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={form.email}
                onChange={handleChange}
                className="input"
                placeholder="you@example.com"
                aria-required="true"
              />
            </div>

            <div>
              <label
                htmlFor="message"
                className="block text-sm font-medium text-content-primary mb-1.5"
              >
                Message
              </label>
              <textarea
                id="message"
                name="message"
                rows="5"
                required
                value={form.message}
                onChange={handleChange}
                className="input"
                placeholder="How can I help you?"
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
                  <FaSpinner className="animate-spin mr-2" aria-hidden="true" />
                  Sending...
                </>
              ) : (
                'Send Message'
              )}
            </button>
          </form>
        )}

        <div className="mt-10 text-center text-sm text-content-muted">
          <p>
            Or email me directly at{' '}
            <a
              href="mailto:usmanmurtazaportfolio@gmail.com"
              className="text-primary-600 hover:text-primary-700 font-medium transition-colors duration-200 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
            >
              usmanmurtazaportfolio@gmail.com
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Contact;
