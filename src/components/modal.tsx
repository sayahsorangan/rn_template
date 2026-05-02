import React from 'react';

import {Modal as RNModal, StyleProp, TouchableWithoutFeedback, View, ViewStyle} from 'react-native';

export interface ModalProps {
  show: boolean;
  opacity?: number;
  children: React.ReactElement;
  overlayStyle?: StyleProp<ViewStyle>;
  onDissmiss?: (status: false) => void;
  style?: StyleProp<ViewStyle>;
  animationType?: 'none' | 'slide' | 'fade' | undefined;
}

export const Modal = ({
  show,
  children,
  opacity = 0.4,
  overlayStyle,
  onDissmiss,
  style,
  animationType = 'slide',
}: ModalProps) => {
  return (
    <RNModal animationType={animationType} visible={show} transparent={true}>
      <View
        style={[
          {
            width: '100%',
            height: '100%',
            position: 'absolute',
            zIndex: 2,
            justifyContent: 'center',
            alignItems: 'center',
          },
          style,
        ]}
      >
        <TouchableWithoutFeedback onPress={() => (onDissmiss ? onDissmiss(false) : null)}>
          <View
            style={{
              position: 'absolute',
              height: '100%',
              width: '100%',
            }}
          />
        </TouchableWithoutFeedback>
        {children}
      </View>
      {/* overlay */}
      <View style={[{flex: 1, backgroundColor: 'black'}, overlayStyle]} {...{opacity}} />
    </RNModal>
  );
};
