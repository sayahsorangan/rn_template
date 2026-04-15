import {Alert} from 'react-native';

import {AfterResponseHook, BeforeRequestHook} from 'ky';
import reactotron from 'reactotron-react-native';

import {translate} from '@i18n';
import {store} from '@redux-store/store';

export const authBeforeResponseHooks: BeforeRequestHook = async ({headers}) => {
  const {UserReducer} = store.getState();
  const token = UserReducer?.auth?.accessToken;
  if (token) {
    headers.set('Authorization', 'Bearer ' + token);
  }
};

export const authAfterResponseHooks: AfterResponseHook = async (req, option, res) => {
  const statusCode = [401].includes(res.status);
  const {UserReducer} = store.getState();
  if (statusCode && UserReducer.auth) {
    Alert.alert(translate('session_expired'));
  } else if (!res.ok && !statusCode) {
    const err: any = await res.json();

    reactotron.log('its err', err);

    let error = '';
    if (err?.error?.message) {
      error = err.error.message;
    } else if (err?.description) {
      error = err.description;
    }

    Alert.alert(res.status.toString(), error);
  }
};
