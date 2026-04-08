import { Component, type ErrorInfo, type ReactNode } from 'react';

interface GameErrorBoundaryProps {
  children: ReactNode;
}

interface GameErrorBoundaryState {
  hasError: boolean;
  message: string;
}

export class GameErrorBoundary extends Component<
  GameErrorBoundaryProps,
  GameErrorBoundaryState
> {
  state: GameErrorBoundaryState = {
    hasError: false,
    message: ''
  };

  static getDerivedStateFromError(error: unknown): GameErrorBoundaryState {
    const message = error instanceof Error ? error.message : 'Unknown render error';
    return {
      hasError: true,
      message
    };
  }

  componentDidCatch(error: unknown, info: ErrorInfo) {
    // Keep this log to aid browser-side debugging if a render crash happens.
    console.error('Game render crash:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-full w-full items-center justify-center bg-ink px-6 text-center">
          <div className="max-w-md rounded-xl border border-rose-300/40 bg-black/40 p-5 text-slate-100">
            <h2 className="text-xl font-bold text-rose-200">Renderfel i spelet</h2>
            <p className="mt-2 text-sm text-slate-300">
              Sidan blev tom p.g.a. ett runtime-fel. Ladda om sidan och prova igen.
            </p>
            <p className="mt-3 break-words font-mono text-xs text-rose-100/90">
              {this.state.message}
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
