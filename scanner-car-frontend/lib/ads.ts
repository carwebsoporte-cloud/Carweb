// Adsterra ad units. Keys are public (they ship in the client bundle anyway).

export const ADSTERRA_BANNER_HOST = 'https://www.highrevenueformat.com';

export const ADSTERRA_BANNERS = {
  leaderboard: { key: '21d17d39408e5e99b9cd70e6cacd6a3b', width: 728, height: 90 },
  rectangle: { key: '37513eba38e572696c5363eb56293d9e', width: 300, height: 250 },
  mobile: { key: '0b0ecbeef7dca413c65149c4978a128d', width: 320, height: 50 },
} as const;

export type AdsterraBannerFormat = keyof typeof ADSTERRA_BANNERS;

export const ADSTERRA_NATIVE = {
  src: 'https://pl31598095.profitableratecpmnetwork.com/ace3ac38db2b383918c1c551ef09ce46/invoke.js',
  containerId: 'container-ace3ac38db2b383918c1c551ef09ce46',
};

// Site-wide formats loaded once per page view.
export const ADSTERRA_POPUNDER_SRC =
  'https://pl31598093.profitableratecpmnetwork.com/7b/5d/e3/7b5de3516ee3f5c4ebf31de810bca1ad.js';
export const ADSTERRA_SOCIAL_BAR_SRC =
  'https://pl31598094.profitableratecpmnetwork.com/7b/2d/d3/7b2dd31988420276d5f7eaae59a80e2b.js';

// Ads only run in production builds and never on the admin panel.
export const ADS_ENABLED = process.env.NODE_ENV === 'production';

export function isAdFreePath(pathname: string | null): boolean {
  return !!pathname && pathname.startsWith('/admin');
}
