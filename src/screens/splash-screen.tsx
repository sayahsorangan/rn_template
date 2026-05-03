import React, {useEffect, useRef, useState} from 'react';

import {Animated, View} from 'react-native';

import RNFS from 'react-native-fs';

import {initLlama} from 'llama.rn';

import {Images} from '@app/assets/images';
import {SCREEN_WIDTH} from '@app/constan/dimensions';
import {useAppDispatch} from '@app/hooks/redux';
import {Box, Text, useTheme} from '@app/themes';
import {Container} from '@components/container';
import {LlamaManager} from '@lib/llm';
import {downloadAndLoadDefaultEmbedModel, getDefaultEmbedModelPath} from '@lib/rag/embedder';
import {llm_action} from '@redux-store/slice/llm';
import {rag_action} from '@redux-store/slice/rag';
import {store} from '@redux-store/store';
import {Navigation, navigationRef} from '@router/navigation-helper';

const SplashScreen = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();

  const scale = useRef(new Animated.Value(0.3)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;

  const [embedStatus, setEmbedStatus] = useState<'checking' | 'downloading' | 'done'>('checking');
  const [embedProgress, setEmbedProgress] = useState(0);

  const navigate = () => {
    if (!navigationRef.isReady()) return;
    store.subscribe(store.getState);
    const {UserReducer} = store.getState();
    const isAuthenticated = !!UserReducer.auth?.accessToken;
    if (isAuthenticated) {
      Navigation.replace('tab', {screen: 'home'});
    } else {
      Navigation.replace('login');
    }
  };

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, {toValue: 1, useNativeDriver: true, speed: 4, bounciness: 14}),
      Animated.timing(opacity, {toValue: 1, duration: 600, useNativeDriver: true}),
      Animated.timing(rotate, {toValue: 1, duration: 800, useNativeDriver: true}),
    ]).start();

    const init = async () => {
      const startTime = Date.now();
      const embedExists = await RNFS.exists(getDefaultEmbedModelPath());

      if (!embedExists) {
        // First launch — download with visible progress bar
        setEmbedStatus('downloading');
        dispatch(rag_action.setEmbedDownloadStatus('downloading'));
        dispatch(rag_action.setEmbedDownloadProgress(0));

        try {
          await downloadAndLoadDefaultEmbedModel(
            pct => {
              setEmbedProgress(pct);
              dispatch(rag_action.setEmbedDownloadProgress(pct));
            },
            () => {
              dispatch(rag_action.setEmbedDownloadStatus('loading'));
            },
          );
          dispatch(rag_action.setEmbedModelLoaded(true));
          dispatch(rag_action.setEmbedModelPath(getDefaultEmbedModelPath()));
          dispatch(rag_action.setEmbedDownloadStatus('ready'));
        } catch {
          // On error mark error state but still proceed — RAG will just be unavailable
          dispatch(rag_action.setEmbedDownloadStatus('error'));
        }
      } else {
        dispatch(rag_action.setEmbedDownloadStatus('ready'));
      }

      setEmbedStatus('done');

      // ── Auto-restore last chat model ────────────────────────────────────
      const savedModelPath = store.getState().LlmReducer.modelPath;
      if (savedModelPath) {
        const modelExists = await RNFS.exists(savedModelPath);
        if (modelExists) {
          try {
            dispatch(llm_action.setModelLoaded(false));
            await LlamaManager.release();
            const ctx = await initLlama({
              model: savedModelPath,
              n_gpu_layers: -1,
              n_ctx: 2048,
            });
            LlamaManager.setContext(ctx);
            dispatch(llm_action.setModelLoaded(true));
          } catch {
            dispatch(llm_action.setModelLoaded(false));
          }
        } else {
          // File was deleted — clear stale path
          dispatch(llm_action.setModelPath(null));
          dispatch(llm_action.setModelLoaded(false));
        }
      }

      // Ensure the logo animation has had at least 1.5 s to play
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 1500 - elapsed);
      if (remaining > 0) {
        await new Promise<void>(resolve => setTimeout(resolve, remaining));
      }

      navigate();
    };

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const spin = rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['-10deg', '0deg'],
  });

  return (
    <Container translucent backgroundColor={theme.colors.white}>
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <Animated.Image
          source={Images.logo}
          style={{
            width: SCREEN_WIDTH / 2,
            height: SCREEN_WIDTH / 2,
            borderRadius: theme.borderRadii.round,
            opacity,
            transform: [{scale}, {rotate: spin}],
          }}
        />

        {embedStatus === 'downloading' ? (
          <Box position="absolute" style={{bottom: 80}} width={SCREEN_WIDTH * 0.7} alignItems="center">
            <Text variant="body_helper_regular" color="grey" marginBottom="xs">
              Preparing AI features… {embedProgress}%
            </Text>
            <Box
              width={SCREEN_WIDTH * 0.7}
              height={6}
              borderRadius="round"
              backgroundColor="grey_light"
              overflow="hidden"
            >
              <Box height={6} borderRadius="round" backgroundColor="primary" style={{width: `${embedProgress}%`}} />
            </Box>
            <Text variant="body_helper_regular" color="grey" marginTop="xxs">
              ~92 MB · one-time download
            </Text>
          </Box>
        ) : null}
      </View>
    </Container>
  );
};

export default SplashScreen;
