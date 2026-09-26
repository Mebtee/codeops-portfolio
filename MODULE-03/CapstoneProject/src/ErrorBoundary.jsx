import { Component } from 'react';

class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('Application error:', error, info);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <main className="error-page">
          <h1>Something went wrong</h1>
          <p>We could not load this part of Mesob House.</p>
          <button className="btn-red" onClick={this.handleReload}>Try again</button>
        </main>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
