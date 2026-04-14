import React from 'react';

import {Text} from 'react-native';

import {renderWithProviders} from '@app/test-utils';
import {Container} from '@components/container';

describe('Container', () => {
  it('renders children when not loading', () => {
    const {getByText} = renderWithProviders(
      <Container>
        <Text>Hello World</Text>
      </Container>,
    );
    expect(getByText('Hello World')).toBeTruthy();
  });

  it('does not render children when loading', () => {
    const {queryByText} = renderWithProviders(
      <Container loading>
        <Text>Hello World</Text>
      </Container>,
    );
    expect(queryByText('Hello World')).toBeNull();
  });

  it('shows empty data when is_empty is true', () => {
    const {queryByText} = renderWithProviders(
      <Container is_empty>
        <Text>Hello World</Text>
      </Container>,
    );
    expect(queryByText('Hello World')).toBeNull();
  });
});
