/**
 * Session archive management — localStorage persistence (#15).
 */

import type { SessionRecord } from '../types/index';

const STORAGE_KEY = 'bilens-booth-sessions';
const MAX_SESSIONS = 20;

export function getSessions(): SessionRecord[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

export function saveSession(record: SessionRecord): void {
  const sessions = getSessions();
  sessions.unshift(record);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions.slice(0, MAX_SESSIONS)));
}

export function clearSessions(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function deleteSession(id: string): void {
  const sessions = getSessions().filter((s) => s.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
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
