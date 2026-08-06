const isDemoMode = () => false;

type AnalyticsEvent =
  | { type: 'page_view'; page: string }
  | { type: 'recommendation_viewed'; id: string }
  | { type: 'pdf_export'; reportType: string }
  | { type: 'settings_changed'; setting: string }
  | { type: 'area_saved'; areaId: string }
  | { type: 'first_action_completed'; actionType: string }
  | { type: 'onboarding_navigate'; step: string; page?: string };

interface QueuedEvent {
  event: AnalyticsEvent;
  timestamp: string;
  sessionId: string;
}

function getSessionId() {
  const key = 'bs_session_id';
  let id = sessionStorage.getItem(key);
  if (!id) {
    id = Math.random().toString(36).slice(2);
    sessionStorage.setItem(key, id);
  }
  return id;
}

function getQueue(): QueuedEvent[] {
  try {
    return JSON.parse(sessionStorage.getItem('bs_analytics_queue') || '[]');
  } catch {
    return [];
  }
}

function saveQueue(q: QueuedEvent[]) {
  sessionStorage.setItem('bs_analytics_queue', JSON.stringify(q));
}

function recordSessionPage() {
  const pages = JSON.parse(sessionStorage.getItem('bs_session_pages') || '0');
  sessionStorage.setItem('bs_session_pages', String(Number(pages) + 1));
}

function recordSessionAction(action: string) {
  const actions = JSON.parse(sessionStorage.getItem('bs_session_actions') || '[]');
  actions.push(action);
  sessionStorage.setItem('bs_session_actions', JSON.stringify(actions));
}

async function flushEvents() {
  const queue = getQueue();
  if (queue.length === 0) return;
  try {
    const res = await fetch('/api/analytics/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(queue),
    });
    if (res.ok) saveQueue([]);
  } catch {
    // Silently fail — events remain in queue
  }
}

export function track(eventOrType: AnalyticsEvent | string, meta?: Record<string, any>) {
  let event: AnalyticsEvent;
  if (typeof eventOrType === 'string') {
    event = { type: eventOrType as any, ...(meta || {}) } as AnalyticsEvent;
  } else {
    event = eventOrType;
  }

  if (event.type === 'page_view') recordSessionPage();
  if (event.type === 'recommendation_viewed') recordSessionAction('rec_viewed');
  if (event.type === 'pdf_export') recordSessionAction('report_gen');
  if (event.type === 'settings_changed' && 'setting' in event && (event as any).setting?.includes('alert')) recordSessionAction('alert_cfg');
  if (event.type === 'area_saved') recordSessionAction('area_saved');

  const queued: QueuedEvent = {
    event,
    timestamp: new Date().toISOString(),
    sessionId: getSessionId(),
  };

  if (isDemoMode()) {
    console.info('[Analytics]', queued);
    return;
  }

  const queue = getQueue();
  queue.push(queued);
  saveQueue(queue);

  flushEvents().catch(() => {
    // Silently fail
  });
}
