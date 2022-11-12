import React from 'react';
import { IconType } from 'react-icons';
import { Dict } from "@chakra-ui/utils";

declare function Provider(this: any, appInfo: any, props: any) : Promise<{
    render: (appInfo: any) => any;
    destroy: (appInfo: any) => any;
}>

declare interface IApp {
    name: string,
    activeWhen: string,
    icon: string | IconType | undefined,
    provider: Provider
}

declare interface IAction {
    name: string,
    execute: (params: any) => Promise<string>;
}

declare interface IDaoPluginContext {
    name: string,
    address: string, 
    daoType: string,
    theme?: Dict;
    registerApp(app: IApp);
    registerAction(action: IAction);
}