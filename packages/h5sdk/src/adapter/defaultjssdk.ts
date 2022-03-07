/* eslint-disable @typescript-eslint/no-useless-constructor */
import type { IJsSdkOption } from '../interface';
import AbsJsSdk from './absjssdk';

// 默认SDK
export default class defaultSdk extends AbsJsSdk {
  // private sensorsJsSdk:any;
  constructor(option: IJsSdkOption) {
    super(option);
  }

  // public async init():Promise<any> {
  //     Promise.resolve();
  // }
}
