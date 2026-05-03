import React, {useState} from 'react';

import {Platform, TouchableOpacity} from 'react-native';

import DateTimePicker, {DateTimePickerEvent} from '@react-native-community/datetimepicker';

import moment from 'moment';

import {Box, Text, useTheme} from '@app/themes';
import {Modal} from '@components/modal';

import {IconButton} from '../button/icon-button';

interface DateInputProps {
  type: 'date' | 'time';
  onDateChange: (date: Date) => void;
  label: string;
  value: Date;
}

export const DateInput = React.memo((props: DateInputProps) => {
  const {colors, borderRadii, spacing, textVariants} = useTheme();
  const {type, onDateChange, label, value} = props;

  const [show, setShow] = useState(false);
  const [tempDate, setTempDate] = useState(value);

  const handleChange = (event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === 'android') {
      setShow(false);
      if (event.type === 'set' && date) {
        onDateChange(date);
      }
    } else {
      if (date) setTempDate(date);
    }
  };

  const handleConfirm = () => {
    setShow(false);
    onDateChange(tempDate);
  };

  return (
    <Box flex={1}>
      {/* Android — inline picker shown as system dialog */}
      {show && Platform.OS === 'android' && <DateTimePicker value={value} mode={type} onChange={handleChange} />}

      {/* iOS — bottom sheet modal with spinner + confirm */}
      {Platform.OS === 'ios' && (
        <Modal show={show} onDissmiss={() => setShow(false)} animationType="slide">
          <Box backgroundColor="white" borderTopLeftRadius="lg" borderTopRightRadius="lg" padding="md">
            <Box flexDirection="row" justifyContent="space-between" alignItems="center" marginBottom="sm">
              <TouchableOpacity onPress={() => setShow(false)}>
                <Text variant="body_regular" color="danger">
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleConfirm}>
                <Text variant="body_semibold" color="primary">
                  Done
                </Text>
              </TouchableOpacity>
            </Box>
            <DateTimePicker
              value={tempDate}
              mode={type}
              display="spinner"
              onChange={handleChange}
              style={{backgroundColor: colors.white}}
            />
          </Box>
        </Modal>
      )}

      {!!label && (
        <Text variant={'body_regular'} mb={'xs'}>
          {label}
        </Text>
      )}
      <IconButton
        onPress={() => setShow(true)}
        LabelStyle={{
          ...textVariants.body_regular,
          color: colors.black,
          flex: 1,
        }}
        ButtonStyle={{
          flex: 1,
          borderWidth: 1,
          borderColor: colors.grey_light,
          borderRadius: borderRadii.sm,
          paddingHorizontal: spacing.md,
          height: 48,
        }}
        label={type == 'date' ? moment(value).format('DD MMMM YYYY') : moment(value).format('hh:mm A')}
        icon_name={type == 'date' ? 'calendar' : 'clock'}
        icon_color={colors.primary}
        icon_size={16}
        left_icon={false}
      />
    </Box>
  );
});
