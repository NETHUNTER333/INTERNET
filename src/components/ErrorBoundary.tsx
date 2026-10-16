import { Component, ReactNode, ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in React component tree:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F4F4F0] dark:bg-[#0A0D14] text-slate-900 dark:text-slate-100 flex items-center justify-center p-6 font-sans">
          <div className="brutal-card p-6 max-w-md w-full flex flex-col gap-4 bg-white dark:bg-slate-900 border-3 border-slate-900 dark:border-slate-100 shadow-[4px_4px_0px_0px_#000]">
            <div className="flex items-center gap-2">
              <span className="font-sketch text-2xl uppercase font-black text-amber-500">ZENO WORKSPACE</span>
            </div>
            <p className="text-sm font-bold font-mono">
              Something went wrong loading the view.
            </p>
            <div className="p-3 bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-200 border-2 border-rose-900 rounded-xl text-xs font-mono break-all">
              {this.state.error?.message || 'Unknown render error'}
            </div>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="prisma-btn-primary !bg-amber-300 !text-slate-900 uppercase font-black text-xs"
            >
              RELOAD WORKSPACE
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
