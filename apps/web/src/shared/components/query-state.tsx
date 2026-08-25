import { ContentState } from "./content-state";
import { Loader } from "./loader";

/**
 * Renders the loading/error/empty ladder shared by query-driven lists.
 * Callers supply only what varies: the error copy, the empty node, and the data.
 */
export function QueryState({
  isEmpty,
  isError,
  isLoading,
  empty,
  errorTitle,
  loading = <Loader />,
  children,
}: {
  isEmpty: boolean;
  isError: boolean;
  isLoading: boolean;
  empty: React.ReactNode;
  errorTitle: string;
  loading?: React.ReactNode;
  children: React.ReactNode;
}) {
  if (isError)
    return <ContentState error title={errorTitle} description="Try again in a moment." />;
  if (isLoading) return <>{loading}</>;
  if (isEmpty) return <>{empty}</>;
  return <>{children}</>;
}
