declare module 'ziggy-js' {
  interface RouteParams {
    [key: string]: unknown;
  }

  interface Config {
    routes: Record<string, {
      uri: string;
      methods: string[];
      domain?: string;
    }>;
    url: string;
    port?: number | string;
    defaults: RouteParams;
    location?: string;
  }

  interface Router {
    (name: string, params?: RouteParams, absolute?: boolean, config?: Config): string;
    config: Config;
  }

  const route: Router;
  export default route;
  export { Config };
}

