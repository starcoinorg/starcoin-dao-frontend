import React from 'react';

declare function Provider(this: any, appInfo: any, props: any) : Promise<{
    render: (appInfo: any) => any;
    destroy: (appInfo: any) => any;
}>

declare interface IApp {
    name: string,
    activeWhen: string,
    provider: Provider
}

declare interface IDAO {
    name: string,
    address: string, 
    registerApp(app: IApp)
}