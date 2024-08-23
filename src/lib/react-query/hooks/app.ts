/* eslint-disable react-hooks/rules-of-hooks */

import {useMQ, UseMQOptions} from '@react-query/custom-hooks';
import {AppQueryKey} from '@react-query/query-key';
import {AppServices} from '@react-query/service/app';

// <response,body>
export function getAppInfo(options?: UseMQOptions<any, any>) {
  return useMQ([AppQueryKey.getAppInfo], AppServices.getAppInfo, options);
}
