export interface StickerTemplate {
  id: string;
  name: string;
  url: string;
}

export const STICKER_TEMPLATES: StickerTemplate[] = [
  { id: 'stk-heart', name: 'Heart', url: '/stickers/heart.svg' },
  { id: 'stk-star', name: 'Star', url: '/stickers/star.svg' },
  { id: 'stk-smile', name: 'Smile', url: '/stickers/smile.svg' },
  { id: 'stk-sparkle', name: 'Sparkle', url: '/stickers/sparkle.svg' },
];
