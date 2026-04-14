import React, {Fragment, useEffect, useState} from 'react';

import {ActivityIndicator, Platform, SafeAreaView, StatusBar, StatusBarProps, View, ViewProps} from 'react-native';

import {SCREEN_WIDTH} from '@app/constan/dimensions';
import {Text, useTheme} from '@app/themes';

import {EmptyData} from './empty-data';

export const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 40 : StatusBar.currentHeight || 0;

interface ContainerProps extends OwnStatusBarProps {
  children: React.ReactNode;
  backgroundColor?: string;
  loading?: boolean;
  containerProps?: ViewProps;
  is_empty?: boolean;
  loading_text?: string;
}

export const Container = React.memo((props: ContainerProps) => {
  const {colors, spacing} = useTheme();
  const {
    children,
    backgroundColor = colors.white,
    translucent = false,
    loading = false,
    containerProps,
    is_empty = false,
    loading_text,
    ...other
  } = props;

  const [isLoading, setIsLoading] = useState(loading);

  useEffect(() => {
    setIsLoading(loading);
  }, [loading]);

  return (
    <View style={{flex: 1}} {...containerProps}>
      <MyStatusBar backgroundColor={backgroundColor} {...{translucent}} {...other} />
      <View style={{flex: 1, backgroundColor, overflow: 'hidden'}}>
        {isLoading ? null : is_empty ? <EmptyData /> : children}
      </View>
      {isLoading && (
        <View
          style={{
            position: 'absolute',
            width: SCREEN_WIDTH,
            height: '100%',
            justifyContent: 'center',
            left: 0,
            zIndex: 10000,
          }}
        >
          <View style={{backgroundColor: colors.black, flex: 1, opacity: 0.1}} />
          <View
            style={{
              position: 'absolute',
              aspectRatio: 1,
              padding: spacing.lg,
              borderRadius: 8,
              backgroundColor: colors.white,
              alignSelf: 'center',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <ActivityIndicator size="large" color={colors.primary} />

            {!!loading_text && (
              <Text color={'info'} variant={'body_regular'} mt={'md'}>
                {loading_text}
              </Text>
            )}
          </View>
        </View>
      )}
    </View>
  );
});

interface OwnStatusBarProps extends StatusBarProps {
  safeArea?: boolean;
}

const MyStatusBar = React.memo(
  ({backgroundColor, safeArea = true, translucent = false, ...other}: OwnStatusBarProps) => {
    const Wrapper = safeArea ? SafeAreaView : Fragment;
    return (
      <View style={{backgroundColor, height: translucent ? 0 : STATUSBAR_HEIGHT}}>
        <Wrapper>
          <StatusBar animated={true} translucent backgroundColor="transparent" {...other} />
        </Wrapper>
      </View>
    );
  },
);
