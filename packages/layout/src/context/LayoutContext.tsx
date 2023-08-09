
import { Ref, createContext } from 'react';
export type LayoutContextType = {
  //  hasTable?: number,
    //setHasTable?: React.Dispatch<React.SetStateAction<number>>;
    //pageContainerHeight?: number;
    //setPageContainerHeight?: React.Dispatch<React.SetStateAction<number>>;

    pageContainer?:React.MutableRefObject<HTMLDivElement>
}


export const LayoutContext: React.Context<LayoutContextType> = createContext({});
