import React, {useCallback, useEffect, useLayoutEffect, useRef, useState} from 'react';

import {
  Alert,
  Animated,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  TextInput as RNTextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import {useHeaderHeight} from '@react-navigation/elements';
import {RouteProp, useFocusEffect, useNavigation, useRoute} from '@react-navigation/native';
import Markdown from 'react-native-markdown-display';

import {formatChatTime} from '@app/helpers/app';
import {useAppDispatch, useAppSelector} from '@app/hooks/redux';
import {Box, Text, useTheme} from '@app/themes';
import {IconButton} from '@components/button/icon-button';
import {Container} from '@components/container';
import {
  createRoom,
  deleteMessagesByRoom,
  deleteRoom,
  getMessagesByRoom,
  getRoomById,
  saveMessage,
  updateRoomTitle,
} from '@lib/db/chat-repository';
import {LlamaManager} from '@lib/llm';
import {useChat, useLoadModel} from '@lib/llm/hooks';
import {useRag} from '@lib/rag/hooks';
import {buildRagPrompt} from '@lib/rag/retriever';
import {llm_action, LlmMessage} from '@redux-store/slice/llm';
import {store} from '@redux-store/store';
import {RouteStackNavigation} from '@router/route-name';

import {ModelPickerSheet} from '../../components/model-picker-sheet';

// ---------------------------------------------------------------------------
// TypingIndicator — three bouncing dots shown while the model starts replying
// ---------------------------------------------------------------------------
const TypingIndicator: React.FC<{color: string}> = React.memo(({color}) => {
  const anims = useRef([new Animated.Value(0.3), new Animated.Value(0.3), new Animated.Value(0.3)]).current;

  useEffect(() => {
    const loops = anims.map((anim, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 160),
          Animated.timing(anim, {toValue: 1, duration: 300, useNativeDriver: true}),
          Animated.timing(anim, {toValue: 0.3, duration: 300, useNativeDriver: true}),
          Animated.delay(500),
        ]),
      ),
    );
    loops.forEach(l => l.start());
    return () => loops.forEach(l => l.stop());
  }, [anims]);

  return (
    <View style={{flexDirection: 'row', alignItems: 'center', paddingVertical: 6, paddingHorizontal: 2}}>
      {anims.map((anim, i) => (
        <Animated.View
          key={i}
          style={{
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: color,
            marginHorizontal: 3,
            opacity: anim,
          }}
        />
      ))}
    </View>
  );
});

// ---------------------------------------------------------------------------
// StreamingText — fades in when the bubble first appears, then streams normally
// ---------------------------------------------------------------------------
const StreamingText: React.FC<{content: string; textStyle: object}> = React.memo(({content, textStyle}) => {
  const opacity = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(opacity, {toValue: 1, duration: 250, useNativeDriver: true}).start();
  }, [opacity]);
  return <Animated.Text style={[textStyle, {opacity}]}>{content}</Animated.Text>;
});

// ---------------------------------------------------------------------------

type ChatRouteProp = RouteProp<RouteStackNavigation, 'chat'>;

const ChatScreen: React.FC = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const headerHeight = useHeaderHeight();
  const route = useRoute<ChatRouteProp>();
  const {messages, isGenerating, isModelLoaded, sendMessage, clearChat} = useChat();
  const {loadModel} = useLoadModel();
  const {retrieveChunks} = useRag();
  const isEmbedReady = useAppSelector(state => state.RagReducer.isEmbedModelLoaded);
  const documentCount = useAppSelector(state => state.RagReducer.documentCount);
  const generatingRoomId = useAppSelector(state => state.LlmReducer.generatingRoomId);
  const [input, setInput] = useState('');
  const [showPicker, setShowPicker] = useState(false);
  const [roomTitle, setRoomTitle] = useState('New Chat');
  const flatListRef = useRef<FlatList>(null);

  // SQLite room tracking
  const roomIdRef = useRef<string | null>(null);
  const isFirstExchangeRef = useRef(true);

  // Load existing room messages on mount if roomId param provided
  useEffect(() => {
    const roomId = route.params?.roomId;
    if (roomId) {
      roomIdRef.current = roomId;
      isFirstExchangeRef.current = false;
      const room = getRoomById(roomId);
      if (room) setRoomTitle(room.title);
      const history = getMessagesByRoom(roomId);
      const reduxMsgs: LlmMessage[] = history.map(m => ({
        id: m.id,
        role: m.role,
        content: m.content,
        createdAt: m.createdAt,
      }));
      dispatch(llm_action.setMessages(reduxMsgs));
    } else {
      dispatch(llm_action.clearMessages());
      roomIdRef.current = null;
      isFirstExchangeRef.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reload messages from SQLite when returning to screen.
  // Skip reload if we're actively generating for this room — Redux already has
  // the live streaming data and SQLite doesn't have the assistant reply yet.
  useFocusEffect(
    useCallback(() => {
      const roomId = roomIdRef.current;
      if (!roomId) return;
      if (generatingRoomId === roomId) return;
      const history = getMessagesByRoom(roomId);
      const reduxMsgs: LlmMessage[] = history.map(m => ({
        id: m.id,
        role: m.role,
        content: m.content,
        createdAt: m.createdAt,
      }));
      dispatch(llm_action.setMessages(reduxMsgs));
    }, [dispatch, generatingRoomId]),
  );

  /** Fire-and-forget: ask the model for a short chat title and persist it */
  const generateRoomTitle = useCallback((roomId: string, firstUserMessage: string) => {
    const context = LlamaManager.getContext();
    if (!context) return;
    context
      .completion({
        messages: [
          {
            role: 'system' as const,
            content:
              'You create very short chat titles. Reply with ONLY the title — max 6 words, no quotes, no trailing punctuation.',
          },
          {
            role: 'user' as const,
            content: `Create a short title for a conversation that starts with: "${firstUserMessage.slice(0, 200)}"`,
          },
        ],
        n_predict: 20,
        temperature: 0.5,
      })
      .then((result: any) => {
        const title = (result?.text ?? '')
          .trim()
          .replace(/^["']+|["'.!?,;:]+$/g, '')
          .slice(0, 60);
        if (title) {
          updateRoomTitle(roomId, title);
          setRoomTitle(title);
        }
      })
      .catch(() => {});
  }, []);

  const handleSend = useCallback(async () => {
    if (!input.trim() || isGenerating || !isModelLoaded) return;
    const text = input.trim();
    setInput('');

    // Ensure a room exists for this conversation
    const modelPath = store.getState().LlmReducer.modelPath;
    if (!roomIdRef.current) {
      const room = createRoom(modelPath ?? undefined);
      roomIdRef.current = room.id;
      isFirstExchangeRef.current = true;
    }
    const roomId = roomIdRef.current;
    const isFirst = isFirstExchangeRef.current;
    isFirstExchangeRef.current = false;

    let llmPrompt: string | undefined;
    if (isEmbedReady && documentCount > 0) {
      try {
        const chunks = await retrieveChunks(text, {topK: 4, minScore: 0.3});
        if (chunks.length > 0) {
          llmPrompt = buildRagPrompt(text, chunks);
          console.log('[RAG] augmented prompt built, length:', llmPrompt.length);
        } else {
          console.log('[RAG] no relevant chunks — sending plain message');
        }
      } catch (e) {
        console.warn('[RAG] lookup failed:', (e as Error)?.message ?? e);
      }
    }

    saveMessage(roomId, 'user', text);
    dispatch(llm_action.setGeneratingRoomId(roomId));
    await sendMessage(text, {llmPrompt});

    // Save the final assistant reply to SQLite now that generation is complete.
    const allMsgs = store.getState().LlmReducer.messages;
    const lastMsg = allMsgs[allMsgs.length - 1];
    if (lastMsg?.role === 'assistant' && lastMsg.content) {
      saveMessage(roomId, 'assistant', lastMsg.content);
    }
    dispatch(llm_action.setGeneratingRoomId(null));

    if (isFirst) {
      generateRoomTitle(roomId, text);
    }
  }, [
    dispatch,
    input,
    isGenerating,
    isModelLoaded,
    sendMessage,
    isEmbedReady,
    documentCount,
    retrieveChunks,
    generateRoomTitle,
  ]);

  const handleClearChat = useCallback(() => {
    if (isGenerating) {
      Alert.alert('Cannot Delete', 'Please wait for the current response to finish generating.');
      return;
    }
    const roomId = roomIdRef.current;
    Alert.alert('Delete Chat', 'Are you sure you want to delete this chat? This cannot be undone.', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          if (roomId) {
            deleteMessagesByRoom(roomId);
            deleteRoom(roomId);
          }
          clearChat();
          roomIdRef.current = null;
          isFirstExchangeRef.current = true;
          navigation.goBack();
        },
      },
    ]);
  }, [clearChat, navigation, isGenerating]);

  const assistantTextStyle = {
    color: theme.colors.black,
    fontSize: 14,
    lineHeight: 20,
  };

  const renderAssistantContent = useCallback(
    (item: LlmMessage) => {
      const isItemStreaming = isGenerating && messages.length > 0 && item.id === messages[messages.length - 1]?.id;
      if (isItemStreaming && !item.content) {
        return <TypingIndicator color={theme.colors.grey} />;
      }
      if (isItemStreaming) {
        return <StreamingText content={item.content} textStyle={assistantTextStyle} />;
      }
      return (
        <Markdown
          style={{
            body: assistantTextStyle,
            code_inline: {
              backgroundColor: theme.colors.grey_light,
              borderRadius: 4,
              paddingHorizontal: 4,
            },
            fence: {
              backgroundColor: theme.colors.grey_light,
              borderRadius: 8,
              padding: 8,
            },
          }}
        >
          {item.content || '…'}
        </Markdown>
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isGenerating, messages, theme],
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      title: roomTitle,
      headerRight: () => (
        <Box flexDirection="row">
          <IconButton icon_name="trash-2" icon_color={theme.colors.danger} onPress={handleClearChat} />
        </Box>
      ),
    });
  }, [navigation, handleClearChat, theme.colors.danger, roomTitle]);

  return (
    <Container translucent>
      {/* Model status bar */}
      {!isModelLoaded ? (
        <Box
          paddingHorizontal="md"
          paddingVertical="xs"
          backgroundColor="warning_light"
          flexDirection="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Text variant="body_helper_regular" color="warning_dark" flex={1}>
            No model loaded — go to Profile to select one
          </Text>
          <TouchableOpacity
            onPress={() => {
              if (isGenerating) {
                Alert.alert('Cannot Change Model', 'Please wait for the current response to finish generating.');
              } else {
                setShowPicker(true);
              }
            }}
          >
            <Text variant="body_helper_semibold" color="warning_dark">
              Select
            </Text>
          </TouchableOpacity>
        </Box>
      ) : null}

      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={headerHeight}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          style={{flex: 1}}
          keyExtractor={item => item.id}
          contentContainerStyle={{
            padding: theme.spacing.md,
            paddingBottom: theme.spacing.xl,
            flexGrow: 1,
          }}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({animated: true})}
          ListEmptyComponent={
            <Box flex={1} alignItems="center" justifyContent="center" paddingTop="xxl">
              <Text variant="h_4_medium" color="grey" textAlign="center">
                {isModelLoaded ? 'Start a conversation' : 'Load a model in Profile to begin'}
              </Text>
            </Box>
          }
          renderItem={({item}) => (
            <Box
              alignSelf={item.role === 'user' ? 'flex-end' : 'flex-start'}
              maxWidth="85%"
              marginBottom="sm"
              borderRadius="md"
              paddingHorizontal="md"
              paddingVertical="xs"
              backgroundColor={item.role === 'user' ? 'primary' : 'grey_light'}
            >
              {item.role === 'user' ? (
                <Text variant="body_regular" color="white">
                  {item.content}
                </Text>
              ) : (
                renderAssistantContent(item)
              )}
              <Text
                mb={item.role === 'user' ? undefined : 'sm'}
                mt={'xs'}
                color={item.role === 'user' ? 'white' : 'grey_dark'}
                variant={'body_helper_regular'}
                textAlign={item.role === 'user' ? 'left' : 'right'}
              >
                {item.createdAt ? formatChatTime(item.createdAt) : ''}
              </Text>
            </Box>
          )}
        />

        {/* Input bar */}
        <Box
          flexDirection="row"
          alignItems="flex-end"
          padding="sm"
          borderTopWidth={1}
          style={{borderTopColor: theme.colors.grey_light}}
          backgroundColor="white"
        >
          <Box
            flex={1}
            borderRadius="md"
            backgroundColor="grey_light"
            paddingHorizontal="md"
            paddingVertical="xs"
            marginRight="xs"
            minHeight={40}
            justifyContent="center"
          >
            <RNTextInput
              value={input}
              onChangeText={setInput}
              placeholder={isModelLoaded ? 'Type a message…' : 'Load a model first'}
              placeholderTextColor={theme.colors.grey}
              multiline
              editable={isModelLoaded && !isGenerating}
              style={{
                color: theme.colors.black,
                fontSize: 14,
                lineHeight: 20,
                maxHeight: 120,
                paddingTop: 0,
                paddingBottom: 0,
              }}
            />
          </Box>

          <TouchableOpacity
            onPress={
              isGenerating
                ? () => {
                    dispatch(llm_action.setGeneratingRoomId(null));
                  }
                : handleSend
            }
            disabled={!isGenerating && (!input.trim() || !isModelLoaded)}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor:
                !isGenerating && (!input.trim() || !isModelLoaded) ? theme.colors.grey : theme.colors.primary,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {isGenerating ? (
              <Text style={{fontSize: 24, color: theme.colors.white, fontWeight: 'bold'}}>✕</Text>
            ) : (
              <View
                style={{
                  width: 0,
                  height: 0,
                  borderTopWidth: 8,
                  borderBottomWidth: 8,
                  borderLeftWidth: 14,
                  borderTopColor: 'transparent',
                  borderBottomColor: 'transparent',
                  borderLeftColor: theme.colors.white,
                  marginLeft: 3,
                }}
              />
            )}
          </TouchableOpacity>
        </Box>
      </KeyboardAvoidingView>

      <ModelPickerSheet
        visible={showPicker}
        onClose={() => setShowPicker(false)}
        onSelectModel={async path => {
          setShowPicker(false);
          await loadModel({modelPath: path, nGpuLayers: -1, contextSize: 2048});
        }}
      />
    </Container>
  );
};

export default ChatScreen;
