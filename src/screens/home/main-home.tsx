import React, {useCallback, useMemo, useRef, useState} from 'react';

import {
  Dimensions,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
} from 'react-native';

import {useTranslation} from 'react-i18next';

import {Icons} from '@app/assets/icons';
import {useAppSelector} from '@app/hooks/redux';
import {Box, Text, useTheme} from '@app/themes';
import {FadeInView} from '@components/animations';
import {AppImage} from '@components/app-image';
import {Avatar} from '@components/avatar';
import {BookmarkButton} from '@components/bookmark-button';
import {Button} from '@components/button/Button';
import {CategoryFilter} from '@components/category-filter';
import {Container, STATUSBAR_HEIGHT} from '@components/container';
import {EmptyData} from '@components/empty-data';
import {SearchInput} from '@components/inputs/search-input';
import {ICourse} from '@models/API/course';
import {CourseQuery} from '@react-query/query-hooks';
import {Navigation} from '@router/navigation-helper';

const {width: SCREEN_WIDTH} = Dimensions.get('window');
const FEATURED_CARD_WIDTH = SCREEN_WIDTH * 0.58;

const MainHomeScreen: React.FC = () => {
  const theme = useTheme();
  const {t} = useTranslation();
  const userName = useAppSelector(state => state.UserReducer.user?.fullName);

  const [searchText, setSearchText] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(t('all'));
  const featuredListRef = useRef<FlatList>(null);

  const handleCategorySelect = useCallback((category: string) => {
    setSelectedCategory(category);
    featuredListRef.current?.scrollToOffset({offset: 0, animated: true});
  }, []);

  const {data: courses = [], isLoading, isError, error, refetch, isRefetching} = CourseQuery.getCourses();

  const toggleFavoriteMutation = CourseQuery.toggleFavorite({
    onSuccess: () => {
      refetch();
    },
  });

  const categories = useMemo(() => {
    if (!courses.length) {
      return [];
    }
    return [...new Set(courses.map(c => c.category))];
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

  const featuredCourses = filteredCourses.slice(0, 5);

  const isSearchActive = isSearchFocused || searchText.trim().length > 0;

  const {data: designPages, fetchNextPage, hasNextPage, isFetchingNextPage} = CourseQuery.getCoursesPaginated('Design');

  const designCourses = useMemo(() => designPages?.pages.flatMap(page => page) ?? [], [designPages]);

  const handleToggleFavorite = useCallback(
    (courseId: string) => {
      toggleFavoriteMutation.mutate(courseId);
    },
    [toggleFavoriteMutation],
  );

  const handleScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const {layoutMeasurement, contentOffset, contentSize} = e.nativeEvent;
      const isNearBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 200;
      if (isNearBottom && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage],
  );

  const handleCoursePress = useCallback((courseId: string) => {
    Navigation.navigate('courseDetail', {courseId});
  }, []);

  const renderFeaturedCard = useCallback(
    ({item}: {item: ICourse.Course}) => (
      <TouchableOpacity
        onPress={() => handleCoursePress(item.id)}
        activeOpacity={0.8}
        style={{width: FEATURED_CARD_WIDTH, marginRight: 12}}
      >
        <Box
          backgroundColor="white"
          borderRadius="sm"
          style={{
            shadowColor: theme.colors.black,
            shadowOffset: {width: 0, height: 2},
            shadowOpacity: 0.08,
            shadowRadius: 8,
            elevation: 3,
          }}
        >
          <Box>
            <AppImage
              source={{uri: item.image ?? undefined}}
              style={{
                width: FEATURED_CARD_WIDTH,
                height: 140,
                borderTopLeftRadius: 12,
                borderTopRightRadius: 12,
              }}
              resizeMode="cover"
            />
            {item._count?.favorites ? (
              <Box
                style={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  backgroundColor: 'rgba(0,80,212,0.85)',
                  borderRadius: 12,
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <Icons.Feather name="users" size={10} color={theme.colors.white} />
                <Text variant="body_helper_medium" style={{color: theme.colors.white, marginLeft: 4}}>
                  {item._count.favorites}
                </Text>
              </Box>
            ) : null}
          </Box>

          <Box padding="sm">
            <Box flexDirection="row" alignItems="center" justifyContent="space-between">
              <Box
                paddingHorizontal="xs"
                paddingVertical="xxs"
                borderRadius="xxs"
                style={{backgroundColor: theme.colors.primary_light}}
              >
                <Text variant="body_helper_medium" style={{color: theme.colors.primary}}>
                  {item.category}
                </Text>
              </Box>
              <BookmarkButton isSaved={item.isFavorited} onPress={() => handleToggleFavorite(item.id)} size={18} />
            </Box>

            <Text variant="h_6_bold" numberOfLines={2} marginTop="xs">
              {item.title}
            </Text>

            <Box flexDirection="row" alignItems="center" marginTop="xs">
              <Avatar text={item.createdBy?.fullName || item.author} size={20} />
              <Box marginLeft="xs">
                <Text variant="body_helper_medium" numberOfLines={1}>
                  {item.createdBy?.fullName || item.author}
                </Text>
                <Text variant="body_helper_regular" color="grey" style={{fontSize: 10}}>
                  {t('top_rated_instructor')}
                </Text>
              </Box>
            </Box>

            <Box flexDirection="row" alignItems="center" marginTop="xs">
              <Icons.Feather name="clock" size={11} color={theme.colors.grey} />
              <Text variant="body_helper_regular" color="grey" marginLeft="xxs">
                {item.duration}
              </Text>
              <Box
                style={{
                  width: 3,
                  height: 3,
                  borderRadius: 1.5,
                  backgroundColor: theme.colors.background,
                  marginHorizontal: 6,
                }}
              />
              <Text variant="body_helper_regular" color="grey">
                {item.modules?.length || 0} {t('lessons')}
              </Text>
            </Box>
          </Box>
        </Box>
      </TouchableOpacity>
    ),
    [handleCoursePress, handleToggleFavorite, theme, t],
  );

  const renderPopularItem = useCallback(
    (item: ICourse.Course) => (
      <TouchableOpacity key={item.id} onPress={() => handleCoursePress(item.id)} activeOpacity={0.8}>
        <Box
          flexDirection="row"
          backgroundColor="white"
          marginHorizontal="md"
          marginBottom="sm"
          padding="sm"
          borderRadius="sm"
          style={{
            shadowColor: theme.colors.black,
            shadowOffset: {width: 0, height: 1},
            shadowOpacity: 0.06,
            shadowRadius: 4,
            elevation: 2,
          }}
        >
          <AppImage
            source={{uri: item.image ?? undefined}}
            style={{width: 80, height: 80, borderRadius: 8}}
            resizeMode="cover"
          />
          <Box flex={1} marginLeft="sm" justifyContent="space-between">
            <Box flexDirection="row" alignItems="center" justifyContent="space-between">
              <Box
                paddingHorizontal="xs"
                paddingVertical="xxs"
                borderRadius="xxs"
                style={{backgroundColor: theme.colors.primary_light}}
              >
                <Text variant="body_helper_medium" style={{color: theme.colors.primary, fontSize: 10}}>
                  {item.category}
                </Text>
              </Box>
            </Box>

            <Text variant="body_semibold" numberOfLines={1}>
              {item.title}
            </Text>

            <Box flexDirection="row" alignItems="center">
              <Avatar text={item.createdBy?.fullName || item.author} size={16} />
              <Text variant="body_helper_regular" color="grey" marginLeft="xxs" numberOfLines={1}>
                {item.createdBy?.fullName || item.author}
              </Text>
            </Box>

            <Box flexDirection="row" alignItems="center">
              <Icons.Feather name="clock" size={10} color={theme.colors.grey} />
              <Text variant="body_helper_regular" color="grey" marginLeft="xxs" style={{fontSize: 10}}>
                {item.duration}
              </Text>
              <Box
                style={{
                  width: 3,
                  height: 3,
                  borderRadius: 1.5,
                  backgroundColor: theme.colors.background,
                  marginHorizontal: 4,
                }}
              />
              <Text variant="body_helper_regular" color="grey" style={{fontSize: 10}}>
                {item.modules?.length || 0} {t('lessons')}
              </Text>
            </Box>
          </Box>
        </Box>
      </TouchableOpacity>
    ),
    [handleCoursePress, handleToggleFavorite, theme, t],
  );

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
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{paddingBottom: 100}}
        onScroll={handleScroll}
        scrollEventThrottle={400}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} colors={[theme.colors.primary]} />
        }
      >
        {/* Header */}
        <FadeInView delay={0} slideFrom="left">
          <Box
            paddingHorizontal="md"
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
            style={{paddingTop: STATUSBAR_HEIGHT + 12}}
          >
            <Box flex={1}>
              <Text variant="body_regular" color="grey">
                {t('welcome')}
              </Text>
              <Text variant="h_3_bold">{userName || t('learner')}</Text>
            </Box>
            <Box flexDirection="row" alignItems="center">
              <TouchableOpacity style={{marginRight: 12}}>
                <Icons.Feather name="bell" size={22} color={theme.colors.black} />
              </TouchableOpacity>
              <Avatar text={userName || 'U'} size={40} />
            </Box>
          </Box>
        </FadeInView>

        {/* Search */}
        <FadeInView delay={100} slideFrom="none">
          <Box paddingHorizontal="md" paddingTop="sm" paddingBottom="xs">
            <SearchInput
              value={searchText}
              onChangeText={setSearchText}
              placeholder={t('search_for_courses')}
              iconRightName="arrow-right"
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              containerStyle={{
                backgroundColor: theme.colors.grey_light,
              }}
            />
          </Box>
        </FadeInView>

        {/* Categories */}
        <FadeInView delay={200} slideFrom="right">
          <Box paddingVertical="xs">
            <CategoryFilter
              categories={categories}
              selectedCategory={selectedCategory}
              onSelect={handleCategorySelect}
            />
          </Box>
        </FadeInView>

        {/* Search Results - flat list like design courses */}
        {isSearchActive ? (
          <FadeInView delay={300} slideFrom="none">
            {filteredCourses.length > 0 ? (
              <>
                <Box paddingHorizontal="md" marginTop="sm" marginBottom="sm">
                  <Text variant="h_4_bold">
                    {t('search_results')} ({filteredCourses.length})
                  </Text>
                </Box>
                {filteredCourses.map(item => renderPopularItem(item))}
              </>
            ) : (
              !isLoading && <EmptyData text={t('no_courses_found')} />
            )}
          </FadeInView>
        ) : (
          <>
            {/* Featured Courses - horizontal scroll */}
            {featuredCourses.length > 0 && (
              <FadeInView delay={300} slideFrom="right">
                <FlatList
                  ref={featuredListRef}
                  horizontal
                  data={featuredCourses}
                  keyExtractor={item => item.id}
                  renderItem={renderFeaturedCard}
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{paddingHorizontal: 16, paddingVertical: 8}}
                  snapToInterval={FEATURED_CARD_WIDTH + 12}
                  snapToAlignment="start"
                  decelerationRate="fast"
                />
              </FadeInView>
            )}

            {/* Design Courses */}
            {designCourses.length > 0 && (
              <FadeInView delay={400} slideFrom="none">
                <Box
                  flexDirection="row"
                  justifyContent="space-between"
                  alignItems="center"
                  paddingHorizontal="md"
                  marginTop="md"
                  marginBottom="sm"
                >
                  <Text variant="h_4_bold">{t('popular_courses')}</Text>
                </Box>
                {designCourses.map(item => renderPopularItem(item))}
                {isFetchingNextPage && (
                  <Box alignItems="center" paddingVertical="sm">
                    <Text variant="body_regular" color="grey">
                      {t('loading')}
                    </Text>
                  </Box>
                )}
              </FadeInView>
            )}

            {!isLoading && filteredCourses.length === 0 && <EmptyData text={t('no_courses_found')} />}
          </>
        )}
      </ScrollView>
    </Container>
  );
};

export {MainHomeScreen};
