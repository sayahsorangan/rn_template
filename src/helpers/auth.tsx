import {app_action} from '@redux-store/slice/app/app';
import {favorites_action} from '@redux-store/slice/favorites';
import {user_action} from '@redux-store/slice/user';
import {store} from '@redux-store/store';
import {Navigation} from '@router/navigation-helper';

export const onLogout = () => {
  store.subscribe(store.getState);
  store.dispatch(user_action.onLogout());
  store.dispatch(favorites_action.clearFavorites());
  store.dispatch(app_action.setLanguage('en'));
  store.dispatch(app_action.setThemeMode('light'));
  Navigation.reset({name: 'login'});
};
