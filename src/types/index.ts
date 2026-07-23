export enum AppStep {
  INITIALIZE = 'INITIALIZE',
  CAPTURE = 'CAPTURE',
  CONTACT_SHEET = 'CONTACT_SHEET',
  DARKROOM = 'DARKROOM',
  EXPORT = 'EXPORT',
}

export type LayoutType = 'strip' | 'grid';

export type FilterType = 'raw' | 'bw' | 'sepia' | 'cross' | 'lomo' | 'expired';

export type FrameColor = 'paper-base' | 'ink-black' | 'blood-red' | 'kodak-yellow';

export type TimerDelay = 0 | 5 | 10;

/* ─── Reducer State & Actions ─── */

export interface AppState {
  step: AppStep;
  layout: LayoutType | null;
  photos: string[];
  selectedIndices: number[];
  filter: FilterType;
  frameColor: FrameColor;
  customText: string;
  timerDelay: TimerDelay;
}

export type AppAction =
  | { type: 'SET_STEP'; payload: AppStep }
  | { type: 'SELECT_LAYOUT'; payload: LayoutType }
  | { type: 'CAPTURE_COMPLETE'; payload: string[] }
  | { type: 'SET_SELECTED_INDICES'; payload: number[] }
  | { type: 'SET_FILTER'; payload: FilterType }
  | { type: 'SET_FRAME_COLOR'; payload: FrameColor }
  | { type: 'SET_CUSTOM_TEXT'; payload: string }
  | { type: 'SET_TIMER_DELAY'; payload: TimerDelay }
  | { type: 'RETAKE' }
  | { type: 'RESET' };

export const INITIAL_STATE: AppState = {
  step: AppStep.INITIALIZE,
  layout: null,
  photos: [],
  selectedIndices: [],
  filter: 'raw',
  frameColor: 'paper-base',
  customText: '',
  timerDelay: 0,
};

/* ─── Lookup Maps (Diterjemahkan ke Bahasa Indonesia) ─── */

export const FRAME_COLOR_HEX: Record<FrameColor, string> = {
  'paper-base': '#fbf9f8',
  'ink-black': '#1b1c1c',
  'blood-red': '#bb181e',
  'kodak-yellow': '#FFDD00',
};

export const FRAME_COLOR_LABELS: Record<FrameColor, string> = {
  'paper-base': 'KERTAS DASAR',
  'ink-black': 'TINTA HITAM',
  'blood-red': 'MERAH DARAH',
  'kodak-yellow': 'KUNING KODAK',
};

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
  frameColor: FrameColor;
  customText: string;
}
