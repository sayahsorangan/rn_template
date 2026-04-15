import React, {useCallback} from 'react';

import {FlatList, RefreshControl} from 'react-native';

import {useTranslation} from 'react-i18next';

import {useFocusEffect} from '@react-navigation/native';

import {Box, Text, useTheme} from '@app/themes';
import {FadeInView} from '@components/animations';
import {Container, STATUSBAR_HEIGHT} from '@components/container';
import {CourseCard} from '@components/course-card';
import {EmptyData} from '@components/empty-data';
import {ICourse} from '@models/API/course';
import {CourseQuery} from '@react-query/query-hooks';
import {Navigation} from '@router/navigation-helper';

const FavoritesScreen = () => {
  const theme = useTheme();
  const {t} = useTranslation();

  const {data: favorites = [], isLoading, refetch, isRefetching} = CourseQuery.getFavorites();

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  const toggleFavoriteMutation = CourseQuery.toggleFavorite({
    onSuccess: () => {
      refetch();
    },
  });

  const handleToggleFavorite = useCallback(
    (courseId: string) => {
      toggleFavoriteMutation.mutate(courseId);
    },
    [toggleFavoriteMutation],
  );

  const handleCoursePress = useCallback((courseId: string) => {
    Navigation.navigate('courseDetail', {courseId});
  }, []);

  const renderItem = useCallback(
    ({item}: {item: ICourse.Course}) => (
      <CourseCard
        course={item}
        onPress={() => handleCoursePress(item.id)}
        onToggleFavorite={() => handleToggleFavorite(item.id)}
      />
    ),
    [handleCoursePress, handleToggleFavorite],
  );

  return (
    <Container loading={isLoading} translucent>
      <FlatList
        data={favorites}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={{paddingBottom: 100}}
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
                {t('saved_courses_count', {count: favorites.length})}
              </Text>
            </Box>
          </FadeInView>
        }
        ListEmptyComponent={!isLoading ? <EmptyData text={t('no_saved_courses')} /> : null}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} colors={[theme.colors.primary]} />
        }
      />
    </Container>
  );
};

export default FavoritesScreen;
