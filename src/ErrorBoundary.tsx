import React from 'react';

type State = { hasError: boolean; error?: Error | null };

export default class ErrorBoundary extends React.Component<{}, State> {
  constructor(props: {}) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: any) {
    // keep this minimal but log to console for debugging
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 20 }}>
          <h2>Application error</h2>
          <pre style={{ whiteSpace: 'pre-wrap', color: '#b00' }}>{String(this.state.error)}</pre>
          <p>Open the browser console for full details.</p>
        </div>
      );
    }
    return this.props.children as any;
  }
}
