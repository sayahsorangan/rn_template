/* eslint-disable react-hooks/rules-of-hooks */

import {ICourse} from '@models/API/course';
import {UseInfiniteOptions, useInfiniteRQ, useMQ, UseMQOptions, useRQ, UseRQOptions} from '@react-query/custom-hooks';
import {CourseQueryKey} from '@react-query/query-key';
import {CourseService} from '@react-query/service/course';

type CoursesKey = readonly [string];
type CoursesWithCategoryKey = readonly [string, string];
type CourseDetailKey = readonly [string, string];

const PAGE_LIMIT = 5;

export function getCourses(options?: UseRQOptions<ICourse.Course[], CoursesKey>) {
  return useRQ<ICourse.Course[], CoursesKey>(
    [CourseQueryKey.getCourses] as const,
    () => CourseService.getCourses(),
    options,
  );
}

export function getCoursesPaginated(
  category: string,
  options?: UseInfiniteOptions<ICourse.Course[], CoursesWithCategoryKey>,
) {
  return useInfiniteRQ<ICourse.Course[], CoursesWithCategoryKey>(
    [CourseQueryKey.getCourses, category] as const,
    ({pageParam = 1}) => CourseService.getCourses({page: pageParam, limit: PAGE_LIMIT, category}),
    {
      getNextPageParam: (lastPage, allPages) => {
        if (lastPage.length < PAGE_LIMIT) {
          return undefined;
        }
        return allPages.length + 1;
      },
      ...options,
    },
  );
}

export function getMyCourses(options?: UseRQOptions<ICourse.Course[], CoursesKey>) {
  return useRQ<ICourse.Course[], CoursesKey>(
    [CourseQueryKey.getMyCourses] as const,
    CourseService.getMyCourses,
    options,
  );
}

export function getCourseDetail(id: string, options?: UseRQOptions<ICourse.CourseDetail, CourseDetailKey>) {
  return useRQ<ICourse.CourseDetail, CourseDetailKey>(
    [CourseQueryKey.getCourseDetail, id] as const,
    () => CourseService.getCourseById(id),
    {enabled: !!id, ...options},
  );
}

export function getFavorites(options?: UseRQOptions<ICourse.Course[], CoursesKey>) {
  return useRQ<ICourse.Course[], CoursesKey>(
    [CourseQueryKey.getFavorites] as const,
    CourseService.getFavorites,
    options,
  );
}

export function toggleFavorite(options?: UseMQOptions<{favorited: boolean}, string>) {
  return useMQ([CourseQueryKey.toggleFavorite], CourseService.toggleFavorite, options);
}

export function deleteCourse(options?: UseMQOptions<{success: boolean; message: string}, string>) {
  return useMQ([CourseQueryKey.deleteCourse], CourseService.deleteCourse, options);
}

export function regenerateModule(options?: UseMQOptions<ICourse.CourseModule, string>) {
  return useMQ([CourseQueryKey.regenerateModule], CourseService.regenerateModule, options);
}
