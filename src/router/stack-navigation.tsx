import {TouchableOpacity} from 'react-native';

import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {Icons} from '@app/assets/icons';
import {Box, Text, theme} from '@app/themes';
import {STATUSBAR_HEIGHT} from '@components/container';
import {store} from '@redux-store/store';
import LoginScreen from '@screens/auth/login-screen';
import RegisterScreen from '@screens/auth/register-screen';
import ChatScreen from '@screens/chat/chat-screen';
import AddKnowledgeScreen from '@screens/knowledge/add-knowledge-screen';
import ProfileScreen from '@screens/profile/profile-screen';
import SplashScreen from '@screens/splash-screen';

import {BottomTabScreen} from './bottom-navigation';
import {Route, RouteStackNavigation} from './route-name';

const Stack = createNativeStackNavigator<RouteStackNavigation>();

export const StackNavigator = () => {
  store.subscribe(store.getState);
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        header: p => CustomHeader(p),
      }}
      initialRouteName={Route.splash}
    >
      <Stack.Screen name={Route.splash} component={SplashScreen} />
      <Stack.Screen name={Route.login} component={LoginScreen} />
      <Stack.Screen name={Route.register} component={RegisterScreen} />
      <Stack.Screen name={Route.tab} component={BottomTabScreen} />
      <Stack.Screen name={Route.chat} component={ChatScreen} options={{headerShown: true, title: 'New Chat'}} />
      <Stack.Screen
        name={Route.addKnowledge}
        component={AddKnowledgeScreen}
        options={{headerShown: true, title: 'Add Knowledge'}}
      />
      <Stack.Screen name={Route.profile} component={ProfileScreen} options={{headerShown: true, title: 'Profile'}} />
    </Stack.Navigator>
  );
};

const CustomHeader = (p: any) => {
  return (
    <Box
      style={{
        paddingTop: STATUSBAR_HEIGHT + theme.spacing.xs,
      }}
      paddingHorizontal="xs"
      paddingVertical="xs"
      flexDirection="row"
      alignItems="center"
      backgroundColor="white"
      borderBottomWidth={1}
      borderColor="grey_light"
    >
      <TouchableOpacity
        style={{
          padding: theme.spacing.xs,
        }}
        onPress={() => p.navigation.goBack()}
      >
        <Icons.Feather name="chevron-left" size={24} color={theme.colors.grey_dark} />
      </TouchableOpacity>
      <Box flex={1}>
        <Text numberOfLines={1} variant={'h_6_medium'} marginHorizontal={'xs'}>
          {p.options.title}
        </Text>
      </Box>
      <Box style={{width: theme.spacing.xs * 2 + 24}}>
        {
          // @ts-ignore
          p.options.headerRight && p.options.headerRight(null)
        }
      </Box>
    </Box>
  );
};
