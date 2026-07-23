export interface GraphicTemplate {
  id: string;
  name: string;
  url: string;
  theme: 'light' | 'dark';
}

export const GRAPHIC_TEMPLATES: GraphicTemplate[] = [
  {
    id: '01-paper-base',
    name: 'Kertas Dasar',
    url: '/frames/01-paper-base.svg',
    theme: 'light'
  },
  {
    id: '02-ink-black',
    name: 'Tinta Hitam',
    url: '/frames/02-ink-black.svg',
    theme: 'dark'
  },
  {
    id: '03-kodak-yellow',
    name: 'Kuning Kodak',
    url: '/frames/03-kodak-yellow.svg',
    theme: 'light'
  },
  {
    id: '04-blood-red',
    name: 'Merah Darah',
    url: '/frames/04-blood-red.svg',
    theme: 'dark'
  },
  {
    id: '05-grid-note',
    name: 'Kertas Kotak',
    url: '/frames/05-grid-note.svg',
    theme: 'light'
  }
];
