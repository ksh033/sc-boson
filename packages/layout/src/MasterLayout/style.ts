import { ProTokenType } from "@ant-design/pro-provider"

declare type DeepPartial<T> = T extends object ? {
    [P in keyof T]?: DeepPartial<T[P]>;
} : T;
const TopLayoutToket: DeepPartial<ProTokenType["layout"]> = {
    //  colorSplit: '#001529',
    header: {
        colorBgHeader: "#FFF",
        colorHeaderTitle: "000",
        colorBgMenuItemHover: "#1890ff",
        colorBgMenuItemSelected: "transparent",
        colorTextMenuSelected: "#1890ff",
        colorTextMenuActive: "#1890ff",
        colorTextMenu: "rgba(0, 0, 0, 0.85)",
        colorTextMenuSecondary: "rgba(0, 0, 0, 0.85)",
        colorBgRightActionsItemHover: "rgba(0, 0, 0, 0.85)",
        colorTextRightActionsItem: "rgba(0, 0, 0, 0.85)",
        heightLayoutHeader: 48,
    },
    radiusBase: 0,
    bgLayout: '#f0f2f5;',
    pageContainer: {
        marginBlockPageContainerContent: 18,
        marginInlinePageContainerContent: 18,

    },
    sider: {

        paddingInlineLayoutMenu: 0,
        paddingBlockLayoutMenu: 0,
        colorBgCollapsedButton: '#fff',
        colorTextCollapsedButtonHover: 'rgba(0,0,0,0.65)',
        colorTextCollapsedButton: 'rgba(0,0,0,0.45)',
        colorMenuBackground: '#001529',
        colorBgMenuItemCollapsedHover: 'rgba(0,0,0,0.06)',
        colorBgMenuItemCollapsedSelected: '#1890ff',
        colorMenuItemDivider: 'rgba(255,255,255,0.15)',
        colorBgMenuItemHover: 'rgba(0,0,0,0.06)',
        colorBgMenuItemSelected: '#1890ff',
        colorTextMenuSelected: '#fff',
        colorTextMenu: 'rgba(255,255,255,0.75)',
        colorTextMenuSecondary: 'rgba(255,255,255,0.65)',
        colorTextMenuTitle: 'rgba(255,255,255,0.95)',
        colorTextMenuActive: 'rgba(255,255,255,0.95)',
        colorTextSubMenuSelected: '#fff',
    }
}



export {
    TopLayoutToket,
}