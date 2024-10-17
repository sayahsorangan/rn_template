import React, {useState} from 'react';

import {TouchableOpacity} from 'react-native';

import {Text} from '@app/themes';
import {Container} from '@components/container';
import {Navigation} from '@router/navigation-helper';

const MainHomeScreen: React.FC = () => {
  const [tap, setTap] = useState(0);

  const handelPress = async (number_tap: number) => {
    setTap(number_tap);
    setTimeout(() => {
      setTap(0);
    }, 1000);
    if (number_tap > 4) {
      Navigation.navigate('settings');
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
