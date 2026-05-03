import React from 'react';

import {Dimensions, Platform, Text, TouchableOpacity, View} from 'react-native';

import {useTranslation} from 'react-i18next';

import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';

import {Icons} from '@app/assets/icons';
import {TAB_HEIGHT} from '@app/constan/dimensions';
import {useTheme} from '@app/themes';
import {MainHomeScreen} from '@screens/home/main-home';
import KnowledgeScreen from '@screens/knowledge/knowledge-screen';
import ProfileScreen from '@screens/profile/profile-screen';

import {IBottomTabScreen} from './route-name';

const {width: WIDTH} = Dimensions.get('window');
const Tab = createBottomTabNavigator<IBottomTabScreen>();

const TAB_ICONS: Record<keyof IBottomTabScreen, string> = {
  home: 'home',
  knowledge: 'book-open',
  profile: 'user',
};

type TabIconProps = {
  routeName: keyof IBottomTabScreen;
  isFocused: boolean;
  primaryColor: string;
  greyColor: string;
};

const TabIcon = ({routeName, isFocused, primaryColor, greyColor}: TabIconProps) => {
  const iconName = TAB_ICONS[routeName];
  if (!iconName) return null;
  return <Icons.Feather name={iconName} size={22} color={isFocused ? primaryColor : greyColor} />;
};

const renderBottomTab = (props: any) => <BottomTab {...props} />;

export const BottomTabScreen = () => (
  <Tab.Navigator screenOptions={{headerShown: false}} tabBar={renderBottomTab}>
    <Tab.Screen name="home" component={MainHomeScreen} />
    <Tab.Screen name="knowledge" component={KnowledgeScreen} />
    <Tab.Screen name="profile" component={ProfileScreen} />
  </Tab.Navigator>
);

const BottomTab = (props: any) => {
  const TAB_WIDTH = WIDTH;
  const theme = useTheme();
  const {t} = useTranslation();
  const {state, descriptors, navigation} = props;
  const focusedOptions = descriptors[state.routes[state.index].key].options;

  if (focusedOptions.tabBarVisible === false) {
    return null;
  }

  return (
    <>
      <View
        style={{
          backgroundColor: theme.colors.white,
          position: 'absolute',
          bottom: 0,
          flexDirection: 'row',
          ...theme.elevationStyles.xlarge,
          padding: 8,
          width: TAB_WIDTH,
          ...Platform.select({
            android: {height: TAB_HEIGHT},
            ios: {
              height: TAB_HEIGHT + 16,
              paddingBottom: 24,
            },
          }),
        }}
      >
        {state.routes.map((route: any, index: number) => {
          const {options} = descriptors[route.key];

          const isFocused = state.index === index;

          const onPress = () => {
            navigation.navigate(route.name);
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          return (
            <TouchableOpacity
              activeOpacity={1}
              key={index}
              accessibilityRole="button"
              accessibilityState={isFocused ? {selected: true} : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: theme.borderRadii.sm,
              }}
            >
              {TabIcon({
                routeName: route.name,
                isFocused,
                primaryColor: theme.colors.primary,
                greyColor: theme.colors.grey_light,
              })}
              <Text
                style={{
                  marginTop: theme.spacing.xs,
                  ...theme.textVariants.body_helper_bold,
                  fontWeight: '600',
                  color: isFocused ? theme.colors.primary : theme.colors.grey_light,
                }}
                numberOfLines={1}
              >
                {t(route.name)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </>
  );
};
