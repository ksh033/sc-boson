import {
  IJsSdk,
  IJsSdkConfig,
  IJsSdkConstructor,
  IJsSdkOption,
  IType
} from "./interface";

import { SdkType } from "./constant";
import WxJsSdk from "./adapter/wxjssdk";
import AliJsSdk from "./adapter/alijssdk";
import SensorsJsSdk from "./adapter/sensorsjssdk";
import BossJsSdk from "./adapter/bossjssdk";
import Defaultjssdk from "./adapter/defaultjssdk";

const SdkApi = () => {
  let sdkApi: IJsSdk;
  let sdkConfig: IJsSdkConfig;
  const sdkConfigList: Array<IJsSdkConfig> = [
    {
      jsPath: "https://res.wx.qq.com/open/js/jweixin-1.2.0.js",
      navigatorRule: "micromessenger",
      sdkType: SdkType.WX_PAY,
      jsSdk: WxJsSdk
    },
    {
      jsPath:
        "https://gw.alipayobjects.com/as/g/h5-lib/alipayjsapi/3.1.1/alipayjsapi.min.js",
      navigatorRule: "alipay",
      sdkType: SdkType.ALI_PAY,
      jsSdk: AliJsSdk
    },
    {
      jsPath: "",
      navigatorRule: "toon",
      sdkType: SdkType.TOON_APP,
      jsSdk: SensorsJsSdk
    },
    {
      jsPath: "",
      navigatorRule: "app-bosssoft",
      sdkType: SdkType.BOSS_APP,
      jsSdk: BossJsSdk
    }
  ];

  function createSdkApi(ctor: IJsSdkConstructor, config: any): IJsSdk {
    //这个和泛型中使用类类型相同，
    return new ctor(config); //需要类型为ClockInterface的两个参数的构造器类，只是二者写法有点区别
  }

  // 判断当前环境：微信micromessenger 支付宝alipay
  function getCurrentSdkConfig(): IJsSdkConfig {
    const ambient = window.navigator.userAgent.toLowerCase();
    if (!sdkConfig) {
      let filterSdkApiList: any = sdkConfigList.filter(
        (value: IJsSdkConfig) => {
          if (value.navigatorRule) {
            if (typeof value.navigatorRule === "string") {
              return ambient.indexOf(value.navigatorRule) != -1;
            } else if (typeof value.navigatorRule === "function") {
              return value.navigatorRule(ambient);
            }
          }
          return false;
        }
      );
      sdkConfig = filterSdkApiList[0];
    }
    // 若非以上任一配置项，则返回当前环境配置信息
    if (!sdkConfig) {
      sdkConfig = {
        jsPath: "",
        navigatorRule: ambient,
        sdkType: {
          code: "default",
          name: "默认值"
        },
        jsSdk: Defaultjssdk
      };
    }
    console.log("当前环境为:");
    console.log(sdkConfig);
    return sdkConfig;
  }

  // 获取sdk配置文件信息
  async function getSdkApi(config: IJsSdkOption): Promise<IJsSdk> {
    if (!sdkApi) {
      const currentSdkConfig = getCurrentSdkConfig();
      const opt = { ...config, ...{ sdkConfig: currentSdkConfig } };
      sdkApi = createSdkApi(currentSdkConfig.jsSdk, opt);
    }
    await sdkApi.init();
    return sdkApi;
  }

  // 获取SDK类型
  function getSdkType(): IType {
    return getCurrentSdkConfig().sdkType;
  }
  return { getSdkApi, getSdkType };
};
export default SdkApi();
