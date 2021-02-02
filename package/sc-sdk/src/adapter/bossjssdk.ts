import {
  IJsSdkOption,
  IResult,
  ScanOption,
  ChoseImageOpt,
  GetLocOpt
} from "../interface";
import AbsJsSdk from "./absjssdk";

// 博思SDK
export default class BossSdk extends AbsJsSdk {
  // 博思SDK常量
  private bossJsSdk: any;
  // 公用回调成功执行函数
  private _resolve: Function;
  // 公用回调失败执行函数
  private _reject: Function;
  // sdk公用回调方法名
  private _getResultStr: string;
  constructor(option: IJsSdkOption) {
    super(option);
    this._getResultStr = "window._BsJsBridge._getResult";
  }

  // 初始化
  public async init(): Promise<any> {
    const { sdkConfig } = this.option;
    if (sdkConfig) {
      this.bossJsSdk = window["BsJsBridge"];
      if (!this.bossJsSdk) {
        console.log("bossJsSdk load error！环境信息如下：");
        console.log(sdkConfig);
      }
    }
    // 开放外部调用方法
    window["_BsJsBridge"] = this;
  }

  /**
   * SDK内部通用回调方法
   */
  _getResult(res) {
    console.log("进入_getResult方法,参数为：");
    console.log(res);
    const _this = this;
    if (res) {
      let data = res;
      if (typeof res === "string") {
        data = JSON.parse(res);
      }
      _this._resolve(_this.getSuccess(data));
    } else {
      _this._reject(_this.getError(res));
    }
  }

  /**
   * 获取定位
   */
  getLocation(option: GetLocOpt = {}): Promise<any> {
    const _this = this;
    return new Promise((resolve, reject) => {
      _this._resolve = resolve;
      _this._reject = reject;
      _this.bossJsSdk.getLocationInfo("", _this._getResultStr);
    });
  }

  /**
   * 返回二维码页面并执行相应操作
   * @param type 1 授权  2 刷新
   */
  startQrCodeActivity(type: 1): Promise<IResult> {
    return this.bossJsSdk.startQrCodeActivity(type);
  }

  /**
   * 关闭h5页面
   */
  closeH5(): Promise<IResult> {
    return this.bossJsSdk.close();
  }

  /**
   * 图像接口
   * @param
   */
  choseImage(option: ChoseImageOpt = {}): Promise<IResult> {
    const _this = this;
    return new Promise((resolve, reject) => {
      _this._resolve = resolve;
      _this._reject = reject;
      _this.bossJsSdk.selectPicture("", _this._getResultStr);
    });
  }

  /**
   * 扫一扫
   * @param
   */
  scan(option: ScanOption = {}): Promise<IResult> {
    const _this = this;
    return new Promise((resolve, reject) => {
      _this._resolve = resolve;
      _this._reject = reject;
      _this.bossJsSdk.scan("", _this._getResultStr);
    });
  }
}
