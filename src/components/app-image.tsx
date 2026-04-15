import React, {useState} from 'react';

import {Image as RNImage, ImageProps as RNImageProps, ImageStyle, StyleSheet, View, ViewStyle} from 'react-native';

import {Skeleton} from '@components/skeleton';

interface AppImageProps extends Omit<RNImageProps, 'style'> {
  style?: ImageStyle;
  containerStyle?: ViewStyle;
}

export const AppImage = ({style, containerStyle, onLoad, ...rest}: AppImageProps) => {
  const [loading, setLoading] = useState(true);

  const flatStyle = StyleSheet.flatten(style) || {};
  const width = flatStyle.width ?? '100%';
  const height = flatStyle.height ?? 200;
  const borderRadius = flatStyle.borderRadius ?? 0;
  const borderTopLeftRadius = flatStyle.borderTopLeftRadius ?? borderRadius;
  const borderTopRightRadius = flatStyle.borderTopRightRadius ?? borderRadius;
  const borderBottomLeftRadius = flatStyle.borderBottomLeftRadius ?? borderRadius;
  const borderBottomRightRadius = flatStyle.borderBottomRightRadius ?? borderRadius;
  const maxRadius = Math.max(
    borderTopLeftRadius as number,
    borderTopRightRadius as number,
    borderBottomLeftRadius as number,
    borderBottomRightRadius as number,
    borderRadius as number,
  );

  return (
    <View style={[{width: width as any, height: height as any, overflow: 'hidden'}, containerStyle]}>
      {loading && (
        <View style={StyleSheet.absoluteFill}>
          <Skeleton width="100%" height="100%" borderRadius={maxRadius as number} />
        </View>
      )}
      <RNImage
        {...rest}
        style={[styles.image, style]}
        onLoad={e => {
          setLoading(false);
          onLoad?.(e);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  image: {
    width: '100%',
    height: '100%',
  },
});
