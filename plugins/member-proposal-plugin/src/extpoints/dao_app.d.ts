import React from 'react';
import { IconType } from 'react-icons';

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

declare interface IDAO {
    name: string,
    address: string, 
    daoType: string,
    registerApp(app: IApp)
    registerAction(action: IAction)
}