import { useEffect, useRef } from 'react';
import { useMachine } from '@xstate/react';
import { pollingMachine } from '../machines/pollingMachine';
import { useSettings } from '../contexts/SettingsContext';

interface UsePollingOptions {
  onPoll: () => Promise<void>;
  intervalMs?: number;
  maxPolls?: number;
  inactivityTimeoutMs?: number;
  enabled?: boolean;
}

export const usePolling = ({
  onPoll,
  intervalMs,
  maxPolls,
  inactivityTimeoutMs,
  enabled = true,
}: UsePollingOptions) => {
  const { pollingConfig } = useSettings();
  
  // Use provided values or fall back to settings from backend
  const effectiveIntervalMs = intervalMs ?? (pollingConfig?.poll_interval_minutes ?? 15) * 60 * 1000;
  const effectiveMaxPolls = maxPolls ?? pollingConfig?.max_repolls ?? 3;
  const effectiveInactivityTimeout = inactivityTimeoutMs ?? (pollingConfig?.inactivity_timeout_minutes ?? 5) * 60 * 1000;
  const [state, send] = useMachine(pollingMachine);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Start polling when enabled
  useEffect(() => {
    if (enabled && pollingConfig) {
      send({ type: 'START_POLLING', intervalMs: effectiveIntervalMs, maxPolls: effectiveMaxPolls });
      
      // Initial fetch
      handlePoll();

      // Set up polling interval
      pollIntervalRef.current = setInterval(() => {
        if (state.matches('polling')) {
          send({ type: 'POLL' });
          handlePoll();
        }
      }, effectiveIntervalMs);

      // Set up user activity detection
      const resetInactivityTimer = () => {
        if (inactivityTimerRef.current) {
          clearTimeout(inactivityTimerRef.current);
        }
        
        if (state.matches('paused')) {
          send({ type: 'USER_ACTIVE' });
        }

        inactivityTimerRef.current = setTimeout(() => {
          send({ type: 'USER_INACTIVE' });
        }, effectiveInactivityTimeout);
      };

      window.addEventListener('mousemove', resetInactivityTimer);
      window.addEventListener('keydown', resetInactivityTimer);
      resetInactivityTimer();

      return () => {
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
        }
        if (inactivityTimerRef.current) {
          clearTimeout(inactivityTimerRef.current);
        }
        window.removeEventListener('mousemove', resetInactivityTimer);
        window.removeEventListener('keydown', resetInactivityTimer);
        send({ type: 'STOP_POLLING' });
      };
    }
  }, [enabled, effectiveIntervalMs, effectiveMaxPolls, effectiveInactivityTimeout, pollingConfig]);

  const handlePoll = async () => {
    try {
      await onPoll();
      send({ type: 'FETCH_SUCCESS' });
    } catch (error) {
      send({ type: 'FETCH_ERROR', error: String(error) });
    }
  };

  const manualRefresh = async () => {
    await handlePoll();
    send({ type: 'MANUAL_REFRESH' });
  };

  return {
    state,
    isPolling: state.matches('polling'),
    isPaused: state.matches('paused'),
    error: state.context.error,
    manualRefresh,
  };
};

