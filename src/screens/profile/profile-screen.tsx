import React, {useCallback, useRef} from 'react';

import {Animated, StatusBar, Switch, TouchableOpacity} from 'react-native';

import {useTranslation} from 'react-i18next';

import {useFocusEffect} from '@react-navigation/native';

import {Icons} from '@app/assets/icons';
import {onLogout} from '@app/helpers/auth';
import {useAppDispatch, useAppSelector} from '@app/hooks/redux';
import {Box, Text, useTheme} from '@app/themes';
import {FadeInView} from '@components/animations';
import {AppImage} from '@components/app-image';
import {Avatar} from '@components/avatar';
import {Button} from '@components/button/Button';
import {Container, STATUSBAR_HEIGHT} from '@components/container';
import {app_action} from '@redux-store/slice/app';
import {Navigation} from '@router/navigation-helper';

const ProfileScreen = () => {
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const user = useAppSelector(state => state.UserReducer.user);
  const themeMode = useAppSelector(state => state.AppReducer.themeMode);
  const language = useAppSelector(state => state.AppReducer.language);
  const {t} = useTranslation();
  const scrollY = useRef(new Animated.Value(0)).current;

  useFocusEffect(
    useCallback(() => {
      StatusBar.setBarStyle(themeMode === 'dark' ? 'dark-content' : 'light-content');
      return () => {
        StatusBar.setBarStyle(themeMode === 'dark' ? 'light-content' : 'dark-content');
      };
    }, [themeMode]),
  );

  const headerScale = scrollY.interpolate({
    inputRange: [-100, 0],
    outputRange: [1.3, 1],
    extrapolateRight: 'clamp',
  });

  const avatarTranslateY = scrollY.interpolate({
    inputRange: [0, 150],
    outputRange: [0, -20],
    extrapolate: 'clamp',
  });

  return (
    <Container translucent>
      <Animated.ScrollView
        contentContainerStyle={{paddingBottom: 100}}
        onScroll={Animated.event([{nativeEvent: {contentOffset: {y: scrollY}}}], {useNativeDriver: true})}
        scrollEventThrottle={16}
      >
        <Animated.View
          style={{
            alignItems: 'center',
            paddingTop: STATUSBAR_HEIGHT + theme.spacing.xl,
            paddingBottom: theme.spacing.lg,
            backgroundColor: theme.colors.primary_dark,
            transform: [{scale: headerScale}],
          }}
        >
          <Animated.View style={{transform: [{translateY: avatarTranslateY}]}}>
            <FadeInView delay={100} slideFrom="none">
              {user?.avatar ? (
                <AppImage
                  source={{uri: user.avatar}}
                  style={{
                    width: 100,
                    height: 100,
                    borderRadius: 50,
                  }}
                  containerStyle={{
                    borderWidth: 3,
                    borderColor: theme.colors.white,
                    borderRadius: 50,
                  }}
                />
              ) : (
                <Avatar text={user?.name} size={100} />
              )}
            </FadeInView>
          </Animated.View>
          <FadeInView delay={200} slideFrom="bottom" slideDistance={15}>
            <Text variant="h_4_bold" style={{color: theme.colors.white}} marginTop="sm">
              {user?.name || 'User'}
            </Text>
          </FadeInView>
          <FadeInView delay={300} slideFrom="bottom" slideDistance={15}>
            <Text variant="body_regular" style={{color: theme.colors.primary_light}} marginTop="xxs">
              {user?.email || ''}
            </Text>
          </FadeInView>
        </Animated.View>

        <Box padding="md">
          {!!user?.bio && (
            <FadeInView delay={350} slideFrom="left">
              <Box padding="md" borderRadius="xs" marginBottom="md" style={{backgroundColor: theme.colors.grey_light}}>
                <Text variant="body_helper_medium" color="grey" marginBottom="xxs">
                  {t('bio')}
                </Text>
                <Text variant="body_regular" color="grey_dark">
                  {user.bio}
                </Text>
              </Box>
            </FadeInView>
          )}

          <FadeInView delay={450} slideFrom="right">
            <TouchableOpacity
              onPress={() => Navigation.push('editProfile')}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: theme.spacing.md,
                backgroundColor: theme.colors.white,
                borderRadius: theme.borderRadii.xs,
                borderWidth: 1,
                borderColor: theme.colors.grey_light,
                marginBottom: theme.spacing.sm,
              }}
            >
              <Icons.Feather name="edit-2" size={20} color={theme.colors.primary} />
              <Text variant="body_medium" marginLeft="sm" flex={1}>
                {t('edit_profile')}
              </Text>
              <Icons.Feather name="chevron-right" size={20} color={theme.colors.grey} />
            </TouchableOpacity>
          </FadeInView>

          <FadeInView delay={500} slideFrom="right">
            <Box
              flexDirection="row"
              alignItems="center"
              padding="md"
              borderRadius="xs"
              borderWidth={1}
              borderColor="grey_light"
              marginBottom="sm"
              style={{backgroundColor: theme.colors.white}}
            >
              <Icons.Feather name={themeMode === 'dark' ? 'moon' : 'sun'} size={20} color={theme.colors.primary} />
              <Text variant="body_medium" marginLeft="sm" flex={1}>
                {t('dark_mode')}
              </Text>
              <Switch
                value={themeMode === 'dark'}
                onValueChange={() => {
                  dispatch(app_action.toggleThemeMode());
                }}
                trackColor={{false: theme.colors.grey_light, true: theme.colors.primary_light}}
                thumbColor={themeMode === 'dark' ? theme.colors.primary : theme.colors.grey}
              />
            </Box>
          </FadeInView>

          <FadeInView delay={550} slideFrom="right">
            <Box
              flexDirection="row"
              alignItems="center"
              padding="md"
              borderRadius="xs"
              borderWidth={1}
              borderColor="grey_light"
              marginBottom="sm"
              style={{backgroundColor: theme.colors.white}}
            >
              <Icons.Feather name="globe" size={20} color={theme.colors.primary} />
              <Text variant="body_medium" marginLeft="sm" flex={1}>
                {t('language')}
              </Text>
              <TouchableOpacity
                onPress={() => dispatch(app_action.setLanguage(language === 'en' ? 'id' : 'en'))}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: theme.colors.primary_light,
                  paddingVertical: theme.spacing.xxs,
                  paddingHorizontal: theme.spacing.sm,
                  borderRadius: theme.borderRadii.md,
                }}
              >
                <Text variant="body_helper_semibold" color="primary_dark">
                  {language === 'en' ? 'EN' : 'ID'}
                </Text>
                <Icons.Feather
                  name="chevron-down"
                  size={14}
                  color={theme.colors.primary_dark}
                  style={{marginLeft: 4}}
                />
              </TouchableOpacity>
            </Box>
          </FadeInView>

          <FadeInView delay={650} slideFrom="bottom">
            <Box marginTop="md">
              <Button
                label={t('logout')}
                onPress={onLogout}
                secondary
                ButtonStyle={{borderColor: theme.colors.danger}}
                LabelStyle={{color: theme.colors.danger}}
              />
            </Box>
          </FadeInView>
        </Box>
      </Animated.ScrollView>
    </Container>
  );
};

export default ProfileScreen;
