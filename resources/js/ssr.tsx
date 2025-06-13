import { createInertiaApp } from '@inertiajs/react';
import createServer from '@inertiajs/react/server';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import ReactDOMServer from 'react-dom/server';
import route from 'ziggy-js';




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

      global.route = (
        name: string,
        params?: Record<string, unknown>,
        absolute?: boolean
      ) =>
        route(name, params, absolute, {
          ...page.props.ziggy,
          location: String(page.props.ziggy.location), // forzamos a string
        });

      return <App {...props} />;
    },
  })
);
