import {Platform, ViewStyle} from 'react-native';

interface ElevationOptions {
  elevation?: number;
  shadowColor?: string;
  shadowOpacity?: number;
  shadowRadius?: number;
  shadowOffsetHeight?: number;
  shadowOffsetWidth?: number;
}

/**
 * Creates platform-specific elevation styles for consistent shadows across iOS and Android
 * @param options - Elevation configuration options
 * @returns ViewStyle object with platform-specific shadow/elevation properties
 */
export const createElevationStyle = (options: ElevationOptions = {}): ViewStyle => {
  const {elevation = 3, shadowOpacity = 0.1, shadowRadius = 4, shadowOffsetHeight = 2, shadowOffsetWidth = 0} = options;

  return Platform.select({
    ios: {
      shadowOpacity,
      shadowRadius,
      shadowOffset: {
        height: shadowOffsetHeight,
        width: shadowOffsetWidth,
      },
    },
    android: {
      elevation,
    },
  }) as ViewStyle;
};

/**
 * Predefined elevation styles for common use cases
 */
export const elevationStyles = {
  small: createElevationStyle({elevation: 1, shadowOpacity: 0.1, shadowRadius: 1}),
  medium: createElevationStyle({elevation: 2, shadowOpacity: 0.15, shadowRadius: 3}),
  large: createElevationStyle({elevation: 4, shadowOpacity: 0.2, shadowRadius: 6}),
  xlarge: createElevationStyle({elevation: 8, shadowOpacity: 0.25, shadowRadius: 9}),
};
