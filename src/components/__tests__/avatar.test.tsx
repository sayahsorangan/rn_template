import React from 'react';

import {renderWithProviders} from '@app/test-utils';
import {Avatar} from '@components/avatar';

describe('Avatar', () => {
  it('renders first letter of text in uppercase', () => {
    const {getByText} = renderWithProviders(<Avatar text="john" size={48} />);
    expect(getByText('J')).toBeTruthy();
  });

  it('renders X when no text provided', () => {
    const {getByText} = renderWithProviders(<Avatar text="" size={48} />);
    expect(getByText('X')).toBeTruthy();
  });

  it('renders with custom size', () => {
    const {getByText} = renderWithProviders(<Avatar text="A" size={64} />);
    expect(getByText('A')).toBeTruthy();
  });
});
