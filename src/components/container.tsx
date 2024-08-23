import React, {Fragment, useEffect, useState} from 'react';

import {
  ActivityIndicator,
  Image,
  Platform,
  SafeAreaView,
  StatusBar,
  StatusBarProps,
  View,
  ViewProps,
} from 'react-native';

import {SCREEN_HEIGHT, SCREEN_WIDTH} from '@app/constan/dimensions';
import {Box, Text, theme} from '@app/themes';

import {EmptyData} from './empty-data';

export const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 40 : StatusBar.currentHeight || 0;

interface ContainerProps extends OwnStatusBarProps {
  children: React.ReactNode;
  backgroundColor?: string;
  loading?: boolean;
  containerProps?: ViewProps;
  whithImageBg?: 1 | 2 | 3 | null;
  is_empty?: boolean;
  loading_text?: string;
}

export const Container = React.memo((props: ContainerProps): JSX.Element => {
  const {colors} = theme;
  const {
    children,
    backgroundColor = colors.white,
    translucent = false,
    loading = false,
    containerProps,
    whithImageBg = null,
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
      {whithImageBg && (
        <Box position={'absolute'} top={0} left={0}>
          <Image source={{uri: ''}} style={{height: SCREEN_HEIGHT, width: SCREEN_WIDTH}} resizeMode="cover" />
        </Box>
      )}
      <MyStatusBar backgroundColor={whithImageBg ? undefined : backgroundColor} {...{translucent}} {...other} />
      <View style={{flex: 1, backgroundColor: whithImageBg ? undefined : backgroundColor, overflow: 'hidden'}}>
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
              padding: theme.spacing.lg,
              borderRadius: 8,
              backgroundColor: theme.colors.white,
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
