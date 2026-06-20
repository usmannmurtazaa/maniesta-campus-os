import React from 'react';
import { Link } from 'react-router-dom';

const Privacy = () => {
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
          <h1>Privacy Policy</h1>
          <p className="text-sm text-neutral-500">Last updated: {year}</p>

          <p>
            Maniesta Campus OS (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy.
            This Privacy Policy explains how we collect, use, disclose, and safeguard your
            information when you use our platform.
          </p>

          <h2>Information We Collect</h2>
          <p>
            We collect information that you provide directly to us, such as your name, email
            address, and institutional affiliation when you register an account. We also
            automatically collect certain technical data including IP address, browser type,
            and usage patterns.
          </p>

          <h2>How We Use Your Information</h2>
          <ul>
            <li>To provide, maintain, and improve our services.</li>
            <li>To process your account registration and manage your institute.</li>
            <li>To communicate with you about updates, security alerts, and support.</li>
            <li>To analyse usage trends and optimise platform performance.</li>
          </ul>

          <h2>Data Sharing</h2>
          <p>
            We do not sell your personal information. We may share data with third‑party
            service providers (such as Firebase, our cloud infrastructure) solely to operate
            the platform. All data is stored securely within Firebase Firestore and protected
            by strict security rules.
          </p>

          <h2>Data Security</h2>
          <p>
            We implement industry‑standard security measures, including Firebase Security
            Rules, to protect your data against unauthorised access. However, no method of
            electronic storage is 100% secure, and we cannot guarantee absolute security.
          </p>

          <h2>Your Rights</h2>
          <p>
            You may request access to, correction of, or deletion of your personal data
            by contacting us at{' '}
            <a href="mailto:maniestasuite@gmail.com">maniestasuite@gmail.com</a>. We will respond within 30 days.
          </p>

          <h2>Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any
            changes by posting the new policy on this page and updating the &quot;Last updated&quot; date.
          </p>

          <h2>Contact Us</h2>
          <p>
            If you have questions about this Privacy Policy, please contact us at{' '}
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

export default Privacy;