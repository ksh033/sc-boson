import BasePluginvoke from './base-plugin-invoke';
import utils from 'utils/index';
import { PluginFunConfig, PluginConfig, PluginInvokeOptions, Window, PrintConfig } from '../boss-soft-plugin';

let functions:Array<string|PluginFunConfig> = [
    {
        jsName:'initParams',
        dllName:'initParams',
        initRequired:false
    },
    'doPreview',
    'doCoordinate',
    'doCustomPrint',
    'doDesign',
    'doPrintMultiSubReport',
    'doPrintRemoteImage',
    'getDefaultTemplete',
    'getLocal',
    'getPrintPreviewImage',
    'getPrintSet',
    'getPrinter',
    'getTemplateList',
    'getTemplatePath',
    'openFile',
    'printReport',
    'setLocal',
    'setPrinter'
];

/**
 * 打印控件
 */
export default class Print extends BasePluginvoke{

    constructor(config: PrintConfig){
        super(config, 'print', functions);
    }

    init():Promise<any>{
        let {cookie:Cookie, 
            hostUrl:HostUrl, 
            downLoadUrl:DownLoadUrl, 
            queryTempListUrl:QueryTempListUrl,
            queryTempNameUrl:QueryTempNameUrl} = this.config;
        this.initOptions = {
            Cookie, 
            HostUrl, 
            DownLoadUrl, 
            QueryTempListUrl, 
            QueryTempNameUrl
        };
        return this.initParams(this.initOptions)
    }

    /**
     * 导出富文本文件pdf、excel
     * @param ops 
     */
    exportMedia(ops:any):Promise<any>{
        return this.initStateDefer.then(()=>{
            return this.openFile()
        }).then((path)=>{
            ops.ExportPath = path;
            return this.operate({
                func:'exportMedia',
                data:[ops]
            });
        })
    }


    /**
     * 根据模板生成图片
     * @param ops 
     */
    doImage(ops:any):Promise<any>{
        return this.initStateDefer.then(()=>{
            ops.ShowForm = false;
            ops.PrintPreview = true;
            let {PrintData} = ops;
            if(!Array.isArray(PrintData)){
                ops.PrintData = [PrintData];
            }
            return this.operate({
                func:'doPreview',
                data:[ops]
            });
        })
    }
}