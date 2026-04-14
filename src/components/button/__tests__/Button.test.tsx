import React from 'react';

import {fireEvent, renderWithProviders} from '@app/test-utils';
import {Button} from '@components/button/Button';

describe('Button', () => {
  it('renders label text', () => {
    const {getByText} = renderWithProviders(<Button label="Submit" onPress={jest.fn()} />);
    expect(getByText('Submit')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    const {getByText} = renderWithProviders(<Button label="Submit" onPress={onPress} />);
    fireEvent.press(getByText('Submit'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not call onPress when disabled', () => {
    const onPress = jest.fn();
    const {getByText} = renderWithProviders(<Button label="Submit" onPress={onPress} disabled />);
    fireEvent.press(getByText('Submit'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('shows loading indicator instead of label when loading', () => {
    const {queryByText} = renderWithProviders(<Button label="Submit" onPress={jest.fn()} loading />);
    expect(queryByText('Submit')).toBeNull();
  });

  it('does not call onPress when loading', () => {
    const onPress = jest.fn();
    const {root} = renderWithProviders(<Button label="Submit" onPress={onPress} loading />);
    fireEvent.press(root);
    expect(onPress).not.toHaveBeenCalled();
  });

  it('renders with secondary style', () => {
    const {getByText} = renderWithProviders(<Button label="Cancel" onPress={jest.fn()} secondary />);
    expect(getByText('Cancel')).toBeTruthy();
  });
});
