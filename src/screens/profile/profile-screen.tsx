import React, {useCallback} from 'react';

import {ScrollView, StatusBar, Switch, TouchableOpacity} from 'react-native';

import {useTranslation} from 'react-i18next';

import {useFocusEffect} from '@react-navigation/native';

import {Icons} from '@app/assets/icons';
import {onLogout} from '@app/helpers/auth';
import {useAppDispatch, useAppSelector} from '@app/hooks/redux';
import {Box, Text, useTheme} from '@app/themes';
import {FadeInView} from '@components/animations';
import {AppImage} from '@components/app-image';
import {Avatar} from '@components/avatar';
import {Container} from '@components/container';
import {app_action} from '@redux-store/slice/app';
import {Navigation} from '@router/navigation-helper';

interface MenuItemProps {
  icon: string;
  label: string;
  onPress?: () => void;
  color?: string;
  labelColor?: string;
}

const MenuItem = ({icon, label, onPress, color, labelColor}: MenuItemProps) => {
  const {colors, spacing} = useTheme();
  const iconColor = color || colors.grey_dark;
  const textColor = labelColor || 'black';

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.md,
      }}
    >
      <Box
        width={40}
        height={40}
        borderRadius="sm"
        justifyContent="center"
        alignItems="center"
        style={{backgroundColor: colors.background}}
      >
        <Icons.Feather name={icon} size={20} color={iconColor} />
      </Box>
      <Text variant="body_medium" color={textColor as any} marginLeft="sm" flex={1}>
        {label}
      </Text>
      <Icons.Feather name="chevron-right" size={20} color={colors.grey} />
    </TouchableOpacity>
  );
};

const ProfileScreen = () => {
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const user = useAppSelector(state => state.UserReducer.user);
  const themeMode = useAppSelector(state => state.AppReducer.themeMode);
  const language = useAppSelector(state => state.AppReducer.language);
  const {t} = useTranslation();

  useFocusEffect(
    useCallback(() => {
      StatusBar.setBarStyle(themeMode === 'dark' ? 'light-content' : 'dark-content');
    }, [themeMode]),
  );

  return (
    <Container>
      <ScrollView contentContainerStyle={{paddingBottom: 100}}>
        {/* Avatar section */}
        <FadeInView delay={100} slideFrom="none">
          <Box alignItems="center" marginTop="lg" marginBottom="lg">
            <Box>
              {user?.avatar ? (
                <AppImage
                  source={{uri: user.avatar}}
                  style={{
                    width: 120,
                    height: 120,
                    borderRadius: 60,
                  }}
                  containerStyle={{
                    borderWidth: 3,
                    borderColor: theme.colors.primary_light,
                    borderRadius: 60,
                  }}
                />
              ) : (
                <Avatar text={user?.fullName ?? undefined} size={120} />
              )}
              {/* Edit icon overlay */}
              <TouchableOpacity
                onPress={() => Navigation.push('editProfile')}
                style={{
                  position: 'absolute',
                  bottom: 4,
                  right: 4,
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: theme.colors.primary,
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderWidth: 2,
                  borderColor: theme.colors.white,
                }}
              >
                <Icons.Feather name="edit-2" size={14} color={theme.colors.white} />
              </TouchableOpacity>
            </Box>
            <Text variant="h_4_bold" marginTop="sm">
              {user?.fullName ?? ''}
            </Text>
            <Text variant="body_regular" color="grey" marginTop="xxs">
              {user?.email ?? ''}
            </Text>
          </Box>
        </FadeInView>

        {/* Menu section 1 */}
        <FadeInView delay={200} slideFrom="bottom" slideDistance={20}>
          <Box
            marginHorizontal="md"
            marginBottom="md"
            borderRadius="sm"
            borderWidth={1}
            borderColor="grey_light"
            style={{backgroundColor: theme.colors.white}}
          >
            <MenuItem icon="user" label={t('edit_profile')} onPress={() => Navigation.push('editProfile')} />
          </Box>
        </FadeInView>

        {/* Settings section */}
        <FadeInView delay={350} slideFrom="bottom" slideDistance={20}>
          <Box
            marginHorizontal="md"
            marginBottom="md"
            borderRadius="sm"
            borderWidth={1}
            borderColor="grey_light"
            style={{backgroundColor: theme.colors.white}}
          >
            <Box flexDirection="row" alignItems="center" paddingVertical="md" paddingHorizontal="md">
              <Box
                width={40}
                height={40}
                borderRadius="sm"
                justifyContent="center"
                alignItems="center"
                style={{backgroundColor: theme.colors.background}}
              >
                <Icons.Feather name={themeMode === 'dark' ? 'moon' : 'sun'} size={20} color={theme.colors.grey_dark} />
              </Box>
              <Text variant="body_medium" color="black" marginLeft="sm" flex={1}>
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
            <Box height={1} backgroundColor="grey_light" marginHorizontal="md" />
            <Box flexDirection="row" alignItems="center" paddingVertical="md" paddingHorizontal="md">
              <Box
                width={40}
                height={40}
                borderRadius="sm"
                justifyContent="center"
                alignItems="center"
                style={{backgroundColor: theme.colors.background}}
              >
                <Icons.Feather name="globe" size={20} color={theme.colors.grey_dark} />
              </Box>
              <Text variant="body_medium" color="black" marginLeft="sm" flex={1}>
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
                  name="chevron-right"
                  size={14}
                  color={theme.colors.primary_dark}
                  style={{marginLeft: 4}}
                />
              </TouchableOpacity>
            </Box>
            <Box height={1} backgroundColor="grey_light" marginHorizontal="md" />
            <MenuItem icon="help-circle" label="Help & Support" />
          </Box>
        </FadeInView>

        {/* Logout section */}
        <FadeInView delay={500} slideFrom="bottom" slideDistance={20}>
          <Box
            marginHorizontal="md"
            borderRadius="sm"
            borderWidth={1}
            borderColor="grey_light"
            style={{backgroundColor: theme.colors.white}}
          >
            <MenuItem
              icon="log-out"
              label={t('logout')}
              onPress={onLogout}
              color={theme.colors.danger}
              labelColor="danger"
            />
          </Box>
        </FadeInView>
      </ScrollView>
    </Container>
  );
};

export default ProfileScreen;
