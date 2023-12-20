import { route } from 'quasar/wrappers';
import {
  createRouter,
  createWebHistory,
  createWebHashHistory,
  createMemoryHistory,
} from 'vue-router';
import routes from './routes';

export default route(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === 'history'
    ? createWebHistory
    : createWebHashHistory;

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,
    history: createHistory(process.env.VUE_ROUTER_BASE),
  });

  Router.beforeEach((to, from, next) => {
    const isAuthenticated = sessionStorage.getItem('user-token');

    if (to.meta.requiresAuth && !isAuthenticated) {
      next({ path: '/login' });
    } else {
      next();
    }
  });

  return Router;
});
