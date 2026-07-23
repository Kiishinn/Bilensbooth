export enum AppStep {
  INITIALIZE = 'INITIALIZE',
  CAPTURE = 'CAPTURE',
  CONTACT_SHEET = 'CONTACT_SHEET',
  DARKROOM = 'DARKROOM',
  EXPORT = 'EXPORT',
}

// Layout now dictates how many photos are printed
export type LayoutType = 'strip-3' | 'strip-4' | 'grid-4' | 'polaroid-1';

export type FilterType = 'raw' | 'bw' | 'sepia' | 'cross' | 'lomo' | 'expired';

// Frame templates are now dynamic (string ID)
// Refer to GRAPHIC_TEMPLATES in src/utils/frameRegistry.ts
export type TimerDelay = number; // 3 to 10 seconds

/* ─── Stickers ─── */
export interface StickerData {
  id: string; // unique instance ID (e.g. timestamp)
  url: string; // source url of the sticker
  x: number; // percentage (0 to 1) relative to canvas width
  y: number; // percentage (0 to 1) relative to canvas height
  scale: number; // scale multiplier, default 1
  rotation: number; // rotation in degrees, default 0
}

/* ─── Reducer State & Actions ─── */

export interface AppState {
  step: AppStep;
  layout: LayoutType | null;
  photos: string[];
  selectedIndices: number[];
  filter: FilterType;
  frameId: string;
  customText: string;
  timerDelay: TimerDelay;
  totalShots: number;
  isMirrored: boolean;
  deviceId: string;
  stickers: StickerData[];
}

export type AppAction =
  | { type: 'SET_STEP'; payload: AppStep }
  | { type: 'SELECT_LAYOUT'; payload: LayoutType }
  | { type: 'CAPTURE_COMPLETE'; payload: string[] }
  | { type: 'SET_SELECTED_INDICES'; payload: number[] }
  | { type: 'SET_FILTER'; payload: FilterType }
  | { type: 'SET_FRAME_ID'; payload: string }
  | { type: 'SET_CUSTOM_TEXT'; payload: string }
  | { type: 'SET_TIMER_DELAY'; payload: TimerDelay }
  | { type: 'SET_TOTAL_SHOTS'; payload: number }
  | { type: 'SET_MIRRORED'; payload: boolean }
  | { type: 'SET_DEVICE_ID'; payload: string }
  | { type: 'SET_STICKERS'; payload: StickerData[] }
  | { type: 'RETAKE' }
  | { type: 'RESET' };

export const INITIAL_STATE: AppState = {
  step: AppStep.INITIALIZE,
  layout: 'strip-4',
  photos: [],
  selectedIndices: [],
  filter: 'raw',
  frameId: '01-paper-base',
  customText: '',
  timerDelay: 3, // Default 3 detik
  totalShots: 5, // Default 5 foto
  isMirrored: true, // Default mirror nyala (kamera depan)
  deviceId: '', // Default auto
  stickers: [],
};

/* ─── Lookup Maps (Diterjemahkan ke Bahasa Indonesia) ─── */

export const FILTER_LABELS: Record<FilterType, string> = {
  raw: 'ASLI (RAW)',
  bw: 'HITAM PUTIH',
  sepia: 'BUTIRAN SEPIA',
  cross: 'PROSES SILANG',
  lomo: 'LOMO',
  expired: 'FILM KEDALUWARSA',
};

export const STEP_LABELS: Record<AppStep, string> = {
  [AppStep.INITIALIZE]: 'PERSIAPAN',
  [AppStep.CAPTURE]: 'SESI FOTO',
  [AppStep.CONTACT_SHEET]: 'SELEKSI FOTO',
  [AppStep.DARKROOM]: 'LAB FOTO',
  [AppStep.EXPORT]: 'SIMPAN & BAGIKAN',
};

/* ─── Session Archive ─── */

export interface SessionRecord {
  id: string;
  timestamp: string;
  thumbnailDataUrl: string;
  layout: LayoutType;
  filter: FilterType;
  frameId: string; // Menggunakan graphicTemplateId, default: '01-classic'
  customText: string;
  stickers: StickerData[];
}
