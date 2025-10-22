TL;DR config (tweakable in Settings)

DASHBOARD_TTL = 45m (first fetch if stale)

SITE_TTL = 15m (fetch when entering Site Detail if stale)

POLL_INTERVAL = 15m (while view is open/active)

MAX_REPOLLS = 3 (per view per activation)

INACTIVITY_TIMEOUT = 5m (no pointer/keyboard → assume away)

STOP_NOTICE_DELAY = 1m (after last poll, show “stopped polling” toast)

Polling scope = current view only (Dashboard vs specific Site)

How it works (behavioral rules)

On app open → Dashboard

Check DB staleness for each card. If any older than DASHBOARD_TTL, fetch dashboard data once.

Start Dashboard polling every POLL_INTERVAL, up to MAX_REPOLLS while Dashboard is visible & user active.

If user goes inactive or MAX_REPOLLS reached → stop polling, schedule a toast: “Auto-refresh paused. Click to refresh.”

On Site Detail open

Check DB staleness for that site (SITE_TTL). If stale → fetch once immediately.

Start Site polling every POLL_INTERVAL, up to MAX_REPOLLS, only for that site.

If user inactive or MAX_REPOLLS reached → stop, show same toast on that view.

Leaving Site Detail stops its polling. Returning later restarts with a fresh counter.

Manual refresh

Clicking “Refresh” on any view triggers an immediate fetch for that view’s scope and resets that view’s polling counter (others remain paused).

Back to Dashboard after a while

If cached dashboard data older than DASHBOARD_TTL, fetch once, then restart Dashboard polling with a fresh counter.

Rate limits / errors

Respect per-vendor cooldowns; if hit, defer the next attempt and annotate the toast (“vendor cooldown until 14:05”).

Persistence

Log each fetch in fetch_log (vendor, site_id, resource, last_success_at, last_status). Use it for TTL checks and Diagnostics.

Mermaid — Polling Lifecycle (state machine, per view)
stateDiagram-v2
  [*] --> Idle

  Idle --> InitialFetch : View shown OR TTL expired
  Idle --> PollingActive : View shown AND TTL fresh

  InitialFetch --> PollingActive : success
  InitialFetch --> Paused : error/ratelimit (defer + toast)

  PollingActive --> PollingActive : interval tick (<= MAX_REPOLLS AND user active)
  PollingActive --> Paused : MAX_REPOLLS reached
  PollingActive --> Paused : user inactive (timeout)
  PollingActive --> Paused : view hidden (navigated away)

  Paused --> ManualRefresh : user clicks Refresh
  ManualRefresh --> PollingActive : refresh success (counter reset)
  ManualRefresh --> Paused : error/ratelimit

  Paused --> Idle : view hidden OR app backgrounded

Mermaid — Dashboard flow (first open → pause → manual refresh)
flowchart TD
  A[Open App → Dashboard] --> B{Any site data stale (TTL 45m)?}
  B -- Yes --> C[Fetch dashboard aggregates]
  B -- No --> D[Use cached data]
  C --> E[Start dashboard polling every 15m]
  D --> E
  E --> F{Poll count < MAX_REPOLLS AND user active?}
  F -- Yes --> E
  F -- No --> G[Stop polling + Toast: 'Auto-refresh paused']
  G --> H{User clicks Refresh?}
  H -- Yes --> I[Fetch now + reset dashboard polling counter → E]
  H -- No --> J[Stay paused, show cached until next entry]

Mermaid — Site Detail flow (per-site scope)
flowchart TD
  A[Open Site Detail] --> B{Site data stale (TTL 15m)?}
  B -- Yes --> C[Fetch site overview/energy/alerts]
  B -- No --> D[Use cached data]
  C --> E[Start site polling every 15m]
  D --> E
  E --> F{Poll count < MAX_REPOLLS AND user active?}
  F -- Yes --> E
  F -- No --> G[Stop polling + Toast: 'Auto-refresh paused for this site']
  G --> H{User clicks Refresh?}
  H -- Yes --> I[Fetch now + reset site polling counter → E]
  H -- No --> J[Stay paused, cached only]
  J --> K[Leave Site Detail → stop site polling]

Minimal backend design
Tables

fetch_log

vendor TEXT, site_id TEXT NULL, resource TEXT

last_success_at TIMESTAMP, last_attempt_at TIMESTAMP

last_status TEXT, cooldown_until TIMESTAMP NULL

PK: (vendor,site_id,resource)

settings_local (key/value for TTLs, intervals, etc.)

Your canonical data tables (Sites, Devices, Timeseries, Alerts)

API

GET /dashboard → cached aggregates (+ X-Staleness header)

POST /dashboard/refresh

GET /sites/{id}/overview|energy|alerts|layout (+ X-Staleness)

POST /sites/{id}/refresh?resource=overview|energy|alerts

GET /diagnostics/vendor_status (last_success, cooldown, quota)

Scheduler choice

You can still use APScheduler for a simple timer per active view (started/stopped by UI events), or use a per-view async loop kicked off by the UI:

UI sends POST /views/{scope}/start_polling with {interval, max}.

UI sends POST /views/{scope}/stop_polling on hide/inactive.

Or: keep it client-driven (Electron JS setInterval) and just call the backend endpoints—cleaner and avoids server timers per view.

Frontend logic (pseudo)
// view-scope state
let pollingCount = 0;
let timer: number | null = null;

function startPolling({ intervalMs, max }) {
  stopPolling();
  pollingCount = 0;
  timer = window.setInterval(async () => {
    if (!isViewVisible() || !isUserActive() || pollingCount >= max) {
      stopPolling();
      showToast("Auto-refresh paused. Click to refresh.");
      return;
    }
    const ok = await refreshNow(); // calls dashboard or site refresh
    pollingCount += ok ? 1 : 0;
  }, intervalMs);
}

function stopPolling() {
  if (timer) { clearInterval(timer); timer = null; }
}

onViewEnter(async () => {
  const stale = await checkStale(); // ask backend or compute from headers
  if (stale) await refreshNow();
  startPolling({ intervalMs: 15*60*1000, max: 3 });
});

onViewLeave(() => stopPolling());

onManualRefresh(async () => {
  await refreshNow();
  startPolling({ intervalMs: 15*60*1000, max: 3 }); // reset counter
});

Edge cases & niceties

Background tab / minimized window: pause polling; resume on focus.

Network offline: stop polling, badge “offline”; auto-retry once online.

Vendor cooldown: backend returns Retry-After; display next ETA in toast.

Granular resources: for Site Detail, you can refresh overview every 15m, energy every 30m, inventory daily—all under the same per-view MAX_REPOLLS counter or their own sub-counters.