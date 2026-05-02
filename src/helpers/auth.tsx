import {app_action} from '@redux-store/slice/app/app';
import {user_action} from '@redux-store/slice/user';
import {store} from '@redux-store/store';
import {Navigation} from '@router/navigation-helper';

export const onLogout = () => {
  store.dispatch(user_action.onLogout());
  store.dispatch(app_action.setLanguage('en'));
  store.dispatch(app_action.setThemeMode('light'));
  Navigation.reset({name: 'login'});
};
