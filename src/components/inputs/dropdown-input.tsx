import React, {useState} from 'react';

import {Platform, ScrollView, TouchableOpacity} from 'react-native';

import {useTranslation} from 'react-i18next';

import {Icons} from '@app/assets/icons';
import {Box, Text, useTheme} from '@app/themes';
import {IconButton} from '@components/button/icon-button';
import {STATUSBAR_HEIGHT} from '@components/container';
import {Modal} from '@components/modal';

interface DropdrownInputProps {
  label: string;
  items: any[];
  onChangeValue: (value: any) => void;
  value: string[];
  multy?: boolean;
}

export const DropdrownInput = React.memo((props: DropdrownInputProps) => {
  const {label, onChangeValue, items, value, multy = false} = props;
  const {textVariants, colors, borderRadii, spacing} = useTheme();
  const {t} = useTranslation();
  const [open, setOpen] = useState(false);

  const onSelectItem = (item: string) => {
    if (!multy) {
      setOpen(false);
    }
    onChangeValue(item);
  };

  return (
    <Box>
      <Modal show={open}>
        <Box flex={1} width={'100%'} backgroundColor={'white'}>
          <Box
            flexDirection={'row'}
            borderBottomWidth={1}
            padding={'md'}
            borderBottomColor={'grey_light'}
            alignItems={'center'}
            style={{paddingTop: Platform.OS == 'ios' ? STATUSBAR_HEIGHT + spacing.md : spacing.md}}
          >
            <Box flex={1}>
              <Text variant={'h_6_medium'}>{label}</Text>
            </Box>
            <IconButton onPress={() => setOpen(false)} icon_size={24} icon_name="x" icon_color={colors.black} />
          </Box>
          <ScrollView>
            {items.map((item, index) => {
              const is_active = value?.includes(item?.value);
              return (
                <TouchableOpacity key={index} onPress={() => onSelectItem(item.value)}>
                  <Box
                    padding={'md'}
                    flexDirection={'row'}
                    alignItems={'center'}
                    backgroundColor={is_active ? 'primary_light' : 'white'}
                    borderBottomWidth={1}
                    borderColor={'grey_light'}
                  >
                    <Box flex={1} marginRight={'xs'}>
                      <Text variant={'body_medium'}>{item?.label}</Text>
                    </Box>
                    <Icons.Feather name="check" size={20} color={is_active ? colors.primary : colors.white} />
                  </Box>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </Box>
      </Modal>
      {!!label && (
        <Text variant={'body_helper_medium'} mb={'xs'}>
          {label}
        </Text>
      )}
      <IconButton
        onPress={() => setOpen(true)}
        LabelStyle={{
          ...textVariants.body_medium,
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
        label={
          value?.length < 1
            ? t('select')
            : value?.length == 1
            ? items.find(i => i.value == value[0])?.label
            : t('item_selected', {count: value?.length})
        }
        icon_name={'chevron-down'}
        icon_color={colors.primary}
        icon_size={16}
        left_icon={false}
      />
    </Box>
  );
});
