import { useState, useCallback } from "react";

interface PaginationState {
  pageSize: number;
  cursorStack: string[];
  currentCursor: string | undefined;
}

export function usePagination(initialPageSize = 20) {
  const [state, setState] = useState<PaginationState>({
    pageSize: initialPageSize,
    cursorStack: [],
    currentCursor: undefined,
  });

  const goToNextPage = useCallback((nextCursor: string) => {
    setState((prev) => ({
      ...prev,
      cursorStack: [...prev.cursorStack, prev.currentCursor ?? ""],
      currentCursor: nextCursor,
    }));
  }, []);

  const goToPreviousPage = useCallback(() => {
    setState((prev) => {
      const stack = [...prev.cursorStack];
      const previousCursor = stack.pop();
      return {
        ...prev,
        cursorStack: stack,
        currentCursor: previousCursor || undefined,
      };
    });
  }, []);

  const setPageSize = useCallback((size: number) => {
    setState({
      pageSize: size,
      cursorStack: [],
      currentCursor: undefined,
    });
  }, []);

  const reset = useCallback(() => {
    setState((prev) => ({
      pageSize: prev.pageSize,
      cursorStack: [],
      currentCursor: undefined,
    }));
  }, []);

  return {
    pageSize: state.pageSize,
    cursor: state.currentCursor,
    page: state.cursorStack.length + 1,
    hasPreviousPage: state.cursorStack.length > 0,
    goToNextPage,
    goToPreviousPage,
    setPageSize,
    reset,
  };
}
