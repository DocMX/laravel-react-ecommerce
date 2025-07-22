import { PageProps as InertiaPageProps } from '@inertiajs/core';
import { AxiosInstance } from 'axios';
import type { Config, Router, ValidRouteName, RouteParams, ParameterValue } from 'ziggy-js';


declare global {
  interface Window {
    axios: AxiosInstance;
    Ziggy: Config;
    route: {
      (): Router;
      <T extends ValidRouteName>(name: T, params?: RouteParams<T>, absolute?: boolean, config?: Config): string;
      <T extends ValidRouteName>(name: T, params?: ParameterValue, absolute?: boolean, config?: Config): string;
    };
  }

  const route: Window['route'];
}

declare module '@inertiajs/core' {
  interface PageProps extends InertiaPageProps {
    [key: string]: unknown;
  }
}