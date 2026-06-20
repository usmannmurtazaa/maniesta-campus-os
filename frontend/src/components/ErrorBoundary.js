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
        <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
          <motion.div
            className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-neutral-200"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            role="alert"
          >
            <div className="w-14 h-14 rounded-full bg-warning-50 flex items-center justify-center mx-auto mb-5">
              <FaExclamationTriangle className="text-warning-600 text-2xl" />
            </div>
            <h1 className="text-xl font-semibold text-neutral-900 mb-2">
              Something went wrong
            </h1>
            <p className="text-sm text-neutral-600 mb-6">
              An unexpected error occurred. You can try again or reload the page.
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={this.handleReset}
                className="btn-primary"
                aria-label="Try again after error"
              >
                Try Again
              </button>
              <button
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