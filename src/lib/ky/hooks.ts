import {Alert} from 'react-native';

import {AfterResponseHook, BeforeRequestHook} from 'ky';
import reactotron from 'reactotron-react-native';

import {store} from '@redux-store/store';

export const authBeforeResponseHooks: BeforeRequestHook = async ({headers}) => {
  store.subscribe(store.getState);
  const {UserReducer} = store.getState();
  const token = UserReducer?.auth as any;
  headers.set('Authorization', 'Bearer ' + token);
};

export const authAfterResponseHooks: AfterResponseHook = async (req, option, res) => {
  const statusCode = [401].includes(res.status);
  store.subscribe(store.getState);
  const {UserReducer} = store.getState();
  if (statusCode && UserReducer.auth) {
    Alert.alert('Session Expired');
    //handel expire
  } else if (!res.ok && !statusCode) {
    const err: any = await res.json();

    reactotron.log('its err', err);

    let error = '';
    if (err?.description) {
      error = err?.description;
    }

    Alert.alert(res.status.toString(), error);
  }
};
