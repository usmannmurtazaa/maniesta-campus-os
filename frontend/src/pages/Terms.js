import React from 'react';
import { Link } from 'react-router-dom';

const Terms = () => {
  const year = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-16">
        {/* Back navigation */}
        <div className="mb-8">
          <Link
            to="/login"
            className="text-sm text-neutral-500 hover:text-neutral-700 transition-colors font-medium"
          >
            &larr; Back to Login
          </Link>
        </div>

        <article className="prose prose-neutral max-w-none">
          <h1>Terms of Service</h1>
          <p className="text-sm text-neutral-500">Last updated: {year}</p>

          <p>
            By accessing or using Maniesta Campus OS (&quot;the Service&quot;), you agree to be bound
            by these Terms of Service. If you do not agree, you may not use the Service.
          </p>

          <h2>Account Registration</h2>
          <p>
            You must provide accurate and complete information when creating an account. You
            are responsible for maintaining the confidentiality of your login credentials and
            for all activities that occur under your account.
          </p>

          <h2>Acceptable Use</h2>
          <p>You agree not to:</p>
          <ul>
            <li>Use the Service for any unlawful purpose or in violation of any applicable laws.</li>
            <li>Impersonate any person or entity, or falsely state your affiliation.</li>
            <li>Interfere with or disrupt the operation of the Service.</li>
            <li>Attempt to gain unauthorised access to any part of the Service or its related systems.</li>
          </ul>

          <h2>Intellectual Property</h2>
          <p>
            The Service and its original content, features, and functionality are owned by
            Maniesta Campus OS and are protected by international copyright and trademark laws.
          </p>

          <h2>Limitation of Liability</h2>
          <p>
            In no event shall Maniesta Campus OS be liable for any indirect, incidental,
            special, consequential, or punitive damages arising out of or related to your use
            of the Service.
          </p>

          <h2>Termination</h2>
          <p>
            We may terminate or suspend your account at any time, without prior notice, if
            you breach these Terms. Upon termination, your right to use the Service will
            immediately cease.
          </p>

          <h2>Changes to Terms</h2>
          <p>
            We reserve the right to modify these terms at any time. Changes will be effective
            immediately upon posting. Your continued use of the Service after any modifications
            indicates your acceptance of the new terms.
          </p>

          <h2>Contact</h2>
          <p>
            For any questions regarding these Terms, please contact us at{' '}
            <a href="mailto:maniestasuite@gmail.com">maniestasuite@gmail.com</a>.
          </p>
        </article>

        <div className="mt-16 pt-6 border-t border-neutral-200">
          <Link
            to="/login"
            className="text-sm text-neutral-500 hover:text-neutral-700 transition-colors font-medium"
          >
            &larr; Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Terms;