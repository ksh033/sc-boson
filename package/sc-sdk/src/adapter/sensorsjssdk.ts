import {
  IJsSdkOption,
  IResult,
  AxseOption,
  ChoseImageOpt,
  OpenLocOpt,
  GetLocOpt
} from "../interface";
import AbsJsSdk from "./absjssdk";
import CoordinateConvert from "coordinate-convert";

// 思源SDK
export default class SensorsSdk extends AbsJsSdk {
  // private sensorsJsSdk:any;
  constructor(option: IJsSdkOption) {
    super(option);
  }

  // public async init():Promise<any> {
  //     Promise.resolve();
  // }

  /**
   * 获取同意协议结果(内部方法)
   * @param data
   * @param successfn
   * @param errorfn
   */
  async _axse(
    option: AxseOption = { data: "", successfn: () => {}, errorfn: () => {} }
  ): Promise<any> {
    const { data, successfn, errorfn } = option;
    let param =
      data == null || data == "" || typeof data == "undefined"
        ? { date: new Date().getTime() }
        : data;
    var _port = location.href.indexOf("https://") > -1 ? 6781 : 6780;
    const result = await this.loadRemoteData({
      url: "//127.0.0.1:" + _port + "/getResult",
      method: "post",
      data: param
    });
    if (result.status === 200) {
      successfn(result.data);
    } else {
      errorfn(result.data);
    }
  }

  /**
   * gps操作(内部方法)
   * @param type: 0获取定位, 1打开手机GPS设置页面
   */
  _operateGPS(type = 0): Promise<IResult> {
    const _this = this;
    return new Promise((resolve, reject) => {
      let flagTimeRandom = new Date().getTime() + "";
      let params = {
        flagId: flagTimeRandom,
        functionType: type
      };

      window.location.href = "toon://mwap/gps?params=" + JSON.stringify(params);
      _this._axse({
        data: 'params={"flagId":' + flagTimeRandom + "}",
        successfn: function(data) {
          // wgs2gcj坐标转换
          let lng_lat = CoordinateConvert.wgs2gcj(
            data.data.longitude,
            data.data.latitude
          );
          console.log("转换后lng_lat:");
          console.log(lng_lat);
          resolve(
            _this.getSuccess({
              ...data.data,
              platform: data.platform,
              longitude: lng_lat[0],
              latitude: lng_lat[1]
            })
          );
        },
        errorfn: function(data) {
          reject(
            _this.getError({
              ...data.data,
              platform: data.platform
            })
          );
        }
      });
    });
  }

  /**
   * 获取定位
   * @param data
   * @param successfn
   * @param errorfn
   */
  getLocation(option: GetLocOpt = {}): Promise<IResult> {
    return this._operateGPS(0);
  }

  /**
   * 打开手机GPS设置
   * @param latitude
   * @param longitude
   */
  setGPS(option: OpenLocOpt = {}): Promise<IResult> {
    return this._operateGPS(1);
  }

  /**
   * 根据参数打开地图
   * @param latitude
   * @param longitude
   */
  openLocation(option: OpenLocOpt = {}): Promise<IResult> {
    const _this = this;
    return new Promise((resolve, reject) => {
      const { latitude, longitude } = option;
      let flagTimeRandom = new Date().getTime() + "";
      let params: any = {
        flagId: flagTimeRandom
      };

      // 是否有具体定位参数
      if (latitude && longitude) {
        params.latitude = latitude;
        params.longitude = longitude;
      }

      window.location.href = "toon://mwap/map?params=" + JSON.stringify(params);
      _this._axse({
        data: 'params={"flagId":' + flagTimeRandom + "}",
        successfn: function(data) {
          resolve(_this.getSuccess(data));
        },
        errorfn: function(data) {
          reject(_this.getError(data));
        }
      });
    });
  }

  /**
   * 图像接口
   * @param functionType
   */
  choseImage(option: ChoseImageOpt = { functionType: 2 }): Promise<IResult> {
    const _this = this;
    return new Promise((resolve, reject) => {
      const { functionType } = option;
      var flagTimeRandom = new Date().getTime() + "";
      var params = {
        flagId: flagTimeRandom,
        functionType: functionType,
        nameSpace: "demo.systoon.com",
        type: 1,
        ratio: 0.3,
        maxCount: 1,
        filterMimeType: "image/gif"
      };
      window.location.href =
        "toon://mwap/photo?params=" + JSON.stringify(params);
      _this._axse({
        data: 'params={"flagId":' + flagTimeRandom + "}",
        successfn: function(data) {
          if (data.data) {
            if (data.data.base64) {
              resolve(_this.getSuccess(data.data));
            } else {
              resolve(_this.getSuccess(data.data.imageArr));
            }
          }
        },
        errorfn: function(data) {
          reject(_this.getError(data));
        }
      });
    });
  }
}
