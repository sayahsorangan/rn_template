import React, {useCallback, useState} from 'react';

import {ActivityIndicator, Alert, FlatList, TouchableOpacity} from 'react-native';

import {useFocusEffect} from '@react-navigation/native';
import Feather from 'react-native-vector-icons/Feather';

import {TAB_HEIGHT} from '@app/constan/dimensions';
import {formatChatTime} from '@app/helpers/app';
import {useAppSelector} from '@app/hooks/redux';
import {Box, Text, useTheme} from '@app/themes';
import {IconButton} from '@components/button/icon-button';
import {Container} from '@components/container';
import {deleteRoom, getAllRooms, Room} from '@lib/db/chat-repository';
import {Navigation} from '@router/navigation-helper';
import {Route} from '@router/route-name';

const MainHomeScreen: React.FC = () => {
  const theme = useTheme();
  const [rooms, setRooms] = useState<Room[]>([]);
  const generatingRoomId = useAppSelector(state => state.LlmReducer.generatingRoomId);

  const loadRooms = useCallback(() => {
    setRooms(getAllRooms());
  }, []);

  useFocusEffect(loadRooms);

  const handleDelete = useCallback(
    (room: Room) => {
      if (room.id === generatingRoomId) {
        Alert.alert('Cannot Delete', 'This chat is still generating a response. Please wait.');
        return;
      }
      Alert.alert('Delete Chat', `Delete "${room.title}"?`, [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteRoom(room.id);
            loadRooms();
          },
        },
      ]);
    },
    [loadRooms, generatingRoomId],
  );

  return (
    <Container>
      <Text variant="h_5_semibold" paddingHorizontal="md" paddingTop="md">
        Chats
      </Text>

      <FlatList
        data={rooms}
        keyExtractor={item => item.id}
        contentContainerStyle={{
          paddingHorizontal: theme.spacing.md,
          paddingBottom: theme.spacing.xxl,
          flexGrow: 1,
        }}
        ListEmptyComponent={
          <Box flex={1} alignItems="center" justifyContent="center" paddingTop="xxl">
            <Feather name="message-circle" size={48} color={theme.colors.grey_light} />
            <Text variant="h_5_medium" color="grey" marginTop="md">
              No chats yet
            </Text>
            <Text variant="body_helper_regular" color="grey" marginTop="xs" textAlign="center">
              Tap the pencil icon to start a new conversation
            </Text>
          </Box>
        }
        ItemSeparatorComponent={() => <Box height={1} backgroundColor="grey_light" marginLeft="md" />}
        renderItem={({item}) => (
          <TouchableOpacity
            onPress={() => Navigation.navigate(Route.chat, {roomId: item.id})}
            onLongPress={() => handleDelete(item)}
            delayLongPress={500}
          >
            <Box flexDirection="row" alignItems="center" paddingVertical="sm" backgroundColor="white">
              <Box
                width={44}
                height={44}
                borderRadius="round"
                backgroundColor="primary_light"
                alignItems="center"
                justifyContent="center"
                marginRight="sm"
              >
                <Feather name="message-circle" size={20} color={theme.colors.primary} />
              </Box>
              <Box flex={1}>
                <Box flexDirection="row" alignItems="center">
                  <Text variant="body_semibold" numberOfLines={1} flex={1}>
                    {item.title}
                  </Text>
                  {item.id === generatingRoomId ? (
                    <ActivityIndicator size="small" color={theme.colors.primary} style={{marginLeft: 6}} />
                  ) : null}
                </Box>
                {item.id === generatingRoomId ? (
                  <Text variant="body_helper_regular" color="primary" numberOfLines={1}>
                    Generating response…
                  </Text>
                ) : item.modelPath ? (
                  <Text variant="body_helper_regular" color="grey" numberOfLines={1}>
                    {item.modelPath.split('/').pop()}
                  </Text>
                ) : null}
              </Box>
              <Text variant="body_helper_regular" color="grey" marginLeft="sm">
                {formatChatTime(item.updatedAt as any)}
              </Text>
            </Box>
          </TouchableOpacity>
        )}
      />
      <Box position={'absolute'} right={theme.spacing.md} bottom={TAB_HEIGHT + theme.spacing.xl}>
        <IconButton
          onPress={() => Navigation.navigate(Route.chat)}
          icon_name="message-circle"
          icon_color={theme.colors.white}
          style={{
            backgroundColor: theme.colors.primary,
            padding: theme.spacing.sm,
            borderRadius: theme.borderRadii.round,
          }}
        />
      </Box>
    </Container>
  );
};

export {MainHomeScreen};
