// Theme configuration for Milk Karan App
import { Dimensions } from 'react-native';
import COLORS from './colors';

const { width, height } = Dimensions.get('window');

export const SIZES = {
  // App dimensions
  width,
  height,
  
  // Font sizes
  h1: 32,
  h2: 24,
  h3: 20,
  h4: 18,
  h5: 16,
  h6: 14,
  body: 14,
  caption: 12,
  
  // Spacing
  padding: 16,
  margin: 16,
  radius: 12,
  
  // Icon sizes
  iconSmall: 20,
  iconMedium: 24,
  iconLarge: 32,
  iconXLarge: 40,
  
  // Card sizes
  cardPadding: 20,
  cardRadius: 12,
  
  // Button sizes
  buttonHeight: 50,
  buttonRadius: 8,
  
  // Input sizes
  inputHeight: 50,
  inputRadius: 8,
};

export const FONTS = {
  h1: { fontSize: SIZES.h1, fontWeight: 'bold' },
  h2: { fontSize: SIZES.h2, fontWeight: 'bold' },
  h3: { fontSize: SIZES.h3, fontWeight: 'bold' },
  h4: { fontSize: SIZES.h4, fontWeight: '600' },
  h5: { fontSize: SIZES.h5, fontWeight: '600' },
  h6: { fontSize: SIZES.h6, fontWeight: '600' },
  body: { fontSize: SIZES.body, fontWeight: 'normal' },
  caption: { fontSize: SIZES.caption, fontWeight: 'normal' },
};

export const SHADOWS = {
  light: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  medium: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  dark: {
    shadowColor: COLORS.shadowDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
};

export const BREAKPOINTS = {
  mobile: 480,
  tablet: 768,
  desktop: 1024,
};

export const isDesktop = width >= BREAKPOINTS.tablet;
export const isTablet = width >= BREAKPOINTS.mobile && width < BREAKPOINTS.desktop;
export const isMobile = width < BREAKPOINTS.mobile;

const theme = {
  COLORS,
  SIZES,
  FONTS,
  SHADOWS,
  BREAKPOINTS,
  isDesktop,
  isTablet,
  isMobile,
};

export default theme;
