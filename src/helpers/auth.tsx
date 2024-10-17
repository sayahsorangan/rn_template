import {user_action} from '@redux-store/slice/user';
import {store} from '@redux-store/store';
import {Navigation} from '@router/navigation-helper';

export const onLogout = () => {
  store.subscribe(store.getState);
  store.dispatch(user_action.onLogout());
  Navigation.reset({name: 'home'});
};
