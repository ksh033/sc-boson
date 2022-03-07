export interface RequestData {
  data: any;
  success?: boolean;
  message?: number;
}

const useFetchData = async (
  request: (arg0: any) => Promise<any>,
  options?: any,
  callBack?: (arg: any) => void,
): Promise<any> => {
  if (request) {
    try {
      let dataSource: RequestData = await request(options);
      if (callBack) {
        callBack(dataSource);
      }
      return dataSource;
    } catch (e) {
      console.log('请求出错:', e);
    }
  }
  return [];
};

export default useFetchData;
