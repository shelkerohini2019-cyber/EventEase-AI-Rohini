import { EventData } from '../types/event';
import { SAMPLE_EVENTS } from '../data/sampleEvents';

const STORAGE_KEY = 'eventease_events_v1';
const ACTIVE_EVENT_KEY = 'eventease_active_id_v1';

export function loadEventsFromStorage(): EventData[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Initialize with sample events
      saveEventsToStorage(SAMPLE_EVENTS);
      return SAMPLE_EVENTS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return SAMPLE_EVENTS;
  } catch (e) {
    console.error('Failed to load events from storage, returning samples', e);
    return SAMPLE_EVENTS;
  }
}

export function saveEventsToStorage(events: EventData[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  } catch (e) {
    console.error('Failed to save events to storage', e);
  }
}

export function getActiveEventId(): string {
  try {
    const id = localStorage.getItem(ACTIVE_EVENT_KEY);
    if (id) return id;
  } catch (e) {
    // fallback
  }
  return SAMPLE_EVENTS[0].id;
}

export function setActiveEventId(id: string): void {
  try {
    localStorage.setItem(ACTIVE_EVENT_KEY, id);
  } catch (e) {
    console.error('Failed to save active event id', e);
  }
}
