import type { IType } from "../interface";

interface ISdkType {
  readonly WX_PAY: IType;
  readonly ALI_PAY: IType;
  readonly CLOUN_PAY: IType;
  readonly HAN_APP: IType;
  readonly TOON_APP: IType;
  readonly BOSS_APP: IType;
  readonly DEFAULT: IType;
}

/**
 * sdk类型常量
 */
export const SdkType: ISdkType = {
  /**
   * 微信JsSdk
   */
  WX_PAY: { code: "wxpay", name: "微信" },
  /**
   * 支付宝JsSdk
   */
  ALI_PAY: { code: "alipay", name: "支付宝" },
  /**
   * 云闪付JsSdk
   */
  CLOUN_PAY: { code: "cloudpay", name: "云闪付" },
  /**
   * 大汉JsSdk
   */
  HAN_APP: { code: "hanapp", name: "大汉" },
  /**
   * 思源JsSdk
   */
  TOON_APP: { code: "sensors", name: "思源" },
  /**
   * 博思JsSdk
   */
  BOSS_APP: { code: "bosssoft", name: "博思" },
  /**
   * 默认值配置
   */
  DEFAULT: { code: "default", name: "默认" }
};

/**
 * 结果代码
 */
export const ResultCode = {
  SUCCESS: "1",
  ERROR: "0"
};
