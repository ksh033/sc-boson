import { 
    IJsSdkOption, IResult, 
    ScanOption, ChoseImageOpt, UploadImageOpt, RecordOpt, VoiceOpt, GetLocOpt, OpenLocOpt
} from '../interface';
import {SdkType} from "../constant";
import AbsJsSdk from './absjssdk';

// 微信SDK
export default class WxSdk extends AbsJsSdk {
 
    private wxJsSdk:any
    constructor(option:IJsSdkOption) {
       super(option)
    }

    public async init():Promise<any> {
        const {authUrl,sdkConfig}=this.option
        if (sdkConfig){
            await this.loadJs(sdkConfig.jsPath);
             this.wxJsSdk=window["wx"]
            if (!this.wxJsSdk){
                console.log("wxJsSdk load error！环境信息如下：");
                console.log(sdkConfig);
                // throw "wxJsSdk load error"
            }
            if (!authUrl){
                console.log("wxJsSdk authUrl error！环境信息如下：");
                console.log(sdkConfig);
                // throw "wxJsSdk authUrl error"
            }
             const {data}=await this.loadRemoteData({url:authUrl,method:'get',params:{sdkType:SdkType.WX_PAY.code}})
            // console.log(result)
             this.wxJsSdk.config(
                {
                    ...data.data,
                    // 必填，需要使用的JS接口列表
                    jsApiList:[
                        // 扫一扫
                        "scanQRCode",

                        "updateAppMessageShareData",
                        "onMenuShareAppMessage",

                        // 图片
                        "chooseImage",
                        "uploadImage",

                        // 定位
                        "getLocation",
                        "openLocation",

                        // 录音
                        "startRecord",
                        "stopRecord",
                        "onVoiceRecordEnd",
                        "playVoice",
                        "pauseVoice",
                        "stopVoice",
                        "onVoicePlayEnd",
                        "uploadVoice",
                        "downloadVoice",
                    ]
                }
             )
             this.wxJsSdk.error(function(res){
                console.log("初始化异常信息如下：");
                console.log(res)
                // throw "wxJsSdk load error"
            });
        }  
    }
    
    /**
     * 扫一扫
     */
    scan(option:ScanOption={needResult:1,scanType:["qrCode","barCode"]}): Promise<IResult> {
        const _that=this;
        return new Promise((resolve, reject) => {
            let scanOption={...option,...{success:(res)=>{
                const data=res.resultStr
                resolve(_that.getSuccess(data));
            },fail: function (res) {
                const msg=res.errMsg
                reject(_that.getError(msg));
            },}}
           this.wxJsSdk.scanQRCode(scanOption);
        })
    };

    /**
     * 图像接口
     */
    choseImage (option:ChoseImageOpt={count: 9,sizeType: ['original', 'compressed'],sourceType: ['album', 'camera']}): Promise<IResult> {
        const _that=this;
        // 默认参数
        let defaultOpt = {
            count: 1, // 默认9
            sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
            sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
        };

        return new Promise((resolve, reject) => {
            let imageOption = {
                ...defaultOpt,
                ...option,
                success: (res)=>{
                    var localIds = res.localIds;
                    resolve(_that.getSuccess(localIds));
                }
            };

            this.wxJsSdk.chooseImage(imageOption);
        })
    };

    /**
     * 上传图片
     */
    uploadImage (option:UploadImageOpt={localId: '', isShowProgressTips: 1}): Promise<IResult> {
        const _that=this;
        return new Promise((resolve, reject) => {
            let imageOption = {
                ...option,
                success: (res)=>{
                    var serverId = res.serverId; // 返回图片的服务器端ID
                    resolve(_that.getSuccess(serverId));
                }
            };

            this.wxJsSdk.uploadImage(imageOption);
        })
    };

    /**
     * 录音操作
     */
    record (option:RecordOpt={type: 'start', params: {}}): Promise<IResult> {
        const _that=this;
        return new Promise((resolve, reject) => {
            const { type, params } = option;
            let recordOpt = {
                ...params
            };

            switch (type) {
                // 录音开始
                case 'start': 
                    recordOpt = {
                        ...recordOpt,
                        success: () => {
                            resolve(_that.getSuccess("录音开始"));
                        }
                    }
                    this.wxJsSdk.startRecord(recordOpt);
                    break;
                // 录音停止
                case 'stop': 
                    recordOpt = {
                        ...recordOpt,
                        success: (res) => {
                            var localId = res.localId;
                            resolve(_that.getSuccess(localId));
                        }
                    }
                    this.wxJsSdk.stopRecord(recordOpt);
                    break;
            }
        })
    };

    // 语音操作
    voice (option:VoiceOpt={type: 'play', params: {}}): Promise<IResult> {
        const _that=this;
        return new Promise((resolve, reject) => {
            const { type, params } = option;
            let recordOpt = {
                ...params
            };

            switch (type) {
                // 播放语音
                case 'play': 
                    recordOpt = {
                        ...recordOpt,
                        success: (res) => {
                            resolve(_that.getSuccess('播放语音'));
                        }
                    }
                    this.wxJsSdk.playVoice(recordOpt);
                    break;
                
                // 暂停播放语音
                case 'pause': 
                    recordOpt = {
                        ...recordOpt,
                        success: (res) => {
                            resolve(_that.getSuccess('暂停播放语音'));
                        }
                    }
                    this.wxJsSdk.pauseVoice(recordOpt);
                    break;
                
                // 暂停播放语音
                case 'stop': 
                    recordOpt = {
                        ...recordOpt,
                        success: (res) => {
                            resolve(_that.getSuccess('停止播放语音'));
                        }
                    }
                    this.wxJsSdk.stopVoice(recordOpt);
                    break;
                
                // 上传语音
                case 'upload': 
                    recordOpt = {
                        isShowProgressTips: 1, // 默认为1，显示进度提示
                        ...recordOpt,
                        success: (res) => {
                            var serverId = res.serverId; // 返回音频的服务器端ID
                            resolve(_that.getSuccess(serverId));
                        }
                    }
                    this.wxJsSdk.uploadVoice(recordOpt);
                    break;
                
                // 下载语音
                case 'download': 
                    recordOpt = {
                        isShowProgressTips: 1, // 默认为1，显示进度提示
                        ...recordOpt,
                        success: (res) => {
                            var localId = res.localId; // 返回音频的本地ID
                            resolve(_that.getSuccess(localId));
                        }
                    }
                    this.wxJsSdk.downloadVoice(recordOpt);
                    break;
            }
        })
    };

    /**
     * 获取定位
     */
    getLocation (option:GetLocOpt={}): Promise<IResult> {
        const _this = this;
        return new Promise((resolve, reject) => {
            let recordOpt = {};
            recordOpt = {
                type: 'gcj02', // 默认为wgs84的gps坐标，如果要返回直接给openLocation用的火星坐标，可传入'gcj02'
                ...option,
                success: (res) => {
                    resolve(_this.getSuccess(res));
                }
            }
            this.wxJsSdk.getLocation(recordOpt);
        })
    };

    /**
     * 根据参数打开地图
     */
    openLocation (option:OpenLocOpt={}): Promise<IResult> {
        const _this = this;
        return new Promise((resolve, reject) => {
            let recordOpt = {
                scale: 14, // 地图缩放级别,整形值,范围从1~28。默认为最大
                ...option,
                success: () => {
                    resolve(_this.getSuccess(null));
                }
            }
            this.wxJsSdk.openLocation(recordOpt);
        })
    };
    
}