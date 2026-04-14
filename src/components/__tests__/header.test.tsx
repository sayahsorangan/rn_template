import React from 'react';

import {renderWithProviders} from '@app/test-utils';
import {Header} from '@components/header';

jest.mock('@router/navigation-helper', () => ({
  Navigation: {
    back: jest.fn(),
  },
}));

describe('Header', () => {
  it('renders title text', () => {
    const {getByText} = renderWithProviders(<Header title="My Screen" />);
    expect(getByText('My Screen')).toBeTruthy();
  });

  it('renders with right component', () => {
    const {getByText} = renderWithProviders(<Header title="Title" rightComponent={<></>} />);
    expect(getByText('Title')).toBeTruthy();
  });
});
