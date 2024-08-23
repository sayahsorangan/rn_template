import React from 'react';

import {Dimensions, Platform, Text, TouchableOpacity, View} from 'react-native';

import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';

import {Icons} from '@app/assets/icons';
import {TAB_HEIGHT} from '@app/constan/dimensions';
import {theme} from '@app/themes';
import {MainHomeScreen} from '@screens/home/main-home';

import {IBottomTabScreen} from './route-name';

const {width: WIDTH} = Dimensions.get('window');
const Tab = createBottomTabNavigator<RouteStack>();

export const BottomTabScreen: React.VFC = () => (
  <Tab.Navigator screenOptions={{headerShown: false}} tabBar={props => <BottomTab {...props} />}>
    <Tab.Screen name="home" component={MainHomeScreen} />
  </Tab.Navigator>
);

const BottomTab = (props: any) => {
  const TAB_WIDTH = WIDTH;
  const {state, descriptors, navigation} = props;
  const focusedOptions = descriptors[state.routes[state.index].key].options;

  const TabIcon = (routeName: keyof IBottomTabScreen, index: number) => {
    const isFocused = state.index === index;
    switch (routeName) {
      case 'home':
        return (
          <Icons.Feather name="home" size={22} color={isFocused ? theme.colors.primary : theme.colors.grey_light} />
        );
      default:
        return;
    }
  };

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
          shadowColor: '#999',
          elevation: 8,
          shadowOffset: {width: 0, height: 0},
          shadowOpacity: 0.2,
          shadowRadius: 8,
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
                backgroundColor: isFocused ? theme.colors.primary_light : theme.colors.white,
                borderRadius: theme.borderRadii.sm,
              }}
            >
              {TabIcon(route.name, index)}
              <Text
                style={{
                  marginTop: theme.spacing.xs,
                  ...theme.textVariants.body_helper_regular,
                  fontWeight: '600',
                  color: isFocused ? theme.colors.primary : theme.colors.grey_light,
                  textTransform: 'capitalize',
                }}
                numberOfLines={1}
              >
                {route.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </>
  );
};
