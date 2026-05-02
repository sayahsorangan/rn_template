import {onLogout} from '@app/helpers/auth';
import {app_action} from '@redux-store/slice/app/app';
import {user_action} from '@redux-store/slice/user';
import {store} from '@redux-store/store';
import {Navigation} from '@router/navigation-helper';

jest.mock('@redux-store/store', () => ({
  store: {
    subscribe: jest.fn(),
    getState: jest.fn(() => ({UserReducer: {auth: {accessToken: 'test-token'}}})),
    dispatch: jest.fn(),
  },
}));

jest.mock('@router/navigation-helper', () => ({
  Navigation: {
    reset: jest.fn(),
  },
}));

describe('Auth Helpers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('onLogout', () => {
    it('dispatches onLogout action', () => {
      onLogout();
      expect(store.dispatch).toHaveBeenCalledWith(user_action.onLogout());
    });

    it('dispatches setLanguage to en', () => {
      onLogout();
      expect(store.dispatch).toHaveBeenCalledWith(app_action.setLanguage('en'));
    });

    it('dispatches setThemeMode to light', () => {
      onLogout();
      expect(store.dispatch).toHaveBeenCalledWith(app_action.setThemeMode('light'));
    });

    it('resets navigation to login', () => {
      onLogout();
      expect(Navigation.reset).toHaveBeenCalledWith({name: 'login'});
    });
  });
});
