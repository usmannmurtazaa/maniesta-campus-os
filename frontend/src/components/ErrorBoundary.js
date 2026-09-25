import React from 'react';
import { motion } from 'framer-motion';
import { FaExclamationTriangle } from 'react-icons/fa';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-surface-subtle px-4">
          <motion.div
            className="max-w-md w-full bg-surface rounded-2xl shadow-2xl ring-1 ring-border p-8 text-center"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            role="alert"
          >
            <div className="w-14 h-14 rounded-full bg-warning-50 flex items-center justify-center mx-auto mb-5">
              <FaExclamationTriangle className="text-warning-600 text-2xl" aria-hidden="true" />
            </div>
            <h1 className="text-xl font-semibold text-content-primary mb-2">
              Something went wrong
            </h1>
            <p className="text-sm text-content-secondary mb-6">
              An unexpected error occurred. You can try again or reload the page.
            </p>
            <div className="flex justify-center gap-3">
              <button
                type="button"
                onClick={this.handleReset}
                className="btn-primary"
                aria-label="Try again after error"
              >
                Try Again
              </button>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="btn-secondary"
                aria-label="Reload the entire page"
              >
                Reload Page
              </button>
            </div>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
