import React, {useEffect, useRef} from 'react';

import {Animated, TouchableOpacity} from 'react-native';

import {Icons} from '@app/assets/icons';
import {useTheme} from '@app/themes';

interface BookmarkButtonProps {
  isSaved: boolean;
  onPress: () => void;
  size?: number;
}

export const BookmarkButton = React.memo(({isSaved, onPress, size = 22}: BookmarkButtonProps) => {
  const scale = useRef(new Animated.Value(1)).current;
  const prevSaved = useRef(isSaved);
  const {colors, spacing} = useTheme();

  useEffect(() => {
    if (prevSaved.current !== isSaved) {
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.4,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
          speed: 14,
          bounciness: 12,
        }),
      ]).start();
      prevSaved.current = isSaved;
    }
  }, [isSaved, scale]);

  return (
    <TouchableOpacity
      onPress={onPress}
      hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
      style={{padding: spacing.xxs}}
    >
      <Animated.View style={{transform: [{scale}]}}>
        <Icons.Feather name="heart" size={size} color={isSaved ? colors.danger : colors.grey} />
      </Animated.View>
    </TouchableOpacity>
  );
});
