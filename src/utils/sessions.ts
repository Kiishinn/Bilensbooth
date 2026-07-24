/**
 * Session archive management — localStorage persistence (#15).
 */

import type { SessionRecord } from '../types/index';
import { deleteHighResPhoto, clearHighResPhotos } from './db';

const STORAGE_KEY = 'bilens-booth-sessions';
const MAX_SESSIONS = 20;
const EXPIRY_DAYS = 30;

export function getSessions(): SessionRecord[] {
  try {
    const sessions = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') as SessionRecord[];
    return sessions;
  } catch {
    return [];
  }
}

// Fire and forget cleanup
export async function cleanupExpiredSessions(): Promise<void> {
  const sessions = getSessions();
  const now = new Date().getTime();
  const validSessions: SessionRecord[] = [];
  const msIn30Days = EXPIRY_DAYS * 24 * 60 * 60 * 1000;

  let changed = false;

  for (const session of sessions) {
    const sessionTime = new Date(session.timestamp).getTime();
    if (now - sessionTime > msIn30Days) {
      // Expired!
      await deleteHighResPhoto(session.id).catch(() => {});
      changed = true;
    } else {
      validSessions.push(session);
    }
  }

  if (changed) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(validSessions.slice(0, MAX_SESSIONS)));
  }
}

export function saveSession(record: SessionRecord): void {
  const sessions = getSessions();
  sessions.unshift(record);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions.slice(0, MAX_SESSIONS)));
}

export function clearSessions(): void {
  localStorage.removeItem(STORAGE_KEY);
  clearHighResPhotos().catch(console.error);
}

export function deleteSession(id: string): void {
  const sessions = getSessions().filter((s) => s.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  deleteHighResPhoto(id).catch(console.error);
}

export function createThumbnail(
  canvas: HTMLCanvasElement,
  maxWidth: number = 300
): string {
  const scale = maxWidth / canvas.width;
  const thumbCanvas = document.createElement('canvas');
  thumbCanvas.width = maxWidth;
  thumbCanvas.height = Math.round(canvas.height * scale);
  const ctx = thumbCanvas.getContext('2d')!;
  ctx.drawImage(canvas, 0, 0, thumbCanvas.width, thumbCanvas.height);
  return thumbCanvas.toDataURL('image/jpeg', 0.6);
}
