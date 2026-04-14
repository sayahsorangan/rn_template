import React, {useCallback, useMemo, useState} from 'react';

import {ActivityIndicator, FlatList, RefreshControl} from 'react-native';

import {useTranslation} from 'react-i18next';

import {useAppDispatch, useAppSelector} from '@app/hooks/redux';
import {Box, Text, useTheme} from '@app/themes';
import {FadeInView} from '@components/animations';
import {Button} from '@components/button/Button';
import {CategoryFilter} from '@components/category-filter';
import {Container, STATUSBAR_HEIGHT} from '@components/container';
import {CourseCard} from '@components/course-card';
import {EmptyData} from '@components/empty-data';
import {SearchInput} from '@components/inputs/search-input';
import {ICourse} from '@models/API/course';
import {CourseQuery} from '@react-query/query-hooks';
import {favorites_action} from '@redux-store/slice/favorites';
import {Navigation} from '@router/navigation-helper';

const MainHomeScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const {t} = useTranslation();
  const savedCourseIds = useAppSelector(state => state.FavoritesReducer.savedCourseIds);
  const userName = useAppSelector(state => state.UserReducer.user?.name);

  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(t('all'));

  const {data, isLoading, isError, error, refetch, isRefetching, fetchNextPage, hasNextPage, isFetchingNextPage} =
    CourseQuery.getCourses();

  const courses = useMemo(() => data?.pages.flatMap(page => page.data ?? []) ?? [], [data]);

  const categories = useMemo(() => {
    if (!courses.length) {
      return [];
    }
    const cats = [...new Set(courses.map(c => c.category))];
    return cats;
  }, [courses]);

  const filteredCourses = useMemo(() => {
    if (!courses.length) {
      return [];
    }
    let result = courses;
    if (searchText.trim()) {
      const q = searchText.toLowerCase();
      result = result.filter(c => c.title.toLowerCase().includes(q));
    }
    if (selectedCategory !== t('all')) {
      result = result.filter(c => c.category === selectedCategory);
    }
    return result;
  }, [courses, searchText, selectedCategory, t]);

  const handleToggleFavorite = useCallback(
    (courseId: string) => {
      dispatch(favorites_action.toggleFavorite(courseId));
    },
    [dispatch],
  );

  const handleCoursePress = useCallback((courseId: string) => {
    Navigation.push('courseDetail', {courseId});
  }, []);

  const renderCourseItem = useCallback(
    ({item, index: _index}: {item: ICourse.Course; index: number}) => (
      <CourseCard
        course={item}
        isSaved={savedCourseIds.includes(item.id)}
        onPress={() => handleCoursePress(item.id)}
        onToggleFavorite={() => handleToggleFavorite(item.id)}
      />
    ),
    [savedCourseIds, handleCoursePress, handleToggleFavorite],
  );

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isError) {
    return (
      <Container translucent>
        <Box flex={1} justifyContent="center" alignItems="center" padding="md">
          <Text variant="body_medium" color="danger" textAlign="center">
            {error?.message || t('failed_load_courses')}
          </Text>
          <Box marginTop="md">
            <Button label={t('retry')} onPress={() => refetch()} />
          </Box>
        </Box>
      </Container>
    );
  }

  return (
    <Container loading={isLoading} translucent>
      <FlatList
        data={filteredCourses}
        keyExtractor={item => item.id}
        renderItem={renderCourseItem}
        contentContainerStyle={{paddingBottom: 100}}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListHeaderComponent={
          <Box>
            <FadeInView delay={0} slideFrom="left">
              <Box paddingHorizontal="md" paddingTop="md" style={{paddingTop: STATUSBAR_HEIGHT + theme.spacing.md}}>
                <Text variant="h_3_bold">{t('hello_greeting', {name: userName || t('learner')})}</Text>
                <Text variant="body_regular" color="grey" marginTop="xxs">
                  {t('what_to_learn')}
                </Text>
              </Box>
            </FadeInView>
            <FadeInView delay={100} slideFrom="none">
              <Box paddingHorizontal="md" paddingTop="sm" paddingBottom="xs">
                <SearchInput
                  value={searchText}
                  onChangeText={setSearchText}
                  placeholder={t('search_courses')}
                  containerStyle={{
                    backgroundColor: theme.colors.grey_light,
                  }}
                />
              </Box>
            </FadeInView>
            <FadeInView delay={200} slideFrom="right">
              <Box paddingVertical="xs">
                <CategoryFilter
                  categories={categories}
                  selectedCategory={selectedCategory}
                  onSelect={setSelectedCategory}
                />
              </Box>
            </FadeInView>
          </Box>
        }
        ListEmptyComponent={!isLoading ? <EmptyData text={t('no_courses_found')} /> : null}
        ListFooterComponent={
          isFetchingNextPage ? (
            <Box paddingVertical="md" alignItems="center">
              <ActivityIndicator size="small" color={theme.colors.primary} />
            </Box>
          ) : null
        }
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} colors={[theme.colors.primary]} />
        }
      />
    </Container>
  );
};

export {MainHomeScreen};
