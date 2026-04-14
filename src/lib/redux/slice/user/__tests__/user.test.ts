import {rootReducers} from '@redux-store/root-reducer';
import {user_action} from '@redux-store/slice/user/user';
import {configureStore} from '@reduxjs/toolkit';

describe('UserReducer', () => {
  const createStore = (preloadedState?: Record<string, any>) =>
    configureStore({
      reducer: rootReducers,
      preloadedState,
      middleware: getDefault => getDefault({serializableCheck: false}),
    });

  it('has correct initial state', () => {
    const store = createStore();
    const state = store.getState().UserReducer;
    expect(state.user).toBeUndefined();
    expect(state.auth).toBeUndefined();
  });

  it('sets user data via setUser', () => {
    const store = createStore();
    const mockUser = {id: '1', name: 'John', email: 'john@test.com'};

    store.dispatch(user_action.setUser(mockUser));
    const state = store.getState().UserReducer;
    expect(state.user).toEqual(mockUser);
  });

  it('sets auth data via setAuth', () => {
    const store = createStore();
    const mockAuth = {token: 'test-token-123'};

    store.dispatch(user_action.setAuth(mockAuth));
    const state = store.getState().UserReducer;
    expect(state.auth).toEqual(mockAuth);
  });

  it('clears user and auth on logout', () => {
    const store = createStore();
    const mockUser = {id: '1', name: 'John'};
    const mockAuth = {token: 'test-token'};

    store.dispatch(user_action.setUser(mockUser));
    store.dispatch(user_action.setAuth(mockAuth));

    store.dispatch(user_action.onLogout());
    const state = store.getState().UserReducer;
    expect(state.user).toBeUndefined();
    expect(state.auth).toBeUndefined();
  });
});
