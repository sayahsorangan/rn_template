import React, {useCallback, useMemo} from 'react';

import {ActivityIndicator, FlatList} from 'react-native';

import {useTranslation} from 'react-i18next';

import {useAppDispatch, useAppSelector} from '@app/hooks/redux';
import {Box, Text, useTheme} from '@app/themes';
import {FadeInView} from '@components/animations';
import {Container, STATUSBAR_HEIGHT} from '@components/container';
import {CourseCard} from '@components/course-card';
import {EmptyData} from '@components/empty-data';
import {ICourse} from '@models/API/course';
import {CourseQuery} from '@react-query/query-hooks';
import {favorites_action} from '@redux-store/slice/favorites';
import {Navigation} from '@router/navigation-helper';

const FavoritesScreen = () => {
  const dispatch = useAppDispatch();
  const savedCourseIds = useAppSelector(state => state.FavoritesReducer.savedCourseIds);
  const theme = useTheme();
  const {t} = useTranslation();

  const {data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage} = CourseQuery.getCourses();

  const courses = useMemo(() => data?.pages.flatMap(page => page.data) ?? [], [data]);

  const savedCourses = useMemo(() => {
    if (!courses.length) {
      return [];
    }
    return courses.filter(c => savedCourseIds.includes(c.id));
  }, [courses, savedCourseIds]);

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleToggleFavorite = useCallback(
    (courseId: string) => {
      dispatch(favorites_action.toggleFavorite(courseId));
    },
    [dispatch],
  );

  const handleCoursePress = useCallback((courseId: string) => {
    Navigation.push('courseDetail', {courseId});
  }, []);

  const renderItem = useCallback(
    ({item, index}: {item: ICourse.Course; index: number}) => (
      <CourseCard
        key={index}
        course={item}
        isSaved={true}
        onPress={() => handleCoursePress(item.id)}
        onToggleFavorite={() => handleToggleFavorite(item.id)}
      />
    ),
    [handleCoursePress, handleToggleFavorite],
  );

  return (
    <Container loading={isLoading} translucent>
      <FlatList
        data={savedCourses}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={{paddingBottom: 100}}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListHeaderComponent={
          <FadeInView delay={0} slideFrom="left">
            <Box
              paddingHorizontal="md"
              paddingTop="md"
              paddingBottom="sm"
              style={{paddingTop: STATUSBAR_HEIGHT + theme.spacing.md}}
            >
              <Text variant="h_3_bold">{t('favorites')}</Text>
              <Text variant="body_regular" color="grey" marginTop="xxs">
                {t('saved_courses_count', {count: savedCourses.length})}
              </Text>
            </Box>
          </FadeInView>
        }
        ListEmptyComponent={!isLoading ? <EmptyData text={t('no_saved_courses')} /> : null}
        ListFooterComponent={
          isFetchingNextPage ? (
            <Box paddingVertical="md" alignItems="center">
              <ActivityIndicator size="small" color={theme.colors.primary} />
            </Box>
          ) : null
        }
      />
    </Container>
  );
};

export default FavoritesScreen;
