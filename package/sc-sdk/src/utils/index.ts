
import loadjs from "loadjs";

import {IResult} from "../interface";
import {ResultCode} from "../constant";
export function loadJs( files: string | string[]):Promise<any>{

    return loadjs(files,{
        returnPromise: true
    })
}

export function getSuccess(data):IResult{

    const result:IResult={
        data,
        code:ResultCode.SUCCESS,
        msg:"成功"
    }

    return  result
}
export function getError(msg):IResult{
    const result:IResult={
        data:null,
        code:ResultCode.ERROR,
        msg:msg
    }
    return  result
}


