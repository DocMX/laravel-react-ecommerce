import { createInertiaApp } from '@inertiajs/react';
import createServer from '@inertiajs/react/server';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import ReactDOMServer from 'react-dom/server';
import {
  route as ziggyRoute,
  Config,
  RouteParams,
  ValidRouteName,
  Router,
  ParameterValue,
} from 'ziggy-js';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createServer((page) => {
  const ziggyConfig = (page.props as { ziggy: Config & { location: string } }).ziggy;

  // Implementación type-safe con manejo explícito de parámetros
  const route = ((...args: unknown[]): string | Router => {
    if (args.length === 0) {
      return ziggyRoute();
    }

    const [name, params, absolute, config] = args as [
      ValidRouteName,
      RouteParams<ValidRouteName> | ParameterValue | undefined,
      boolean | undefined,
      Config | undefined
    ];

    const mergedConfig = {
      ...ziggyConfig,
      ...config,
      location: new URL(ziggyConfig.location),
    };

    // Manejo diferenciado de tipos de parámetros
    if (params === undefined || typeof params === 'string' || typeof params === 'number' || Array.isArray(params)) {
      return ziggyRoute(name, params as ParameterValue | undefined, absolute, mergedConfig);
    }

    return ziggyRoute(name, params as RouteParams<ValidRouteName>, absolute, mergedConfig);
  }) as {
    (): Router;
    <T extends ValidRouteName>(name: T, params?: RouteParams<T>, absolute?: boolean, config?: Config): string;
    <T extends ValidRouteName>(name: T, params?: ParameterValue, absolute?: boolean, config?: Config): string;
  };

  // Asignación type-safe al globalThis
  (globalThis as typeof globalThis & { route: typeof route }).route = route;

  return createInertiaApp({
    page,
    render: ReactDOMServer.renderToString,
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
      resolvePageComponent(
        `./Pages/${name}.tsx`,
        import.meta.glob('./Pages/**/*.tsx')
      ),
    setup: ({ App, props }) => {
      return <App {...props} />;
    },
  });
});