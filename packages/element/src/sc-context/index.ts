import React from 'react'
export const ContainerContext = React.createContext<{

    extraHeight?:number,
    type?:'dialog'| 'drawer' | 'page'
    domRef?:React.RefObject<HTMLElement>

}>({});

export default{

    ContainerContext

}