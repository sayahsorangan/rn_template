import React, {useState} from 'react';

import {Alert, TouchableOpacity} from 'react-native';

import {Text} from '@app/themes';
import {Container} from '@components/container';

const MainHomeScreen: React.FC = () => {
  const [tap, setTap] = useState(0);

  const handelPress = async (number_tap: number) => {
    setTap(number_tap);
    setTimeout(() => {
      setTap(0);
    }, 1000);
    if (number_tap > 4) {
      Alert.alert('Congratulations!', 'You have unlocked the secret screen!');
    }
  };

  return (
    <Container>
      <TouchableOpacity
        style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}
        onPress={() => handelPress(tap + 1)}
      >
        <Text variant={'h_3_bold'} fontWeight={'700'}>
          Tap 5x in 1 second
        </Text>
      </TouchableOpacity>
    </Container>
  );
};

export {MainHomeScreen};
