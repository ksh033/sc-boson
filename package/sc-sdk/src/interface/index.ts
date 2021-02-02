

/**
 * sdk初始化参数
 */
export interface IJsSdkOption{
   authUrl?:string
   sdkConfig?:IJsSdkConfig
}
/**
 * Sdk类接口
 */
export interface IJsSdk {

    /**
     * 初始化JsSdk
     */
    init(): Promise<IResult>;
    /**
     * 登入
     * @param config 
     */
    login(config:any): Promise<IResult>;
    /**
     * 获取当前JsSdk类型
     */
    getSdkType():IType;
    
    /**
     * 扫一扫
     */
    scan(option:ScanOption): Promise<IResult>;
    
    /**
     * 打开地图
     */
    openLocation(option:OpenLocOpt): Promise<IResult>;
    /**
     * 获取位置
     */
    getLocation(option:GetLocOpt): Promise<IResult>;
    
    /**
     * 选择图片
     */
    choseImage(option:ChoseImageOpt): Promise<IResult>;
    /**
     * 上传本地选择的图片
     */
    uploadImage(option:UploadImageOpt): Promise<IResult>;
    
    /**
     * 获取当前用户
     */
    getTicket():Promise<IResult>;

    pay(): Promise<IResult>;
   
}


/**
 * JsSdk构造类
 */
export interface IJsSdkConstructor {
      new (config:IJsSdkOption): IJsSdk;
}

/**
 * sdk类型对象
 */
export interface IType {
   code:String
   name:String
}


/**
 * 扫一扫接口参数
 * @param sdkType SKD类型
 * @param jsPath 需要加载JS路径
 * @param navigatorRule 识别SKD壳规则或方法
 * @param jsSdk 对应jssdk文件
 */
export type IJsSdkConfig={
   sdkType:IType;
   jsPath?:string;
   navigatorRule:string|Function;
   jsSdk:IJsSdkConstructor 
};

/**
 * 扫一扫接口参数
 * @param needResult 返回结果处理
 * @param scanType 扫描类型
 */
export interface ScanOption{
   needResult?: any;
   scanType?:any
}
  
/**
 * 获取同意协议结果
 * @param data 协议参数
 * @param successfn 成功回调
 * @param errorfn 失败回调
 */
export interface AxseOption{
   data:string,
   successfn?:Function,
   errorfn?:Function,
}


/**
 * 选择图片接口参数
 * @param count 可选择的图片数量，默认9
 * @param sizeType 可以指定是原图还是压缩图，默认二者都有
 * @param sourceType 可以指定来源是相册还是相机，默认二者都有
 * @param functionType 思源所需参数
 */
export interface ChoseImageOpt{
    count?: number,
    sizeType?: object,
    sourceType?: object,
    
    functionType?:any
}

// 上传图片接口参数
export interface UploadImageOpt{
    localId?: any, // 需要上传的图片的本地ID，由chooseImage接口获得
    isShowProgressTips?: number, // 默认为1，显示进度提示
}

// 录音接口参数
export interface RecordOpt{
    type?: string, // 录音操作类型： start、stop
    params?: any, // 对应方法参数
}

// 语音接口参数
export interface VoiceOpt{
    type?: string, // 语音操作类型： play、pause、stop、upload、download
    params?: any, // 对应方法参数
}

/**
 * 打开地图参数
 * @param latitude 纬度，浮点数，范围为90 ~ -90
 * @param longitude 经度，浮点数，范围为180 ~ -180。
 * @param name 位置名
 * @param address 地址详情说明
 * @param scale 地图缩放级别,整形值,范围从1~28。默认为最大
 * @param infoUrl 在查看位置界面底部显示的超链接,可点击跳转
 */
export interface OpenLocOpt{
    latitude?: number, 
    longitude?: number,
    name?: string,
    address?: string,
    scale?: number, 
    infoUrl?: string 
}

/** 
 * 获取位置参数
 * @param type 默认为wgs84的gps坐标，如果要返回直接给openLocation用的火星坐标，可传入'gcj02'
*/
export interface GetLocOpt{
    type?: string, 
}



export interface IResult{
   code:string;
   data:any;
   msg:string;
}
