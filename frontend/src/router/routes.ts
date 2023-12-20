import { RouteRecordRaw } from 'vue-router';

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
          const isAuthenticated = sessionStorage.getItem('user-token');
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
    beforeEnter(to, from, next) {
      const role = sessionStorage.getItem('user-role');
      if (!role || role !== 'administrator') {
        next('/403');
      }
      next();
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
    beforeEnter(to, from, next) {
      const role = sessionStorage.getItem('user-role');
      if (!role) {
        next('/403');
      }
      next();
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
          sessionStorage.removeItem('user-token');
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
