
import loadjs from "loadjs";

import type {IResult} from "../interface";
import {ResultCode} from "../constant";

export function loadJs( files: string | string[]): Promise<any>{

    return loadjs(files,{
        returnPromise: true
    })
}

export function getSuccess(data:any): IResult{

    const result: IResult={
        data,
        code:ResultCode.SUCCESS,
        msg:"成功"
    }

    return  result
}
export function getError(msg:any): IResult{
    const result: IResult={
        data:null,
        code:ResultCode.ERROR,
        msg
    }
    return  result
}


