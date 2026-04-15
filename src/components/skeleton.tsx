import React, {useEffect, useRef} from 'react';

import {Animated, ViewStyle} from 'react-native';

import {useTheme} from '@app/themes';

interface SkeletonProps {
  width: number | string;
  height: number | string;
  borderRadius?: number;
  style?: ViewStyle;
}

export const Skeleton = ({width, height, borderRadius = 0, style}: SkeletonProps) => {
  const opacity = useRef(new Animated.Value(0.3)).current;
  const {colors} = useTheme();

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {backgroundColor: colors.grey_light},
        {width: width as any, height: height as any, borderRadius, opacity},
        style,
      ]}
    />
  );
};
