import {Alert} from 'react-native';

import {AfterResponseHook, BeforeRequestHook} from 'ky';

import {translate} from '@i18n';
import {store} from '@redux-store/store';

export const authBeforeResponseHooks: BeforeRequestHook = async ({request}) => {
  const {UserReducer} = store.getState();
  const token = UserReducer?.auth?.accessToken;
  if (token) {
    request.headers.set('Authorization', 'Bearer ' + token);
  }
};

export const authAfterResponseHooks: AfterResponseHook = async ({response}) => {
  const statusCode = [401].includes(response.status);
  const {UserReducer} = store.getState();
  if (statusCode && UserReducer.auth) {
    Alert.alert(translate('session_expired'));
  } else if (!response.ok && !statusCode) {
    const err: any = await response.json();
    let error = '';
    if (err?.error?.message) {
      error = err.error.message;
    } else if (err?.description) {
      error = err.description;
    }

    Alert.alert(response.status.toString(), error);
  }
};
