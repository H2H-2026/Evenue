import { Component, type ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

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

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    if (import.meta.env.DEV) {
      console.error("ErrorBoundary caught:", error, info.componentStack);
    }
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-background p-6 text-foreground">
          <div className="mx-auto max-w-md text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/15">
              <AlertTriangle className="h-8 w-8 text-red-400" />
            </div>
            <h1 className="mb-2 text-2xl font-bold">حدث خطأ غير متوقع</h1>
            <p className="mb-6 text-sm text-muted-foreground">
              نعتذر، حدث خطأ أثناء عرض الصفحة. حاول إعادة التحميل.
            </p>
            {import.meta.env.DEV && this.state.error && (
              <pre className="mb-6 overflow-auto rounded-lg border border-red-500/20 bg-red-500/5 p-4 text-start text-xs text-red-300">
                {this.state.error.message}
              </pre>
            )}
            <button
              type="button"
              onClick={this.handleReload}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <RefreshCw className="h-4 w-4" />
              إعادة التحميل
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
