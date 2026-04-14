import {onLogout} from '@app/helpers/auth';
import {user_action} from '@redux-store/slice/user/user';
import {store} from '@redux-store/store';
import {Navigation} from '@router/navigation-helper';

jest.mock('@redux-store/store', () => ({
  store: {
    subscribe: jest.fn(),
    getState: jest.fn(),
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

    it('resets navigation to home', () => {
      onLogout();
      expect(Navigation.reset).toHaveBeenCalledWith({name: 'home'});
    });
  });
});
