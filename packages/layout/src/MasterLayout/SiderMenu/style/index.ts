﻿import { Keyframes } from '@ant-design/cssinjs';
import type { GenerateStyle, ProAliasToken } from '@ant-design/pro-provider';
import { useStyle as useAntdStyle } from '@ant-design/pro-provider';
export interface SiderMenuToken extends ProAliasToken {
  componentCls: string;
  proLayoutCollapsedWidth: number;
}

export const proLayoutTitleHide = new Keyframes('antBadgeLoadingCircle', {
  '0%': { display: 'none', opacity: 0 },
  '80%': {
    display: 'none',
    opacity: 0,
  },
  '100%': {
    display: 'unset',
    opacity: 1,
  },
}) as any;

const genSiderMenuStyle: GenerateStyle<SiderMenuToken> = (token) => {
  return {

    [`${token.componentCls}-pop-wrapper`]: {
      width: '150px !important',
      '--antd-arrow-background-color': '#5f5f66!important',
      paddingBlockStart: `${token?.layout?.header?.heightLayoutHeader ? (token?.layout?.header?.heightLayoutHeader) : 48
        }px!important`,
  
        ['.inner-handle']:{

          backgroundColor:'rgba(255, 255, 255, 0.2)!important'
        },
    
      [`${token.antCls}-menu`]: {
        fontSize: '11px',
        paddingInline: token.layout?.sider?.paddingInlineLayoutMenu,
        maxHeight: `calc(100VH - ${token?.layout?.header?.heightLayoutHeader ? (token?.layout?.header?.heightLayoutHeader + 80) : 48
        }px)`,
        color: `${token.colorWhite} !important`,
        [`${token.antCls}-menu-item-group-title`]: {
          color: `rgba(255, 255, 255, 0.5) !important`,
        },
        [`${token.antCls}-menu-item`]: {
          ['&:hover']: {
            color: `${token.colorWhite} !important`,
            backgroundColor: `rgba(255, 255, 255, 0.2) !important`
          }
        },     

        // rgba(255, 255, 255, 0.2)
      },
      [`${token.antCls}-menu-inline-collapsed`]:{
   
        ['.ant-menu-item']:{
          paddingInline:'16px 16px!important'
        }
       
      },
      [`${token.antCls}-tooltip-inner`]: {
        background: '#5f5f66!important',
        borderRadius: '4px !important',
        paddingLeft:'0px !important',
        paddingRight:'0px !important'

      }
    },

    [`${token.proComponentsCls}-layout`]: {

      [`${token.componentCls}-warp`]: {
        height: `calc(100% - ${token?.layout?.header?.heightLayoutHeader || 48
          }px)`,
        insetBlockStart: `${token?.layout?.header?.heightLayoutHeader || 48
          }px`,
        '&:hover': {


          [`${token.componentCls}-collapsed-button`]: {

            opacity: 1,
            visibility: 'visible'
          }
        },
        ['.sc-first-sider']: {
          [`${token.antCls}-menu-item`]: {
            ["&:hover"]: {
              color: `${token.colorWhite} !important`,
              backgroundColor: `${token.blue} !important`

            },
            color: 'rgba(255, 255, 255, 0.6)'

          },
          [`${token.antCls}-menu-item-active,${token.antCls}-menu-item-selected`]: {
            color: 'rgba(255, 255, 255)',
            backgroundColor: `${token.blue}!important`,
          },

        }
      },
      [token.componentCls]: {
        position: 'relative',
        background: token.layout?.sider?.colorMenuBackground || 'transparent',
        boxSizing: 'border-box',
        '&-menu': {
          position: 'relative',
          zIndex: 10,
          minHeight: '100%',
        },

        [`${token.antCls}-layout-sider-children`]: {
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
       
          paddingBlock: token.layout?.sider?.paddingBlockLayoutMenu,
          borderInlineEnd: `1px solid ${token.colorSplit}`,
          marginInlineEnd: -1,
        },
        [`${token.antCls}-menu`]: {
          paddingInline: token.layout?.sider?.paddingInlineLayoutMenu,
          [`${token.antCls}-menu-item-group-title`]: {
            fontSize: token.fontSizeSM,
            paddingBottom: 4,
          },
          [`${token.antCls}-menu-item:hover`]: {
            // color: token?.layout?.sider?.colorTextMenuItemHover,
          },
        },
        '&-logo': {
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingInline: 12,
          paddingBlock: 16,
          color: token.layout?.sider?.colorTextMenu,
          cursor: 'pointer',
          borderBlockEnd: `1px solid ${token.layout?.sider?.colorMenuItemDivider}`,
          '> a': {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 22,
            fontSize: 22,
            '> img': {
              display: 'inline-block',
              height: 22,
              verticalAlign: 'middle',
            },
            '> h1': {
              display: 'inline-block',
              height: 22,
              marginBlock: 0,
              marginInlineEnd: 0,
              marginInlineStart: 6,
              color: token.layout?.sider?.colorTextMenuTitle,
              fontWeight: 600,
              fontSize: 16,
              lineHeight: '22px',
              verticalAlign: 'middle',
            },
          },
          '&-collapsed': {
            flexDirection: 'column-reverse',
            margin: 0,
            padding: 12,
            [`${token.proComponentsCls}-layout-apps-icon`]: {
              marginBlockEnd: 8,
              fontSize: 16,
              transition: 'font-size 0.2s ease-in-out,color 0.2s ease-in-out',
            },
          },
        },
        '&-actions': {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBlock: 4,
          marginInline: 0,
          color: token.layout?.sider?.colorTextMenu,
          '&-collapsed': {
            flexDirection: 'column-reverse',
            paddingBlock: 0,
            paddingInline: 8,
            fontSize: 16,
            transition: 'font-size 0.3s ease-in-out',
          },
          '&-list': {
            color: token.layout?.sider?.colorTextMenuSecondary,
            '&-collapsed': {
              marginBlockEnd: 8,
              animationName: 'none',
            },
            '&-item': {
              paddingInline: 6,
              paddingBlock: 6,
              lineHeight: '16px',
              fontSize: 16,
              cursor: 'pointer',
              borderRadius: token.borderRadius,
              '&:hover': {
                background: token.colorBgTextHover,
              },
            },
          },
          '&-avatar': {
            fontSize: 14,
            paddingInline: 8,
            paddingBlock: 8,
            display: 'flex',
            alignItems: 'center',
            gap: token.marginXS,
            borderRadius: token.borderRadius,
            '& *': {
              cursor: 'pointer',
            },
            '&:hover': {
              background: token.colorBgTextHover,
            },
          },
        },
        '&-hide-menu-collapsed': {
          insetInlineStart: `-${token.proLayoutCollapsedWidth - 12}px`,
          position: 'absolute',
        },

        '&-extra': {
          marginBlockEnd: 16,
          marginBlock: 0,
          marginInline: 16,
          '&-no-logo': {
            marginBlockStart: 16,
          },
        },
        '&-links': {
          width: '100%',
          ul: {
            height: 'auto',
          },
        },
        '&-link-menu': {
          border: 'none',
          boxShadow: 'none',
          background: 'transparent',
        },
        '&-footer': {
          color: token.layout?.sider?.colorTextMenuSecondary,
          paddingBlockEnd: 16,
          fontSize: token.fontSize,
          animationName: proLayoutTitleHide,
          animationDuration: '.3s',
          animationTimingFunction: 'ease',
        },
      },
      [`${token.componentCls}${token.componentCls}-fixed`]: {
        position: 'fixed',
        insetBlockStart: 0,
        insetInlineStart: 0,
        zIndex: '100',
        height: '100%',
        '&-mix': {
          height: `calc(100% - ${token?.layout?.header?.heightLayoutHeader || 48
            }px)`,
          insetBlockStart: `${token?.layout?.header?.heightLayoutHeader || 48
            }px`,
        },
      },
    },
  };
};

export function useStyle(
  prefixCls: string,
  {
    proLayoutCollapsedWidth,
  }: {
    proLayoutCollapsedWidth: number;
  },
) {
  return useAntdStyle('ProLayoutSiderMenu', (token) => {
    console.log("token", token)
    const siderMenuToken: SiderMenuToken = {
      ...token,
      componentCls: `.${prefixCls}`,
      proLayoutCollapsedWidth,
    };

    return [genSiderMenuStyle(siderMenuToken)];
  });
}
