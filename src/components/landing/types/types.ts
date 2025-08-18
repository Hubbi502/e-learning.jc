// Landing page types
export interface LandingContainerProps {
  isDark: boolean;
  toggleTheme: () => void;
  isVisible: boolean;
}

export interface LandingNavigationProps {
  isDark: boolean;
  toggleTheme: () => void;
}

export interface HeroSectionProps {
  isDark: boolean;
  isVisible: boolean;
}

export interface FeaturesSectionProps {
  isDark: boolean;
}

export interface StatsSectionProps {
  isDark: boolean;
}

export interface LandingFooterProps {
  isDark: boolean;
}
