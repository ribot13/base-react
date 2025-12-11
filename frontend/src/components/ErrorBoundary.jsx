// frontend/src/components/ErrorBoundary.jsx
import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  // eslint-disable-next-line no-unused-vars
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    console.error("Uncaught Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '50px', color: 'red', fontFamily: 'monospace' }}>
          <h1>⚠️ Terjadi Error Kritis</h1>
          <h3>{this.state.error && this.state.error.toString()}</h3>
          <pre style={{ background: '#eee', padding: '20px', overflow: 'auto' }}>
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </pre>
          <button onClick={() => { localStorage.clear(); window.location.href = '/login'; }} style={{marginTop: 20, padding: '10px 20px'}}>
             Clear Cache & Logout
          </button>
        </div>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;