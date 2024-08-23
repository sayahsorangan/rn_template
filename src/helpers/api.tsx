export const generateURLParam = (filters: any) => {
  const filters_data = filters as any;
  let additional_url_param = '';
  Object.keys(filters_data).map((i, index) => {
    if (index != 0) {
      additional_url_param += '&' + i + '=' + filters_data[i].toString();
    } else {
      additional_url_param += i + '=' + filters_data[i].toString();
    }
  });
  return additional_url_param;
};
