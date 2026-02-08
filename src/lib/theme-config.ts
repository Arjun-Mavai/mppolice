/**
 * Centralized Theme Configuration
 * 
 * This file contains all theme-related constants and utilities
 * for maintaining consistent branding across the application.
 */

export const THEME_COLORS = {
  // Primary Brand Colors
  electricBlue: '#00F0FF',
  electricBlueRGB: '0, 240, 255',
  
  // Derived Colors (for gradients, hover states, etc.)
  electricBlueDark: '#00D0E0',
  electricBlueLight: '#33F3FF',
  electricBluePale: '#E6FCFF',
  
  // Semantic Colors
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
} as const;

export const THEME_GRADIENTS = {
  electricBlue: `linear-gradient(135deg, ${THEME_COLORS.electricBlue} 0%, ${THEME_COLORS.electricBlueDark} 100%)`,
  electricBlueGlow: `linear-gradient(135deg, ${THEME_COLORS.electricBlueLight} 0%, ${THEME_COLORS.electricBlue} 50%, ${THEME_COLORS.electricBlueDark} 100%)`,
} as const;

/**
 * Utility function to get electric blue with opacity
 * @param opacity - Value between 0 and 1
 * @returns rgba color string
 */
export function getElectricBlueWithOpacity(opacity: number): string {
  return `rgba(${THEME_COLORS.electricBlueRGB}, ${opacity})`;
}

/**
 * Tailwind-compatible class names for electric blue
 */
export const ELECTRIC_BLUE_CLASSES = {
  bg: 'bg-electric-blue',
  bgHover: 'hover:bg-electric-blue',
  text: 'text-electric-blue',
  textHover: 'hover:text-electric-blue',
  border: 'border-electric-blue',
  borderHover: 'hover:border-electric-blue',
  ring: 'ring-electric-blue',
  from: 'from-electric-blue',
  to: 'to-electric-blue',
  via: 'via-electric-blue',
} as const;
