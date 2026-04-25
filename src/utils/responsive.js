import { Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export const isTablet = width >= 768;

// Spacing scale — tablet'te 1.35x
export const rs = (size) => isTablet ? Math.round(size * 1.35) : size;

// Font scale — tablet'te 1.2x
export const rf = (size) => isTablet ? Math.round(size * 1.2) : size;

// Modal/card max width — tablet'te ortaya hizalanmış içerik
export const MODAL_MAX_WIDTH = isTablet ? 560 : undefined;
export const CARD_MAX_WIDTH = isTablet ? 620 : undefined;
