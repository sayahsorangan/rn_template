import React, {useState} from 'react';

import {Alert} from 'react-native';

import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';

import {useAppDispatch} from '@app/hooks/redux';
import {Box, Text, theme} from '@app/themes';
import {FadeInView} from '@components/animations';
import {Button} from '@components/button/Button';
import {Container} from '@components/container';
import {TextInput} from '@components/inputs/text-input';
import {AuthQuery} from '@react-query/query-hooks';
import {user_action} from '@redux-store/slice/user';
import {Navigation} from '@router/navigation-helper';

const LoginScreen = () => {
  const dispatch = useAppDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const loginMutation = AuthQuery.loginByEmail({
    onSuccess: users => {
      const matchedUser = users.find(u => u.email === email.trim());
      if (!matchedUser || matchedUser.password !== password) {
        Alert.alert('Error', 'Invalid email or password');
        return;
      }
      dispatch(user_action.setUser(matchedUser));
      dispatch(user_action.setAuth({isAuthenticated: true}));
      Navigation.reset({name: 'tab'});
    },
    onError: () => {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    },
  });

  const validate = () => {
    let valid = true;
    if (!email.trim()) {
      setEmailError('Email is required');
      valid = false;
    } else {
      setEmailError('');
    }
    if (!password.trim()) {
      setPasswordError('Password is required');
      valid = false;
    } else {
      setPasswordError('');
    }
    return valid;
  };

  const handleLogin = () => {
    if (!validate()) {
      return;
    }
    loginMutation.mutate(email.trim());
  };

  return (
    <Container>
      <KeyboardAwareScrollView
        contentContainerStyle={{flexGrow: 1, justifyContent: 'center', padding: theme.spacing.md}}
        keyboardShouldPersistTaps="handled"
      >
        <FadeInView delay={0} slideFrom="bottom" slideDistance={40}>
          <Box alignItems="center" marginBottom="xl">
            <Text variant="h_2_bold" color="primary_dark">
              Welcome Back
            </Text>
            <Text variant="body_regular" color="grey" marginTop="xs">
              Sign in to continue
            </Text>
          </Box>
        </FadeInView>

        <FadeInView delay={150} slideFrom="bottom" slideDistance={30}>
          <Box marginBottom="md">
            <TextInput
              label="Email"
              placeholder="Enter your email"
              value={email}
              onChangeText={(v: string) => {
                setEmail(v);
                if (emailError) {
                  setEmailError('');
                }
              }}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {!!emailError && (
              <Text variant="body_helper_regular" style={{color: theme.colors.danger}} marginTop="xxs">
                {emailError}
              </Text>
            )}
          </Box>
        </FadeInView>

        <FadeInView delay={300} slideFrom="bottom" slideDistance={30}>
          <Box marginBottom="lg">
            <TextInput
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={(v: string) => {
                setPassword(v);
                if (passwordError) {
                  setPasswordError('');
                }
              }}
              secureTextEntry={!showPassword}
              iconRightName={showPassword ? 'eye' : 'eye-off'}
              onRightIconPress={() => setShowPassword(prev => !prev)}
            />
            {!!passwordError && (
              <Text variant="body_helper_regular" style={{color: theme.colors.danger}} marginTop="xxs">
                {passwordError}
              </Text>
            )}
          </Box>
        </FadeInView>

        <FadeInView delay={450} slideFrom="bottom" slideDistance={20}>
          <Box>
            <Button
              label="Login"
              onPress={handleLogin}
              loading={loginMutation.isLoading}
              disabled={loginMutation.isLoading}
            />
          </Box>
        </FadeInView>
      </KeyboardAwareScrollView>
    </Container>
  );
};

export default LoginScreen;
