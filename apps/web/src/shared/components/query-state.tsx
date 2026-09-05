import { RotateCw, TriangleAlert } from "lucide-react";

import { Button } from "./ui/button";
import { Alert, AlertAction, AlertDescription, AlertTitle } from "./ui/alert";
import { Loader } from "./loader";

/**
 * Renders the loading/error/empty ladder shared by query-driven lists.
 * Errors render inline as an Alert so the rest of the page stays up;
 * callers supply only what varies: the error copy, the empty node, and the data.
 */
export function QueryState({
  isEmpty,
  isError,
  isLoading,
  empty,
  errorTitle,
  onRetry,
  loading = <Loader />,
  children,
}: {
  isEmpty: boolean;
  isError: boolean;
  isLoading: boolean;
  empty: React.ReactNode;
  errorTitle: string;
  onRetry?: () => void;
  loading?: React.ReactNode;
  children: React.ReactNode;
}) {
  if (isError)
    return (
      <Alert variant="destructive">
        <TriangleAlert />
        <AlertTitle>{errorTitle}</AlertTitle>
        <AlertDescription>Try again in a moment.</AlertDescription>
        {onRetry ? (
          <AlertAction>
            <Button variant="outline" size="sm" onClick={onRetry}>
              <RotateCw />
              Retry
            </Button>
          </AlertAction>
        ) : null}
      </Alert>
    );
  if (isLoading) return <>{loading}</>;
  if (isEmpty) return <>{empty}</>;
  return <>{children}</>;
}
