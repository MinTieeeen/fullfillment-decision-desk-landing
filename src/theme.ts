import { theme, type ThemeConfig } from 'antd';

/**
 * Design tokens: near-black surfaces, crimson accent, white text and neutral greys.
 * Key names describe roles, so components keep working when the palette changes.
 */
export const palette = {
  deep: '#0e0e11', // darkest surface
  dark: '#8f1d2c', // deep crimson: identity of source A, gradients
  primary: '#e5485f', // crimson: buttons, highlights, selected states
  primaryHover: '#f05d72',
  light: '#ff8597',
  tint: '#5a2530', // crimson-tinted border
  soft: '#2a1519', // crimson-tinted surface
  wash: '#1d1d22', // raised surface
  accent: '#ff8a9b', // light coral: stars, badges, source C
  accentSoft: '#331a1f',
  white: '#ffffff',
  bg: '#121215',
  line: 'rgba(255, 255, 255, 0.08)',
  grey: '#8b8b96',
  greyLight: '#5c5c66',
  ink: '#f3f3f5', // primary text
  ink2: '#b9b9c3', // secondary text
  success: '#3ccf8e',
  warn: '#f5a524',
  bad: '#ff4d6a',
};

/** Identity colours for the three sources (always shown with a text label). */
export const sourceColor: Record<string, string> = { A: palette.dark, B: palette.greyLight, C: palette.accent };
/** Sources whose colour is light enough to need dark text on top. */
export const lightSource = new Set(['C']);

export const antTheme: ThemeConfig = {
  algorithm: theme.darkAlgorithm,
  token: {
    colorPrimary: palette.primary,
    colorSuccess: palette.success,
    colorInfo: palette.primary,
    colorInfoBg: palette.soft,
    colorInfoBorder: palette.tint,
    colorWarning: palette.warn,
    colorError: palette.bad,
    colorLink: palette.light,
    colorText: palette.ink,
    colorTextSecondary: palette.ink2,
    colorBgBase: palette.bg,
    colorBgLayout: palette.bg,
    colorBgContainer: '#18181c',
    colorBgElevated: '#202026',
    colorBorder: 'rgba(255, 255, 255, 0.14)',
    colorBorderSecondary: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 10,
    borderRadiusLG: 18,
    fontFamily: "Inter, system-ui, -apple-system, 'Segoe UI', sans-serif",
    fontSize: 14,
  },
  components: {
    Layout: { headerBg: 'transparent', headerHeight: 68, headerPadding: '0 24px', bodyBg: palette.bg },
    Menu: {
      itemBg: 'transparent',
      itemColor: palette.ink2,
      itemHoverColor: palette.ink,
      itemSelectedColor: palette.ink,
      horizontalItemSelectedColor: palette.ink,
      horizontalItemHoverColor: palette.ink,
    },
    Card: { headerFontSize: 16 },
    Table: { headerBg: '#1f1f25', headerColor: palette.ink2, rowSelectedBg: palette.soft, rowHoverBg: '#1f1f25' },
    Segmented: { itemSelectedBg: palette.primary, itemSelectedColor: palette.white, trackBg: '#1f1f25' },
    Tag: { defaultBg: '#1f1f25' },
    Button: { primaryShadow: '0 6px 18px rgba(229, 72, 95, 0.35)', fontWeight: 600 },
    Drawer: { footerPaddingBlock: 12 },
  },
};
