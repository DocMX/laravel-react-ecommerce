import type { Config, RouteParams, ValidRouteName, Router, ParameterValue } from 'ziggy-js';

export type ZiggyRouteFn = {
  (): Router;
  (name: undefined, params: undefined, absolute?: boolean, config?: Config): Router;
  <T extends ValidRouteName>(name: T, params?: RouteParams<T>, absolute?: boolean, config?: Config): string;
  <T extends ValidRouteName>(name: T, params?: ParameterValue, absolute?: boolean, config?: Config): string;
};