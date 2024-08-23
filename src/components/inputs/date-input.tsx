import React, {useState} from 'react';

import DatePicker from 'react-native-date-picker';

import moment from 'moment';

import {Box, Text, useTheme} from '@app/themes';

import {IconButton} from '../button/icon-button';

interface DateInputProps {
  type: 'date' | 'time';
  onDateChange: (date: Date) => void;
  label: string;
  value: Date;
}

export const DateInput = React.memo((props: DateInputProps): JSX.Element => {
  const {colors, borderRadii, spacing, textVariants} = useTheme();
  const {type, onDateChange, label, value} = props;

  const [show, setShow] = useState(false);

  const handelDateChange = (date: Date) => {
    setShow(false);
    onDateChange(date);
  };

  return (
    <Box flex={1}>
      <DatePicker
        modal
        open={show}
        onCancel={() => setShow(false)}
        onConfirm={d => handelDateChange(d)}
        dividerColor={colors.grey}
        mode={type}
        date={value}
        locale="en"
      />
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
