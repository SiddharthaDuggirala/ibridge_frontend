import { TriangleAlert } from "lucide-react";
import { Component, type ErrorInfo, type ReactNode } from "react";

import { Button } from "@/components/ui/button";

interface ErrorBoundaryProps {
  children: ReactNode;
  // When this value changes (e.g. the page address), the boundary forgets the error and tries again.
  resetKey?: string;
}

interface ErrorBoundaryState {
  error: Error | null;
}

// Catches a crash anywhere inside it and shows a message instead of a blank screen.
// React only offers this as a class component (there is no hook for it).
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  // Step 1: React calls this when a child throws while rendering. The returned object becomes the new state.
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  // Step 2: a place to report the error. For now the browser console (F12); later a logging service.
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Page crashed:", error, info.componentStack);
  }

  // Navigating to another page clears the error, so one broken page does not block the others.
  componentDidUpdate(previous: ErrorBoundaryProps) {
    if (this.state.error && previous.resetKey !== this.props.resetKey) {
      this.setState({ error: null });
    }
  }

  render() {
    if (this.state.error) {
      return (
        <div
          role="alert"
          className="mx-auto mt-12 max-w-lg space-y-3 rounded-lg border border-border bg-card p-6 text-center"
        >
          <TriangleAlert className="mx-auto size-8 text-destructive" />
          <h2 className="text-lg font-semibold">Something went wrong on this page</h2>
          <p className="text-sm text-muted-foreground">
            The rest of TalentOps still works. Try again, or pick another page from the menu.
          </p>
          <p className="break-words rounded bg-muted px-3 py-2 font-mono text-xs text-muted-foreground">
            {this.state.error.message}
          </p>
          <Button onClick={() => this.setState({ error: null })}>Try again</Button>
        </div>
      );
    }
    return this.props.children;
  }
}