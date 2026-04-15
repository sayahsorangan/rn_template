import React, {useEffect, useRef} from 'react';

import {Animated, ViewStyle} from 'react-native';

interface FadeInViewProps {
  delay?: number;
  duration?: number;
  slideFrom?: 'bottom' | 'left' | 'right' | 'none';
  slideDistance?: number;
  children: React.ReactNode;
  style?: ViewStyle;
}

export const FadeInView = ({
  delay = 0,
  duration = 500,
  slideFrom = 'bottom',
  slideDistance = 30,
  children,
  style,
}: FadeInViewProps) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translate = useRef(new Animated.Value(slideFrom === 'none' ? 0 : slideDistance)).current;

  useEffect(() => {
    const animation = Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration,
        delay,
        useNativeDriver: true,
      }),
      ...(slideFrom !== 'none'
        ? [
            Animated.timing(translate, {
              toValue: 0,
              duration,
              delay,
              useNativeDriver: true,
            }),
          ]
        : []),
    ]);
    animation.start();
    return () => animation.stop();
  }, [opacity, translate, delay, duration, slideFrom]);

  const getTransform = () => {
    if (slideFrom === 'bottom') {
      return [{translateY: translate}];
    }
    if (slideFrom === 'left') {
      return [{translateX: Animated.multiply(translate, -1)}];
    }
    if (slideFrom === 'right') {
      return [{translateX: translate}];
    }
    return [];
  };

  return <Animated.View style={[{opacity, transform: getTransform()}, style]}>{children}</Animated.View>;
};

interface ScalePressBounceProps {
  children: React.ReactNode;
  onPress: () => void;
  style?: ViewStyle;
  hitSlop?: {top: number; bottom: number; left: number; right: number};
}

export const ScalePressBounce = ({children, onPress, style, hitSlop}: ScalePressBounceProps) => {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.85,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
      bounciness: 10,
    }).start();
  };

  return (
    <Animated.View style={[{transform: [{scale}]}, style]}>
      <Animated.View>
        {React.Children.map(children, child => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child as any, {
              onPress,
              onPressIn: handlePressIn,
              onPressOut: handlePressOut,
              hitSlop,
            });
          }
          return child;
        })}
      </Animated.View>
    </Animated.View>
  );
};
