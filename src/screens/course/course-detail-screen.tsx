import React, {useRef, useState} from 'react';

import {Animated, NativeScrollEvent, NativeSyntheticEvent, TouchableOpacity} from 'react-native';

import {useTranslation} from 'react-i18next';

import {useRoute} from '@react-navigation/native';

import {Icons} from '@app/assets/icons';
import {Box, Text, useTheme} from '@app/themes';
import {CommentsSection} from '@components-organisms/comments-section';
import {FadeInView} from '@components/animations';
import {AppImage} from '@components/app-image';
import {Avatar} from '@components/avatar';
import {Container, STATUSBAR_HEIGHT} from '@components/container';
import {RatingStars} from '@components/rating-stars';
import {CourseQuery} from '@react-query/query-hooks';
import {Navigation} from '@router/navigation-helper';

const HERO_HEIGHT = 260;

type TabType = 'outline' | 'reviews';

const CourseDetailScreen = () => {
  const route = useRoute<UseRoute<'courseDetail'>>();
  const {courseId} = route.params;
  const theme = useTheme();
  const {t} = useTranslation();
  const scrollY = useRef(new Animated.Value(0)).current;
  const [activeTab, setActiveTab] = useState<TabType>('outline');
  const [headerSolid, setHeaderSolid] = useState(false);

  const {data: course, isLoading, refetch} = CourseQuery.getCourseDetail(courseId);

  const toggleFavoriteMutation = CourseQuery.toggleFavorite({
    onSuccess: () => {
      refetch();
    },
  });

  const handleToggleFavorite = () => {
    toggleFavoriteMutation.mutate(courseId);
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

  const sortedModules = course?.modules?.slice().sort((a, b) => a.orderIndex - b.orderIndex) ?? [];

  const HEADER_THRESHOLD = HERO_HEIGHT - STATUSBAR_HEIGHT - 56;

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = event.nativeEvent.contentOffset.y;
    setHeaderSolid(y > HEADER_THRESHOLD);
  };

  return (
    <Container loading={isLoading} translucent>
      {/* Floating header */}
      <Box
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 10,
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingBottom: 8,
          paddingTop: STATUSBAR_HEIGHT + 8,
          backgroundColor: headerSolid ? theme.colors.white : 'transparent',
          borderBottomWidth: headerSolid ? 1 : 0,
          borderBottomColor: theme.colors.grey_light,
        }}
        pointerEvents="box-none"
      >
        <TouchableOpacity
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: headerSolid ? theme.colors.grey_light : 'rgba(0,0,0,0.35)',
          }}
          onPress={() => Navigation.back()}
        >
          <Icons.Feather name="chevron-left" size={22} color={headerSolid ? theme.colors.black : '#fff'} />
        </TouchableOpacity>
        {headerSolid && (
          <Box flex={1} marginHorizontal="sm">
            <Text variant="body_leading_semibold" color="black" numberOfLines={1}>
              {course?.title ?? ''}
            </Text>
          </Box>
        )}
        {!headerSolid && <Box flex={1} />}
        <TouchableOpacity
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: headerSolid ? theme.colors.grey_light : 'rgba(0,0,0,0.35)',
          }}
          onPress={handleToggleFavorite}
        >
          <Icons.Feather
            name="heart"
            size={20}
            color={course?.isFavorited ? theme.colors.danger : headerSolid ? theme.colors.black : '#fff'}
          />
        </TouchableOpacity>
      </Box>

      {course && (
        <Animated.ScrollView
          contentContainerStyle={{paddingBottom: 100}}
          onScroll={Animated.event([{nativeEvent: {contentOffset: {y: scrollY}}}], {
            useNativeDriver: true,
            listener: handleScroll,
          })}
          scrollEventThrottle={16}
        >
          {/* Hero Image */}
          <Animated.View
            style={{
              height: HERO_HEIGHT,
              overflow: 'hidden',
              transform: [{translateY: imageTranslateY}, {scale: imageScale}],
              opacity: imageOpacity,
            }}
          >
            <AppImage
              source={{uri: course.image ?? undefined}}
              style={{width: '100%', height: HERO_HEIGHT}}
              resizeMode="cover"
            />
          </Animated.View>

          <Box padding="md" style={{backgroundColor: theme.colors.white}}>
            {/* Title */}
            <FadeInView delay={150} slideFrom="bottom">
              <Text variant="h_3_bold" marginTop="sm">
                {course.title}
              </Text>
            </FadeInView>

            {/* Rating + Meta */}
            <FadeInView delay={200} slideFrom="bottom">
              <Box flexDirection="row" alignItems="center" marginTop="sm" flexWrap="wrap">
                <RatingStars rating={course.rating} size={12} />
                <Text variant="body_helper_medium" color="grey_dark" marginLeft="xxs">
                  {course.rating.toFixed(1)}
                </Text>
                {course._count && (
                  <Text variant="body_helper_regular" color="grey" marginLeft="xxs">
                    ({course._count.favorites})
                  </Text>
                )}
                <Box style={{width: 4, height: 4, borderRadius: 2, backgroundColor: '#B0B0B0'}} marginHorizontal="xs" />
                <Icons.Feather name="clock" size={12} color={theme.colors.grey} />
                <Text variant="body_helper_medium" color="grey" marginLeft="xxs">
                  {course.duration}
                </Text>
                <Box style={{width: 4, height: 4, borderRadius: 2, backgroundColor: '#B0B0B0'}} marginHorizontal="xs" />
                <Text variant="body_helper_medium" color="grey">
                  {sortedModules.length} {t('modules').toLowerCase()}
                </Text>
              </Box>
            </FadeInView>

            {/* Description */}
            <FadeInView delay={250} slideFrom="bottom">
              <Text variant="body_regular" color="grey_dark" marginTop="sm" numberOfLines={3}>
                {course.description}
              </Text>
            </FadeInView>

            {/* Author */}
            <FadeInView delay={300} slideFrom="bottom">
              <Box flexDirection="row" alignItems="center" marginTop="md">
                <Avatar text={course.createdBy?.fullName ?? course.author} size={36} />
                <Box marginLeft="sm">
                  <Text variant="body_medium">{course.author}</Text>
                  <Text variant="body_helper_regular" color="grey">
                    {course.level}
                  </Text>
                </Box>
              </Box>
            </FadeInView>

            {/* Tab Bar */}
            <FadeInView delay={350} slideFrom="bottom">
              <Box flexDirection="row" marginTop="lg">
                <TouchableOpacity
                  onPress={() => setActiveTab('outline')}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 10,
                    borderRadius: 20,
                    borderWidth: 1,
                    borderColor: activeTab === 'outline' ? theme.colors.primary : '#DAD8E9',
                    backgroundColor: activeTab === 'outline' ? theme.colors.primary : 'transparent',
                  }}
                >
                  <Text
                    variant="body_medium"
                    style={{color: activeTab === 'outline' ? '#fff' : theme.colors.grey_dark}}
                  >
                    {t('course_outline')}
                  </Text>
                </TouchableOpacity>
                <Box width={8} />
                <TouchableOpacity
                  onPress={() => setActiveTab('reviews')}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 10,
                    borderRadius: 20,
                    borderWidth: 1,
                    borderColor: activeTab === 'reviews' ? theme.colors.primary : '#DAD8E9',
                    backgroundColor: activeTab === 'reviews' ? theme.colors.primary : 'transparent',
                  }}
                >
                  <Text
                    variant="body_medium"
                    style={{color: activeTab === 'reviews' ? '#fff' : theme.colors.grey_dark}}
                  >
                    {t('reviews')} ({course.comments?.length ?? 0})
                  </Text>
                </TouchableOpacity>
              </Box>
            </FadeInView>
          </Box>

          {/* Tab Content */}
          {activeTab === 'outline' ? (
            <Box paddingHorizontal="md" paddingTop="sm">
              {sortedModules.map((mod, index) => (
                <FadeInView key={mod.id} delay={400 + index * 50} slideFrom="bottom">
                  <Box marginBottom="md">
                    <Text variant="body_medium" style={{color: theme.colors.black}} marginBottom="xs">
                      Module {index + 1}: {mod.title}
                    </Text>
                    {mod.content === '' ? (
                      <Box
                        padding="sm"
                        borderRadius="xxs"
                        borderWidth={1}
                        borderColor="grey_light"
                        flexDirection="row"
                        alignItems="center"
                      >
                        <Icons.Feather name="alert-circle" size={16} color={theme.colors.warning_dark} />
                        <Text variant="body_regular" color="warning_dark" marginLeft="xs">
                          {t('module_failed')}
                        </Text>
                      </Box>
                    ) : (
                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => Navigation.navigate('moduleDetail', {module: mod})}
                      >
                        <Box
                          padding="sm"
                          borderRadius="xxs"
                          borderWidth={1}
                          borderColor="grey_light"
                          style={{backgroundColor: theme.colors.white}}
                          flexDirection="row"
                          alignItems="center"
                        >
                          <Box
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: 16,
                              justifyContent: 'center',
                              alignItems: 'center',
                              backgroundColor: theme.colors.primary_light,
                            }}
                          >
                            <Icons.Feather name="play" size={14} color={theme.colors.primary} />
                          </Box>
                          <Box flex={1} marginLeft="sm">
                            <Text variant="body_regular" numberOfLines={1}>
                              {mod.title}
                            </Text>
                            <Text variant="body_helper_regular" color="grey" marginTop="xxs">
                              {t('read_content')}
                            </Text>
                          </Box>
                          <Icons.Feather name="chevron-right" size={16} color={theme.colors.grey} />
                        </Box>
                      </TouchableOpacity>
                    )}
                  </Box>
                </FadeInView>
              ))}
            </Box>
          ) : (
            <CommentsSection courseId={courseId} comments={course.comments || []} onRefresh={refetch} />
          )}
        </Animated.ScrollView>
      )}
    </Container>
  );
};

export default CourseDetailScreen;
