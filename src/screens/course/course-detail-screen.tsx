import React, {useRef} from 'react';

import {Animated} from 'react-native';

import {useTranslation} from 'react-i18next';

import {useRoute} from '@react-navigation/native';

import {Icons} from '@app/assets/icons';
import {useAppDispatch, useAppSelector} from '@app/hooks/redux';
import {Box, Text, useTheme} from '@app/themes';
import {CommentsSection} from '@components-organisms/comments-section';
import {FadeInView} from '@components/animations';
import {AppImage} from '@components/app-image';
import {BookmarkButton} from '@components/bookmark-button';
import {Container} from '@components/container';
import {Header} from '@components/header';
import {RatingStars} from '@components/rating-stars';
import {CourseQuery} from '@react-query/query-hooks';
import {favorites_action} from '@redux-store/slice/favorites';

const HERO_HEIGHT = 220;

const CourseDetailScreen = () => {
  const route = useRoute<UseRoute<'courseDetail'>>();
  const {courseId} = route.params;
  const theme = useTheme();
  const {t} = useTranslation();
  const dispatch = useAppDispatch();
  const savedCourseIds = useAppSelector(state => state.FavoritesReducer.savedCourseIds);
  const isSaved = savedCourseIds.includes(courseId);
  const scrollY = useRef(new Animated.Value(0)).current;

  const {data: course, isLoading} = CourseQuery.getCourseDetail(courseId);

  const handleToggleFavorite = () => {
    dispatch(favorites_action.toggleFavorite(courseId));
  };

  const imageTranslateY = scrollY.interpolate({
    inputRange: [-HERO_HEIGHT, 0, HERO_HEIGHT],
    outputRange: [-HERO_HEIGHT / 2, 0, HERO_HEIGHT * 0.4],
    extrapolate: 'clamp',
  });

  const imageScale = scrollY.interpolate({
    inputRange: [-HERO_HEIGHT, 0],
    outputRange: [2, 1],
    extrapolateRight: 'clamp',
  });

  const imageOpacity = scrollY.interpolate({
    inputRange: [0, HERO_HEIGHT * 0.8],
    outputRange: [1, 0.3],
    extrapolate: 'clamp',
  });

  return (
    <Container loading={isLoading} translucent>
      <Header
        title={course?.title || t('course_detail')}
        rightComponent={<BookmarkButton isSaved={isSaved} onPress={handleToggleFavorite} size={24} />}
      />
      {course && (
        <Animated.ScrollView
          contentContainerStyle={{paddingBottom: 100}}
          onScroll={Animated.event([{nativeEvent: {contentOffset: {y: scrollY}}}], {useNativeDriver: true})}
          scrollEventThrottle={16}
        >
          <Animated.View
            style={{
              height: HERO_HEIGHT,
              overflow: 'hidden',
              transform: [{translateY: imageTranslateY}, {scale: imageScale}],
              opacity: imageOpacity,
            }}
          >
            <AppImage source={{uri: course.image}} style={{width: '100%', height: HERO_HEIGHT}} resizeMode="cover" />
          </Animated.View>

          <Box padding="md">
            <FadeInView delay={100} slideFrom="bottom">
              <Text variant="h_3_bold">{course.title}</Text>

              <Box flexDirection="row" alignItems="center" marginTop="sm">
                <Icons.Feather name="user" size={14} color={theme.colors.grey} />
                <Text variant="body_medium" color="grey" marginLeft="xxs">
                  {course.author}
                </Text>
              </Box>
            </FadeInView>

            <FadeInView delay={200} slideFrom="bottom">
              <Box flexDirection="row" alignItems="center" marginTop="xs" flexWrap="wrap">
                <Box
                  paddingHorizontal="xs"
                  paddingVertical="xxs"
                  borderRadius="xxs"
                  style={{backgroundColor: theme.colors.primary_light}}
                  marginRight="xs"
                >
                  <Text variant="body_helper_medium" style={{color: theme.colors.primary_dark}}>
                    {course.category}
                  </Text>
                </Box>
                <Box
                  paddingHorizontal="xs"
                  paddingVertical="xxs"
                  borderRadius="xxs"
                  style={{backgroundColor: theme.colors.secondary_light}}
                  marginRight="xs"
                >
                  <Text variant="body_helper_medium" style={{color: theme.colors.secondary_dark}}>
                    {course.level}
                  </Text>
                </Box>
                <Box flexDirection="row" alignItems="center" marginRight="xs">
                  <Icons.Feather name="clock" size={14} color={theme.colors.grey} />
                  <Text variant="body_helper_medium" color="grey" marginLeft="xxs">
                    {course.duration}
                  </Text>
                </Box>
              </Box>
            </FadeInView>

            <FadeInView delay={300} slideFrom="bottom">
              <Box flexDirection="row" alignItems="center" marginTop="sm">
                <RatingStars rating={course.rating} />
                <Text variant="body_medium" color="grey_dark" marginLeft="xs">
                  {course.rating.toFixed(1)}
                </Text>
              </Box>
            </FadeInView>

            <FadeInView delay={400} slideFrom="bottom">
              <Box marginTop="md">
                <Text variant="h_5_bold" marginBottom="xs">
                  {t('description')}
                </Text>
                <Text variant="body_regular" color="grey_dark">
                  {course.description}
                </Text>
              </Box>
            </FadeInView>

            <FadeInView delay={500} slideFrom="bottom">
              <Box marginTop="md">
                <Text variant="h_5_bold" marginBottom="xs">
                  {t('content')}
                </Text>
                <Text variant="body_regular" color="grey_dark">
                  {course.content}
                </Text>
              </Box>
            </FadeInView>
          </Box>

          <FadeInView delay={600} slideFrom="bottom">
            <CommentsSection courseId={courseId} />
          </FadeInView>
        </Animated.ScrollView>
      )}
    </Container>
  );
};

export default CourseDetailScreen;
