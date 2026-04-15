import React, {useRef, useState} from 'react';

import {Alert, TextInput as RNTextInput, TouchableOpacity} from 'react-native';

import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';

import {Icons} from '@app/assets/icons';
import {useAppDispatch} from '@app/hooks/redux';
import {Box, Text, useTheme} from '@app/themes';
import {FadeInView} from '@components/animations';
import {Button} from '@components/button/Button';
import {Container} from '@components/container';
import {TextInput} from '@components/inputs/text-input';
import {AuthQuery} from '@react-query/query-hooks';
import {user_action} from '@redux-store/slice/user';
import {Navigation} from '@router/navigation-helper';
import {Route} from '@router/route-name';

const RegisterScreen = () => {
  const {colors, spacing, borderRadii} = useTheme();
  const dispatch = useAppDispatch();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const emailRef = useRef<RNTextInput>(null);
  const passwordRef = useRef<RNTextInput>(null);
  const confirmPasswordRef = useRef<RNTextInput>(null);

  const registerMutation = AuthQuery.register({
    onSuccess: data => {
      dispatch(user_action.setUser(data.user));
      dispatch(
        user_action.setAuth({
          accessToken: data.session.accessToken,
          refreshToken: data.session.refreshToken,
          expiresIn: data.session.expiresIn,
        }),
      );
      Navigation.reset({name: 'tab'});
    },
    onError: () => {
      Alert.alert('Error', 'Registration failed. Please try again.');
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
    } else if (password.length < 8) {
      setPasswordError('Min. 8 characters with uppercase, lowercase & number');
      valid = false;
    } else {
      setPasswordError('');
    }
    if (!confirmPassword.trim()) {
      setConfirmPasswordError('Confirm password is required');
      valid = false;
    } else if (confirmPassword !== password) {
      setConfirmPasswordError('Passwords do not match');
      valid = false;
    } else {
      setConfirmPasswordError('');
    }
    return valid;
  };

  const handleRegister = () => {
    if (!validate()) {
      return;
    }
    registerMutation.mutate({
      email: email.trim(),
      password,
      fullName: fullName.trim() || undefined,
    });
  };

  return (
    <Container>
      <KeyboardAwareScrollView
        contentContainerStyle={{flexGrow: 1, padding: spacing.md}}
        keyboardShouldPersistTaps="handled"
      >
        {/* Back button */}
        <FadeInView delay={0} slideFrom="left" slideDistance={20}>
          <TouchableOpacity onPress={() => Navigation.back()} style={{marginBottom: spacing.sm}}>
            <Icons.Feather name="arrow-left" size={24} color={colors.black} />
          </TouchableOpacity>
        </FadeInView>

        {/* Title section */}
        <FadeInView delay={100} slideFrom="bottom" slideDistance={30}>
          <Box marginTop="md" marginBottom="xs">
            <Text variant="h_1_bold" color="black">
              Create Account
            </Text>
          </Box>
          <Box marginBottom="xl">
            <Text variant="body_regular" color="grey">
              Sign up to get started
            </Text>
          </Box>
        </FadeInView>

        {/* Full Name input (optional) */}
        <FadeInView delay={200} slideFrom="bottom" slideDistance={25}>
          <Box marginBottom="md">
            <Box flexDirection="row" marginBottom="xs">
              <Text variant="body_medium" color="black">
                Full Name{' '}
              </Text>
              <Text variant="body_regular" color="grey">
                (optional)
              </Text>
            </Box>
            <TextInput
              placeholder="John Doe"
              value={fullName}
              onChangeText={(v: string) => setFullName(v)}
              autoCapitalize="words"
              returnKeyType="next"
              onSubmitEditing={() => emailRef.current?.focus()}
            />
          </Box>
        </FadeInView>

        {/* Email input */}
        <FadeInView delay={300} slideFrom="bottom" slideDistance={25}>
          <Box marginBottom="md">
            <TextInput
              ref={emailRef}
              label="Email Address"
              placeholder="your.email@example.com"
              value={email}
              onChangeText={(v: string) => {
                setEmail(v);
                if (emailError) {
                  setEmailError('');
                }
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              returnKeyType="next"
              onSubmitEditing={() => passwordRef.current?.focus()}
            />
            {!!emailError && (
              <Text variant="body_helper_regular" style={{color: colors.danger}} marginTop="xxs">
                {emailError}
              </Text>
            )}
          </Box>
        </FadeInView>

        {/* Password input */}
        <FadeInView delay={400} slideFrom="bottom" slideDistance={25}>
          <Box marginBottom="md">
            <TextInput
              ref={passwordRef}
              label="Password"
              placeholder="Min. 8 characters with uppercase, lowercase & number"
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
              returnKeyType="next"
              onSubmitEditing={() => confirmPasswordRef.current?.focus()}
            />
            {!!passwordError && (
              <Text variant="body_helper_regular" style={{color: colors.danger}} marginTop="xxs">
                {passwordError}
              </Text>
            )}
          </Box>
        </FadeInView>

        {/* Confirm Password input */}
        <FadeInView delay={500} slideFrom="bottom" slideDistance={25}>
          <Box marginBottom="lg">
            <TextInput
              ref={confirmPasswordRef}
              label="Confirm Password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChangeText={(v: string) => {
                setConfirmPassword(v);
                if (confirmPasswordError) {
                  setConfirmPasswordError('');
                }
              }}
              secureTextEntry={!showConfirmPassword}
              iconRightName={showConfirmPassword ? 'eye' : 'eye-off'}
              onRightIconPress={() => setShowConfirmPassword(prev => !prev)}
              returnKeyType="go"
              onSubmitEditing={handleRegister}
            />
            {!!confirmPasswordError && (
              <Text variant="body_helper_regular" style={{color: colors.danger}} marginTop="xxs">
                {confirmPasswordError}
              </Text>
            )}
          </Box>
        </FadeInView>

        {/* Sign Up button */}
        <FadeInView delay={600} slideFrom="bottom" slideDistance={20}>
          <Box marginBottom="md">
            <Button
              label="Sign Up"
              onPress={handleRegister}
              loading={registerMutation.isLoading}
              disabled={registerMutation.isLoading}
              ButtonStyle={{
                backgroundColor: colors.primary_dark,
                borderColor: colors.primary_dark,
                borderRadius: borderRadii.xs,
              }}
            />
          </Box>
        </FadeInView>

        {/* Sign in link */}
        <FadeInView delay={700} slideFrom="bottom" slideDistance={15}>
          <Box flexDirection="row" justifyContent="center" alignItems="center">
            <Text variant="body_regular" color="grey">
              Already have an account?{' '}
            </Text>
            <TouchableOpacity onPress={() => Navigation.navigate(Route.login)}>
              <Text variant="body_semibold" color="info">
                Sign In
              </Text>
            </TouchableOpacity>
          </Box>
        </FadeInView>
      </KeyboardAwareScrollView>
    </Container>
  );
};

export default RegisterScreen;
