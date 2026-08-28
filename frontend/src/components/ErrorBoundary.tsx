import { Component, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 max-w-md w-full text-center">
            <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-slate-900 mb-2">Something went wrong</h1>
            <p className="text-sm text-slate-500 mb-6">
              An unexpected error occurred. Please try reloading the page.
            </p>
            {this.state.error && (
              <pre className="text-xs text-red-500 bg-red-50 rounded-lg p-3 mb-6 overflow-auto text-left">
                {this.state.error.message}
              </pre>
            )}
            <button
              onClick={this.handleReload}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
