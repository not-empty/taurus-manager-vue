import { RouteRecordRaw } from 'vue-router';
import Cookies from 'js-cookie';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/TaurusLoginLayout.vue'),
    children: [
      { path: 'login', redirect: '/' },
      {
        path: '',
        component: () => import('pages/LoginPage.vue'),
        beforeEnter: (to, from, next) => {
          const isAuthenticated = Cookies.get('isLogged');
          if (isAuthenticated) {
            next('/view/dashboard');
          } else {
            next();
          }
        }
      }
    ]
  },
  {
    path: '/403',
    component: () => import('pages/ErrorForbidden.vue')
  },
  {
    path: '/manager',
    component: () => import('layouts/TaurusLayout.vue'),
    beforeEnter: (to, from, next) => {
      const isAuthenticated = Cookies.get('isLogged');
      if (!isAuthenticated) {
        next('/login');
      } else {
        next();
      }
    },
    children: [
      { path: '', redirect: '/manager/groups' },
      { path: 'groups', component: () => import('pages/GroupsPage.vue') },
      { path: 'queues', component: () => import('pages/QueuesPage.vue') },
      { path: 'users', component: () => import('pages/UsersPage.vue') }
    ],
    meta: { requiresAuth: true }
  },
  {
    path: '/view',
    component: () => import('layouts/TaurusLayout.vue'),
    beforeEnter: (to, from, next) => {
      const isAuthenticated = Cookies.get('isLogged');
      if (!isAuthenticated) {
        next('/login');
      } else {
        next();
      }
    },
    children: [
      { path: '', redirect: '/view/dashboard' },
      {
        path: 'dashboard',
        component: () => import('pages/ViewDashboardPage.vue')
      },
      {
        path: 'group/:uuid',
        component: () => import('pages/ViewGroupPage.vue')
      },
      {
        path: 'queue/:uuid',
        component: () => import('pages/ViewQueuePage.vue')
      },
      {
        path: 'monitor',
        component: () => import('pages/ViewMonitorPage.vue')
      },
      {
        path: 'logout',
        component: {
          template: '<div></div>'
        },
        beforeEnter(to, from, next) {
          Cookies.remove('isLogged');
          next('/login');
        }
      }
    ],
    meta: { requiresAuth: true }
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
];

export default routes;
