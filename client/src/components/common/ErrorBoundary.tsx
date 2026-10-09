import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RefreshCw, Home, AlertTriangle } from 'lucide-react';
import { Button } from './Button';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-[#E8E0D6] shadow-luxury-lg text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-[#FDF2F2] border border-[#C74646]/20 text-[#C74646] flex items-center justify-center mx-auto shadow-sm">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="font-serif text-2xl font-bold text-[#24211F]">
                Something went wrong
              </h2>
              <p className="text-xs text-[#77716B] leading-relaxed">
                An unexpected error occurred while loading this section. Please reload or return to the main dashboard.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 bg-[#FAF7F2] rounded-xl text-left border border-[#E8E0D6] text-[11px] font-mono text-[#56504A] overflow-x-auto max-h-32">
                {this.state.error.toString()}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                variant="gold"
                size="md"
                onClick={this.handleReload}
                className="w-full flex-1"
                leftIcon={<RefreshCw className="w-4 h-4" />}
              >
                Reload Page
              </Button>
              <Button
                variant="secondary"
                size="md"
                onClick={this.handleGoHome}
                className="w-full flex-1"
                leftIcon={<Home className="w-4 h-4" />}
              >
                Go to Home
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
