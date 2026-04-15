import React from 'react';

import {TouchableOpacity} from 'react-native';

import {Box, Text, useTheme} from '@app/themes';
import {AppImage} from '@components/app-image';
import {BookmarkButton} from '@components/bookmark-button';
import {RatingStars} from '@components/rating-stars';
import {ICourse} from '@models/API/course';

interface CourseCardProps {
  course: ICourse.Course;
  onPress: () => void;
  onToggleFavorite: () => void;
}

export const CourseCard = React.memo(({course, onPress, onToggleFavorite}: CourseCardProps) => {
  const {colors, borderRadii} = useTheme();
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <Box
        backgroundColor="white"
        borderRadius="xs"
        marginHorizontal="md"
        marginBottom="sm"
        style={{
          shadowColor: '#000',
          shadowOffset: {width: 0, height: 2},
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}
      >
        <AppImage
          source={{uri: course.image ?? undefined}}
          style={{
            width: '100%',
            height: 160,
            borderTopLeftRadius: borderRadii.xs,
            borderTopRightRadius: borderRadii.xs,
          }}
          resizeMode="cover"
        />
        <Box padding="sm">
          <Box flexDirection="row" justifyContent="space-between" alignItems="flex-start">
            <Box flex={1} marginRight="xs">
              <Text variant="h_5_bold" numberOfLines={2}>
                {course.title}
              </Text>
            </Box>
            <BookmarkButton isSaved={course.isFavorited} onPress={onToggleFavorite} />
          </Box>

          <Text variant="body_regular" color="grey" numberOfLines={2} marginTop="xxs">
            {course.description}
          </Text>

          <Box flexDirection="row" alignItems="center" marginTop="xs">
            <Box
              paddingHorizontal="xs"
              paddingVertical="xxs"
              borderRadius="xxs"
              style={{backgroundColor: colors.primary_light}}
            >
              <Text variant="body_helper_medium" style={{color: colors.primary_dark}}>
                {course.category}
              </Text>
            </Box>
            <Box marginLeft="xs">
              <Text variant="body_helper_regular" color="grey">
                {course.level}
              </Text>
            </Box>
          </Box>

          <Box flexDirection="row" alignItems="center" justifyContent="space-between" marginTop="xs">
            <Box flexDirection="row" alignItems="center">
              <RatingStars rating={course.rating} size={12} />
              <Text variant="body_helper_medium" color="grey" marginLeft="xxs">
                {course.rating.toFixed(1)}
              </Text>
            </Box>
            <Text variant="body_helper_regular" color="grey">
              {course.author} · {course.duration}
            </Text>
          </Box>
        </Box>
      </Box>
    </TouchableOpacity>
  );
});
