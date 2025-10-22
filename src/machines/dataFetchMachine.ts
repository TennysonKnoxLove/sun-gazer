import { createMachine, assign } from 'xstate';

interface DataFetchContext<T> {
  data: T | null;
  error: string | null;
  staleness: number | null;
}

type DataFetchEvent<T> =
  | { type: 'FETCH' }
  | { type: 'FETCH_SUCCESS'; data: T }
  | { type: 'FETCH_ERROR'; error: string }
  | { type: 'REFRESH' }
  | { type: 'RESET' };

export function createDataFetchMachine<T>() {
  return createMachine({
    id: 'dataFetch',
    initial: 'idle',
    types: {} as {
      context: DataFetchContext<T>;
      events: DataFetchEvent<T>;
    },
    context: {
      data: null,
      error: null,
      staleness: null,
    },
    states: {
      idle: {
        on: {
          FETCH: 'loading',
        },
      },
      loading: {
        on: {
          FETCH_SUCCESS: {
            target: 'success',
            actions: assign({
              data: ({ event }) => event.data,
              error: null,
              staleness: () => Date.now(),
            }),
          },
          FETCH_ERROR: {
            target: 'error',
            actions: assign({
              error: ({ event }) => event.error,
            }),
          },
        },
      },
      success: {
        on: {
          REFRESH: 'refreshing',
          RESET: 'idle',
        },
      },
      refreshing: {
        on: {
          FETCH_SUCCESS: {
            target: 'success',
            actions: assign({
              data: ({ event }) => event.data,
              error: null,
              staleness: () => Date.now(),
            }),
          },
          FETCH_ERROR: {
            target: 'success', // Keep old data on refresh error
            actions: assign({
              error: ({ event }) => event.error,
            }),
          },
        },
      },
      error: {
        on: {
          FETCH: 'loading',
          RESET: 'idle',
        },
      },
    },
  });
}

