export const MEDIA_UPLOAD_SPECS = Object.freeze({
  'game-card': Object.freeze({
    assetKey: 'game',
    label: 'Game artwork',
    width: 720,
    height: 720,
    ratio: '1:1',
    formats: 'WEBP / JPG / PNG',
    maxSize: '2 MB',
    note: 'Keep the main subject inside the center 80% safe area.',
  }),
  'promotion-card': Object.freeze({
    assetKey: 'promo',
    label: 'Promotion artwork',
    width: 1600,
    height: 900,
    ratio: '16:9',
    formats: 'WEBP / JPG / PNG',
    maxSize: '3 MB',
    note: 'Reserve clear space for the campaign title and call to action.',
  }),
  banner: Object.freeze({
    assetKey: 'hero',
    label: 'Hero banner',
    actionLabel: 'Add banner',
    width: 2400,
    height: 720,
    ratio: '10:3',
    formats: 'WEBP / JPG / PNG',
    maxSize: '4 MB',
    note: 'Keep key subjects away from both edges and mobile crop zones.',
  }),
  profile: Object.freeze({
    assetKey: 'avatar',
    label: 'Profile avatar',
    width: 512,
    height: 512,
    ratio: '1:1',
    formats: 'WEBP / JPG / PNG',
    maxSize: '1 MB',
    note: 'Use a centered portrait with comfortable space around the face.',
  }),
  navigation: Object.freeze({
    assetKey: 'logo',
    label: 'Brand logo',
    width: 640,
    height: 160,
    ratio: '4:1',
    formats: 'Transparent WEBP / PNG',
    maxSize: '1 MB',
    note: 'Use transparent artwork with no built-in background or shadow.',
  }),
});

export function formatRecommendedSize(spec) {
  return `${spec.width} × ${spec.height} px`;
}
