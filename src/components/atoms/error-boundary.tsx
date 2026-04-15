import React from 'react';

import {DevSettings, Pressable} from 'react-native';

import {useTranslation} from 'react-i18next';

import Feather from 'react-native-vector-icons/Feather';

import {Box, Text, theme} from '@app/themes';
import {Container} from '@components/container';

type FallBackProps = {
  error: Error | null;
  onPress?(): void;
};

const FallBack = (props: FallBackProps) => {
  const {t} = useTranslation();
  return (
    <Container>
      <Box flex={1} justifyContent="center" alignItems="center" backgroundColor="white" paddingHorizontal="xl">
        <Box
          width={88}
          height={88}
          borderRadius="round"
          backgroundColor="danger_light"
          justifyContent="center"
          alignItems="center"
          marginBottom="lg"
        >
          <Feather name="alert-triangle" size={48} color={theme.colors.danger_dark} />
        </Box>

        <Text variant="h_3_bold" color="black" marginBottom="xs" testID="display-error">
          {t('oops')}
        </Text>

        <Text variant="h_6_semibold" color="grey_dark" marginBottom="xs">
          {t('error_occurred')}
        </Text>

        <Text variant="body_regular" color="grey" textAlign="center" marginBottom="lg">
          {t('error_unexpected')}
        </Text>

        <Box
          width="100%"
          backgroundColor="warning_light"
          borderRadius="sm"
          padding="md"
          marginBottom="xl"
          borderWidth={1}
          borderColor="warning"
        >
          <Text variant="body_helper_semibold" color="warning_dark" marginBottom="xxs">
            {t('error_detail')}
          </Text>
          <Text variant="body_helper_regular" color="grey_dark" numberOfLines={6}>
            {props.error?.toString()}
          </Text>
        </Box>

        <Pressable
          style={({pressed}) => [
            {
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: theme.colors.primary,
              paddingVertical: theme.spacing.sm,
              paddingHorizontal: theme.spacing.xl,
              borderRadius: theme.borderRadii.sm,
              gap: theme.spacing.xs,
            },
            pressed && {opacity: 0.85},
          ]}
          onPress={props.onPress}
        >
          <Feather name="refresh-cw" size={18} color={theme.colors.white} />
          <Text variant="button_m_semibold" color="white">
            {t('try_again')}
          </Text>
        </Pressable>
      </Box>
    </Container>
  );
};

type State = {hasError: Error | null};

type Props = {
  onError?(error: Error, stack: string): void;
  children?: React.ReactElement;
  FallbackComponent?: React.ComponentType<FallBackProps>;
};

class ErrorBoundary extends React.PureComponent<Props, State> {
  state = {
    hasError: null,
  };

  static getDerivedStateFromError(error: Error): State {
    return {hasError: error};
  }

  componentDidCatch(error: Error, info: {componentStack: string}) {
    if (typeof this.props.onError === 'function') {
      this.props.onError.call(this, error, info.componentStack);
    }
  }

  resetError = () => {
    this.setState({hasError: null});
    DevSettings.reload();
  };

  render() {
    const state = this.state;
    const FallbackComponents = this.props.FallbackComponent || FallBack;
    return this.state.hasError ? (
      <FallbackComponents error={state.hasError} onPress={this.resetError} />
    ) : (
      this.props.children
    );
  }
}

export {ErrorBoundary};
