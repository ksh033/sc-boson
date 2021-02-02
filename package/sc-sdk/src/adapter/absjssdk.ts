import {
    IJsSdk,IJsSdkConfig,IJsSdkOption,IResult,IType,
    ScanOption, GetLocOpt
} from "../interface";
import {loadJs,getError,getSuccess} from '../utils'
import axios,{AxiosRequestConfig} from 'axios'
export default abstract class AbsSdk implements IJsSdk  {
    protected  option:IJsSdkOption
    constructor (opt:IJsSdkOption={authUrl:"",sdkConfig:null}) {
       this.option=opt;
    }
    protected getSdkConfig(): IJsSdkConfig {
      if (this.option.sdkConfig){
         return this.option.sdkConfig; 
       }
       return null
    }   
 
    async init():Promise<any> {
        Promise.resolve();
    }

    getSdkType():IType {
        if (this.option.sdkConfig){
            return this.option.sdkConfig.sdkType; 
        }
        return null
    }

    loadJs(files: string | string[]){
       return loadJs(files)
    }
    loadRemoteData(config:AxiosRequestConfig){
      return axios.request(config)
    }

    protected getSuccess(data:any):IResult{
      return getSuccess(data);
    }

    protected  getError(msg:any):IResult{
      return getError(msg);
    }

    /**
     * SDK公有
     * 获取定位
     */
    getLocation(option: GetLocOpt): Promise<IResult> {
        return new Promise((resolve, reject) => {
            console.log('Method of getLocation not implemented')
        })
    }

    /**
     * SDK公有
     * 图像接口
     */
    choseImage(option: import("../interface").ChoseImageOpt): Promise<IResult> {
        return new Promise((resolve, reject) => {
            console.log('Method of choseImage not implemented')
        })
    }
    
    /**
     * 支持：微信、支付宝、博思SDK
     * 扫一扫
     */
    scan(option: ScanOption): Promise<IResult> {
        return new Promise((resolve, reject) => {
            console.log('Method of scan not implemented')
        })
    }

    /**
     * 支持：博思SDK
     * 返回二维码页面并执行相应操作
     * @param type 1 授权  2 刷新
     */
    startQrCodeActivity(type): Promise<IResult> {
        return new Promise((resolve, reject) => {
            console.log('Method of startQrCodeActivity not implemented')
        })
    }

    /**
     * 支持：博思SDK
     * 关闭h5页面
     */
    closeH5(): Promise<IResult> {
        return new Promise((resolve, reject) => {
            console.log('Method of closeH5 not implemented')
        })
    }

    /**
     * 支持：思源SDK
     * 打开手机GPS设置
     */
    setGPS(): Promise<IResult> {
        return new Promise((resolve, reject) => {
            console.log('Method of setGPS not implemented')
        })
    }

    /**
     * 支持：思源SDK、微信支付宝
     * 根据参数打开地图
     * @param latitude
     * @param longitude
     */
    openLocation(option: import("../interface").OpenLocOpt): Promise<IResult> {
        return new Promise((resolve, reject) => {
            console.log('Method of openLocation not implemented')
        })
    }

    uploadImage(option: import("../interface").UploadImageOpt): Promise<IResult> {
        return new Promise((resolve, reject) => {
            console.log('Method of uploadImage not implemented')
        })
    }

    pay(): Promise<IResult> {
       throw new Error("Method not implemented.");
    }

    getTicket(): Promise<IResult> {
        return new Promise((resolve, reject) => {
            console.log('Method of getTicket not implemented')
        })
    }

    login(config: any): Promise<IResult> {
        return new Promise((resolve, reject) => {
            console.log('Method of login not implemented')
        })
    }
 }