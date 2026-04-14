import React from 'react';

import {FlatList, TouchableOpacity} from 'react-native';

import {useTranslation} from 'react-i18next';

import {Box, Text, useTheme} from '@app/themes';

interface CategoryFilterProps {
  categories: string[];
  selectedCategory: string;
  onSelect: (category: string) => void;
}

export const CategoryFilter = React.memo(({categories, selectedCategory, onSelect}: CategoryFilterProps) => {
  const {t} = useTranslation();
  const allCategories = [t('all'), ...categories];
  const {colors, spacing} = useTheme();

  return (
    <FlatList
      horizontal
      showsHorizontalScrollIndicator={false}
      data={allCategories}
      keyExtractor={item => item}
      contentContainerStyle={{paddingHorizontal: spacing.md}}
      renderItem={({item}) => {
        const isSelected = item === selectedCategory;
        return (
          <TouchableOpacity onPress={() => onSelect(item)} activeOpacity={0.7}>
            <Box
              paddingHorizontal="md"
              paddingVertical="xs"
              marginRight="xs"
              borderRadius="xl"
              style={{
                backgroundColor: isSelected ? colors.primary : colors.grey_light,
              }}
            >
              <Text
                variant="body_medium"
                style={{
                  color: isSelected ? colors.white : colors.grey_dark,
                }}
              >
                {item}
              </Text>
            </Box>
          </TouchableOpacity>
        );
      }}
    />
  );
});
