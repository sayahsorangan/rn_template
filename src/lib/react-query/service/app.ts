import {Api} from '@lib/ky';
import {MutationFunction} from '@tanstack/react-query';

const getAppInfo: MutationFunction<any, any> = async (data: any) => {
  const resp: any = await Api.post('appinfo', {json: data}).json();
  return resp;
};

export const AppServices = {
  getAppInfo,
};
