import React, {useRef, useState} from 'react';

import {Alert, TextInput as RNTextInput, TouchableOpacity} from 'react-native';

import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';

import {useAppDispatch} from '@app/hooks/redux';
import {Box, Text, useTheme} from '@app/themes';
import {FadeInView} from '@components/animations';
import {Button} from '@components/button/Button';
import {Container} from '@components/container';
import {TextInput} from '@components/inputs/text-input';
import {AuthQueries} from '@react-query/auth/hooks';
import {user_action} from '@redux-store/slice/user';
import {Navigation} from '@router/navigation-helper';

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;

const RegisterScreen = () => {
  const {colors, spacing, borderRadii} = useTheme();
  const dispatch = useAppDispatch();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [fullNameError, setFullNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const emailRef = useRef<RNTextInput>(null);
  const passwordRef = useRef<RNTextInput>(null);
  const confirmRef = useRef<RNTextInput>(null);

  const registerMutation = AuthQueries.useRegister({
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

    // fullName — optional but if provided must be 2–100 chars
    if (fullName.trim() && fullName.trim().length < 2) {
      setFullNameError('Full name must be at least 2 characters');
      valid = false;
    } else if (fullName.trim().length > 100) {
      setFullNameError('Full name must be at most 100 characters');
      valid = false;
    } else {
      setFullNameError('');
    }

    // email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      setEmailError('Email is required');
      valid = false;
    } else if (!emailRegex.test(email.trim())) {
      setEmailError('Please enter a valid email');
      valid = false;
    } else {
      setEmailError('');
    }

    // password
    if (!password) {
      setPasswordError('Password is required');
      valid = false;
    } else if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      valid = false;
    } else if (password.length > 100) {
      setPasswordError('Password must be at most 100 characters');
      valid = false;
    } else if (!PASSWORD_REGEX.test(password)) {
      setPasswordError('Password must contain uppercase, lowercase, and a number');
      valid = false;
    } else {
      setPasswordError('');
    }

    // confirm password
    if (!confirmPassword) {
      setConfirmPasswordError('Please confirm your password');
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
        {/* Title section */}
        <FadeInView delay={0} slideFrom="bottom" slideDistance={30}>
          <Box marginTop="xl" marginBottom="xs">
            <Text variant="h_1_bold" color="black">
              Create account
            </Text>
          </Box>
          <Box marginBottom="lg">
            <Text variant="body_regular" color="grey">
              Fill in your details to get started.
            </Text>
          </Box>
        </FadeInView>

        {/* Full Name input */}
        <FadeInView delay={100} slideFrom="bottom" slideDistance={25}>
          <Box marginBottom="md">
            <TextInput
              placeholder="Full Name (optional)"
              value={fullName}
              onChangeText={(v: string) => {
                setFullName(v);
                if (fullNameError) {
                  setFullNameError('');
                }
              }}
              autoCapitalize="words"
              iconLeftName="user"
              returnKeyType="next"
              onSubmitEditing={() => emailRef.current?.focus()}
            />
            {!!fullNameError && (
              <Text variant="body_helper_regular" style={{color: colors.danger}} marginTop="xxs">
                {fullNameError}
              </Text>
            )}
          </Box>
        </FadeInView>

        {/* Email input */}
        <FadeInView delay={200} slideFrom="bottom" slideDistance={25}>
          <Box marginBottom="md">
            <TextInput
              ref={emailRef}
              placeholder="Email"
              value={email}
              onChangeText={(v: string) => {
                setEmail(v);
                if (emailError) {
                  setEmailError('');
                }
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              iconLeftName="mail"
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
        <FadeInView delay={300} slideFrom="bottom" slideDistance={25}>
          <Box marginBottom="md">
            <TextInput
              ref={passwordRef}
              placeholder="Password"
              value={password}
              onChangeText={(v: string) => {
                setPassword(v);
                if (passwordError) {
                  setPasswordError('');
                }
              }}
              secureTextEntry={!showPassword}
              iconLeftName="lock"
              iconRightName={showPassword ? 'eye' : 'eye-off'}
              onRightIconPress={() => setShowPassword(prev => !prev)}
              returnKeyType="next"
              onSubmitEditing={() => confirmRef.current?.focus()}
            />
            {!!passwordError && (
              <Text variant="body_helper_regular" style={{color: colors.danger}} marginTop="xxs">
                {passwordError}
              </Text>
            )}
          </Box>
        </FadeInView>

        {/* Confirm Password input */}
        <FadeInView delay={400} slideFrom="bottom" slideDistance={25}>
          <Box marginBottom="md">
            <TextInput
              ref={confirmRef}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChangeText={(v: string) => {
                setConfirmPassword(v);
                if (confirmPasswordError) {
                  setConfirmPasswordError('');
                }
              }}
              secureTextEntry={!showConfirm}
              iconLeftName="lock"
              iconRightName={showConfirm ? 'eye' : 'eye-off'}
              onRightIconPress={() => setShowConfirm(prev => !prev)}
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

        {/* Register button */}
        <FadeInView delay={500} slideFrom="bottom" slideDistance={20}>
          <Box marginVertical="md">
            <Button
              label="Create Account"
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
        <FadeInView delay={600} slideFrom="bottom" slideDistance={15}>
          <Box flexDirection="row" justifyContent="center" alignItems="center">
            <Text variant="body_regular" color="grey">
              Already have an account?{'  '}
            </Text>
            <TouchableOpacity onPress={() => Navigation.back()}>
              <Text variant="body_semibold" color="info">
                Sign in
              </Text>
            </TouchableOpacity>
          </Box>
        </FadeInView>
      </KeyboardAwareScrollView>
    </Container>
  );
};

export default RegisterScreen;
