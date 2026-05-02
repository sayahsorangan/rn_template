import React, {useRef, useState} from 'react';

import {Alert, Image, TextInput as RNTextInput, TouchableOpacity} from 'react-native';

import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';

import {Icons} from '@app/assets/icons';
import {Images} from '@app/assets/images';
import {SCREEN_WIDTH} from '@app/constan/dimensions';
import {useAppDispatch} from '@app/hooks/redux';
import {Box, Text, useTheme} from '@app/themes';
import {FadeInView} from '@components/animations';
import {Button} from '@components/button/Button';
import {Container} from '@components/container';
import {TextInput} from '@components/inputs/text-input';
import {AuthQueries} from '@react-query/auth/hooks';
import {user_action} from '@redux-store/slice/user';
import {Navigation} from '@router/navigation-helper';

const SOCIAL_BUTTONS = [
  {key: 'google', label: 'G', bg: '#FFFFFF', color: '#EA4335', borderColor: '#E0E0E0'},
  {key: 'facebook', icon: 'facebook', bg: '#3B5998', color: '#FFFFFF'},
  {key: 'twitter', icon: 'twitter', bg: '#7c858a', color: '#FFFFFF'},
];

const LoginScreen = () => {
  const {colors, spacing, borderRadii, textVariants} = useTheme();
  const dispatch = useAppDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const passwordRef = useRef<RNTextInput>(null);

  const loginMutation = AuthQueries.useSignIn({
    onSuccess: data => {
      dispatch(user_action.setUser(data as any));
      dispatch(
        user_action.setAuth({
          accessToken: data.token,
        }),
      );
      Navigation.reset({name: 'tab'});
    },
    onError: () => {
      Alert.alert('Error', 'Invalid email or password');
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
    loginMutation.mutate({email: email.trim(), password});
  };

  return (
    <Container>
      <KeyboardAwareScrollView
        contentContainerStyle={{flexGrow: 1, padding: spacing.md}}
        keyboardShouldPersistTaps="handled"
      >
        {/* Top image */}
        <FadeInView delay={0} slideFrom="bottom" style={{height: '35%', marginBottom: spacing.lg}} slideDistance={30}>
          <Box alignItems="flex-end" marginBottom="md" flex={1}>
            <Image source={Images.signin} style={{width: SCREEN_WIDTH, height: '100%'}} resizeMode="contain" />
          </Box>
        </FadeInView>

        {/* Title section */}
        <FadeInView delay={100} slideFrom="bottom" slideDistance={30}>
          <Box marginBottom="xs">
            <Text variant="h_1_bold" color="black">
              Let's get something
            </Text>
          </Box>
          <Box marginBottom="lg">
            <Text variant="body_regular" color="grey">
              Good to see you back.
            </Text>
          </Box>
        </FadeInView>

        {/* Social login buttons */}
        <FadeInView delay={200} slideFrom="bottom" slideDistance={25}>
          <Box flexDirection="row" marginBottom="xl" gap="sm">
            {SOCIAL_BUTTONS.map(item => (
              <TouchableOpacity
                key={item.key}
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: borderRadii.round,
                  backgroundColor: item.bg,
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderWidth: item.borderColor ? 1 : 0,
                  borderColor: item.borderColor,
                }}
              >
                {item.icon ? (
                  <Icons.Feather name={item.icon} size={20} color={item.color} />
                ) : (
                  <Text style={{...textVariants.h_4_bold, color: item.color}}>{item.label}</Text>
                )}
              </TouchableOpacity>
            ))}
          </Box>
        </FadeInView>

        {/* Email input */}
        <FadeInView delay={300} slideFrom="bottom" slideDistance={25}>
          <Box marginBottom="md">
            <TextInput
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
        <FadeInView delay={400} slideFrom="bottom" slideDistance={25}>
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
              returnKeyType="go"
              onSubmitEditing={handleLogin}
            />
            {!!passwordError && (
              <Text variant="body_helper_regular" style={{color: colors.danger}} marginTop="xxs">
                {passwordError}
              </Text>
            )}
          </Box>
        </FadeInView>

        {/* Sign In button */}
        <FadeInView delay={600} slideFrom="bottom" slideDistance={20}>
          <Box marginVertical="md">
            <Button
              label="Sign In"
              onPress={handleLogin}
              loading={loginMutation.isLoading}
              disabled={loginMutation.isLoading}
              ButtonStyle={{
                backgroundColor: colors.primary_dark,
                borderColor: colors.primary_dark,
                borderRadius: borderRadii.xs,
              }}
            />
          </Box>
        </FadeInView>

        {/* Sign up link */}
        <FadeInView delay={700} slideFrom="bottom" slideDistance={15}>
          <Box flexDirection="row" justifyContent="center" alignItems="center">
            <Text variant="body_regular" color="grey">
              Don't have account ?{' '}
            </Text>
            <TouchableOpacity>
              <Text variant="body_semibold" color="info">
                Sign up
              </Text>
            </TouchableOpacity>
          </Box>
        </FadeInView>
      </KeyboardAwareScrollView>
    </Container>
  );
};

export default LoginScreen;
