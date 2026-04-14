/* eslint-disable react-hooks/rules-of-hooks */

import {PaginatedResponse} from '@models/API/app';
import {ICourse} from '@models/API/course';
import {UseInfiniteOptions, useInfiniteRQ, useRQ, UseRQOptions} from '@react-query/custom-hooks';
import {CourseQueryKey} from '@react-query/query-key';
import {CourseService} from '@react-query/service/course';

const COURSES_PER_PAGE = 5;

type CoursesKey = readonly [string];
type CourseDetailKey = readonly [string, string];

export function getCourses(options?: UseInfiniteOptions<PaginatedResponse<ICourse.Course>, CoursesKey>) {
  return useInfiniteRQ<PaginatedResponse<ICourse.Course>, CoursesKey>(
    [CourseQueryKey.getCourses] as const,
    ({pageParam = 1}) => CourseService.getCourses({page: pageParam, limit: COURSES_PER_PAGE}),
    {
      getNextPageParam: lastPage => {
        const pagination = lastPage?.pagination;
        if (!pagination) {
          return undefined;
        }
        return pagination.page < pagination.totalPages ? pagination.page + 1 : undefined;
      },
      ...options,
    },
  );
}

export function getCourseDetail(id: string, options?: UseRQOptions<ICourse.Course, CourseDetailKey>) {
  return useRQ<ICourse.Course, CourseDetailKey>(
    [CourseQueryKey.getCourseDetail, id] as const,
    () => CourseService.getCourseById(id),
    {enabled: !!id, ...options},
  );
}
