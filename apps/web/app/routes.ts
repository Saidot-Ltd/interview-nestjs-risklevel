import { index, type RouteConfig, route } from '@react-router/dev/routes';

export default [index('routes/systems.tsx'), route('login', 'routes/login.tsx')] satisfies RouteConfig;
