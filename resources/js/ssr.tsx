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
  ParameterValue
} from 'ziggy-js';

// Extensión segura para globalThis
declare global {
  interface Global {
    route: typeof ziggyRoute;
  }
}

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createServer((page) =>
  createInertiaApp({
    page,
    render: ReactDOMServer.renderToString,
    title: (title) => `${title} - ${appName}`,
    resolve: (name: string) =>
      resolvePageComponent(
        `./Pages/${name}.tsx`,
        import.meta.glob('./Pages/**/*.tsx')
      ),
    setup: ({ App, props }) => {
      type InertiaPageProps = {
        props: {
          ziggy: Config & { location: string };
        };
      };

      const typedPage = page as unknown as InertiaPageProps;

      // Implementación exacta de todas las firmas de ziggyRoute
      const customRoute: {
        (): Router;
        <T extends ValidRouteName>(name: T, params?: RouteParams<T>, absolute?: boolean, config?: Config): string;
        <T extends ValidRouteName>(name: T, params?: ParameterValue, absolute?: boolean, config?: Config): string;
      } = ((name?: ValidRouteName, params?: unknown, absolute?: boolean, config?: Config) => {
        if (!name) {
          return ziggyRoute();
        }

        const ziggyConfig = {
          ...typedPage.props.ziggy,
          ...config,
          location: new URL(typedPage.props.ziggy.location),
        };

        return ziggyRoute(name, params, absolute, ziggyConfig) as string;
      }) as unknown;

      (globalThis as unknown).route = customRoute;

      return <App {...props} />;
    },
  })
);