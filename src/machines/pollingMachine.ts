import { createMachine, assign } from 'xstate';

interface PollingContext {
  pollCount: number;
  maxPolls: number;
  intervalMs: number;
  lastFetchTime: number | null;
  error: string | null;
}

type PollingEvent =
  | { type: 'START_POLLING'; intervalMs: number; maxPolls: number }
  | { type: 'POLL' }
  | { type: 'FETCH_SUCCESS' }
  | { type: 'FETCH_ERROR'; error: string }
  | { type: 'STOP_POLLING' }
  | { type: 'MANUAL_REFRESH' }
  | { type: 'USER_INACTIVE' }
  | { type: 'USER_ACTIVE' };

export const pollingMachine = createMachine({
  id: 'polling',
  initial: 'idle',
  types: {} as {
    context: PollingContext;
    events: PollingEvent;
  },
  context: {
    pollCount: 0,
    maxPolls: 3, // Will be overridden by START_POLLING event
    intervalMs: 15 * 60 * 1000, // Will be overridden by START_POLLING event
    lastFetchTime: null,
    error: null,
  },
  states: {
    idle: {
      on: {
        START_POLLING: {
          target: 'initialFetch',
          actions: assign({
            maxPolls: ({ event }) => event.maxPolls,
            intervalMs: ({ event }) => event.intervalMs,
            pollCount: 0,
            error: null,
          }),
        },
      },
    },
    initialFetch: {
      on: {
        FETCH_SUCCESS: {
          target: 'polling',
          actions: assign({
            lastFetchTime: () => Date.now(),
            error: null,
          }),
        },
        FETCH_ERROR: {
          target: 'paused',
          actions: assign({
            error: ({ event }) => event.error,
          }),
        },
      },
    },
    polling: {
      on: {
        POLL: [
          {
            guard: ({ context }) => context.pollCount >= context.maxPolls,
            target: 'paused',
          },
          {
            actions: assign({
              pollCount: ({ context }) => context.pollCount + 1,
            }),
          },
        ],
        FETCH_SUCCESS: {
          actions: assign({
            lastFetchTime: () => Date.now(),
            error: null,
          }),
        },
        FETCH_ERROR: {
          target: 'paused',
          actions: assign({
            error: ({ event }) => event.error,
          }),
        },
        USER_INACTIVE: 'paused',
        STOP_POLLING: 'idle',
      },
    },
    paused: {
      on: {
        MANUAL_REFRESH: {
          target: 'polling',
          actions: assign({
            pollCount: 0,
            error: null,
            lastFetchTime: () => Date.now(),
          }),
        },
        USER_ACTIVE: 'polling',
        STOP_POLLING: 'idle',
      },
    },
  },
});

