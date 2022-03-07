/* eslint-disable @typescript-eslint/dot-notation */
import type {
  IJsSdkOption,
  IResult,
  ScanOption,
  ChoseImageOpt,
  UploadImageOpt,
  RecordOpt,
  VoiceOpt,
} from '../interface';
import AbsJsSdk from './absjssdk';

// 支付宝SDK
export default class AliSdk extends AbsJsSdk {
  private apJsSdk: any;
  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor(option: IJsSdkOption) {
    super(option);
  }

  public async init(): Promise<any> {
    const { authUrl, sdkConfig } = this.option;
    if (sdkConfig && sdkConfig.jsPath) {
      await this.loadJs(sdkConfig.jsPath);
      this.apJsSdk = window['ap'];
      if (!this.apJsSdk) {
        throw 'apJsSdk load error';
      }
      if (!authUrl) {
        throw 'apJsSdk authUrl error';
      }
      // const {data}=await this.loadRemoteData({url:authUrl,method:'get',params:{sdkType:SdkType.WX_PAY.code}})
      // console.log(result)
      // this.apJsSdk.config(
      //     {
      //         ...data.data,
      //         // 必填，需要使用的JS接口列表
      //         jsApiList:[
      //             // 扫一扫
      //             "scanQRCode",

      //             "updateAppMessageShareData",
      //             "onMenuShareAppMessage",

      //             // 图片
      //             "chooseImage",
      //             "uploadImage",

      //             // 定位
      //             "getLocation",
      //             "openLocation",

      //             // 录音
      //             "startRecord",
      //             "stopRecord",
      //             "onVoiceRecordEnd",
      //             "playVoice",
      //             "pauseVoice",
      //             "stopVoice",
      //             "onVoicePlayEnd",
      //             "uploadVoice",
      //             "downloadVoice",
      //         ]
      //     }
      //  )
      // eslint-disable-next-line func-names
      this.apJsSdk.error(function (res: any) {
        console.log(res);
        throw 'apJsSdk load error';
      });
    }
  }

  // 扫一扫
  scan(option: ScanOption = { needResult: 1, scanType: ['qrCode', 'barCode'] }): Promise<IResult> {
    // const scanQRCode=util.promisify(this.apJsSdk.scanQRCode)
    const _that = this;
    return new Promise((resolve, reject) => {
      const scanOption = {
        ...option,
        ...{
          success: (res: any) => {
            const data = res.resultStr;
            resolve(_that.getSuccess(data));
          },
          fail(res: any) {
            const msg = res.errMsg;
            reject(_that.getError(msg));
          },
        },
      };
      this.apJsSdk.scanQRCode(scanOption);
    });
  }

  // 图像接口
  choseImage(
    option: ChoseImageOpt = {
      count: 9,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
    },
  ): Promise<IResult> {
    const _that = this;
    // 默认参数
    const defaultOpt = {
      count: 1, // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
    };

    return new Promise((resolve, reject) => {
      const imageOption = {
        ...defaultOpt,
        ...option,
        success: (res: any) => {
          const { localIds } = res;
          resolve(_that.getSuccess(localIds));
        },
      };

      this.apJsSdk.chooseImage(imageOption);
    });
  }

  // 上传图片
  uploadImage(option: UploadImageOpt = { localId: '', isShowProgressTips: 1 }): Promise<IResult> {
    const _that = this;
    return new Promise((resolve, reject) => {
      const imageOption = {
        ...option,
        success: (res: any) => {
          const { serverId } = res; // 返回图片的服务器端ID
          resolve(_that.getSuccess(serverId));
        },
      };

      this.apJsSdk.uploadImage(imageOption);
    });
  }

  // 录音操作
  record(option: RecordOpt = { type: 'start', params: {} }): Promise<IResult> {
    const _that = this;
    return new Promise((resolve, reject) => {
      const { type, params } = option;
      let recordOpt = {
        ...params,
      };

      switch (type) {
        // 录音开始
        case 'start':
          recordOpt = {
            ...recordOpt,
            success: () => {
              resolve(_that.getSuccess('录音开始'));
            },
          };
          this.apJsSdk.startRecord(recordOpt);
          break;
        // 录音停止
        case 'stop':
          recordOpt = {
            ...recordOpt,
            success: (res: any) => {
              const { localId } = res;
              resolve(_that.getSuccess(localId));
            },
          };
          this.apJsSdk.stopRecord(recordOpt);
          break;
      }
    });
  }

  // 语音操作
  voice(option: VoiceOpt = { type: 'play', params: {} }): Promise<IResult> {
    const _that = this;
    return new Promise((resolve, reject) => {
      const { type, params } = option;
      let recordOpt = {
        ...params,
      };

      switch (type) {
        // 播放语音
        case 'play':
          recordOpt = {
            ...recordOpt,
            success: (res: any) => {
              resolve(_that.getSuccess('播放语音'));
            },
          };
          this.apJsSdk.playVoice(recordOpt);
          break;

        // 暂停播放语音
        case 'pause':
          recordOpt = {
            ...recordOpt,
            success: (res: any) => {
              resolve(_that.getSuccess('暂停播放语音'));
            },
          };
          this.apJsSdk.pauseVoice(recordOpt);
          break;

        // 暂停播放语音
        case 'stop':
          recordOpt = {
            ...recordOpt,
            success: (res: any) => {
              resolve(_that.getSuccess('停止播放语音'));
            },
          };
          this.apJsSdk.stopVoice(recordOpt);
          break;

        // 上传语音
        case 'upload':
          recordOpt = {
            isShowProgressTips: 1, // 默认为1，显示进度提示
            ...recordOpt,
            success: (res: any) => {
              const { serverId } = res; // 返回音频的服务器端ID
              resolve(_that.getSuccess(serverId));
            },
          };
          this.apJsSdk.uploadVoice(recordOpt);
          break;

        // 下载语音
        case 'download':
          recordOpt = {
            isShowProgressTips: 1, // 默认为1，显示进度提示
            ...recordOpt,
            success: (res: any) => {
              const { localId } = res; // 返回音频的本地ID
              resolve(_that.getSuccess(localId));
            },
          };
          this.apJsSdk.downloadVoice(recordOpt);
          break;
      }
    });
  }

  // 位置操作
  // params: {
  //     latitude?: number, // 纬度，浮点数，范围为90 ~ -90
  //     longitude?: number, // 经度，浮点数，范围为180 ~ -180。
  //     name?: string, // 位置名
  //     address?: string, // 地址详情说明
  //     scale?: number, // 地图缩放级别,整形值,范围从1~28。默认为最大
  //     infoUrl?: string, // 在查看位置界面底部显示的超链接,可点击跳转
  //     type?: string, // 默认为wgs84的gps坐标，如果要返回直接给openLocation用的火星坐标，可传入'gcj02'
  // }
  // location (option:LocationOpt={type: 'open', params: {}}): Promise<IResult> {
  //     const _that=this;

  //     return new Promise((resolve, reject) => {
  //         const { type, params } = option;
  //         let recordOpt = {
  //             ...params
  //         };

  //         switch (type) {
  //             // 查看位置
  //             case 'open':
  //                 recordOpt = {
  //                     scale: 15, // 地图缩放级别,整形值,范围从1~28。默认为最大
  //                     ...recordOpt
  //                 }
  //                 this.apJsSdk.openLocation(recordOpt, ()=>{
  //                     resolve(_that.getSuccess(null));
  //                 });
  //                 break;
  //             // 获取位置
  //             case 'get':
  //                 recordOpt = {
  //                     type: 0, // 默认为wgs84的gps坐标，如果要返回直接给openLocation用的火星坐标，可传入'gcj02'
  //                     ...recordOpt
  //                 }
  //                 this.apJsSdk.getLocation(recordOpt, (res:any)=>{
  //                     resolve(_that.getSuccess(res:any));
  //                 });
  //                 break;
  //         }

  //     })

  // };
}
