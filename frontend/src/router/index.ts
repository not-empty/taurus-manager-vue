import { createRouter, createWebHistory } from 'vue-router';
import { useSessionStore } from '@/stores/session';
import type { RouteRecordRaw } from 'vue-router';
import Cookies from 'js-cookie';


// Layouts
import DefaultLayout from '@/layouts/DefaultLayout.vue';
import GuestLayout from '@/layouts/GuestLayout.vue';

// Login
import LoginPage from "@/pages/LoginPage.vue";

// view
import DashboardPage from "@/pages/view/DashboardPage.vue";
import MonitorPage from "@/pages/view/MonitorPage.vue";
import QueuePage from '@/pages/view/QueuePage.vue';

// manager
import UsersPage from "@/pages/manager/UsersPage.vue";
import GroupsPage from "@/pages/manager/GroupsPage.vue";
import QueuesPage from "@/pages/manager/QueuesPage .vue";


import { roleValidateMiddleware, sessionMiddleware } from './middleware/sessionMiddleware';
import GroupPage from '@/pages/view/GroupPage.vue';
import ImportQueuesPage from '@/pages/manager/ImportQueuesPage.vue';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: () => {
      if (Cookies.get('isLogged')) {
        return '/'
      }
      return '/login'
    }
  },
  {
    path: "/login",
    component: GuestLayout,
    children: [
      {
        path: "",
        name: "LoginPage",
        component: LoginPage,
      },
    ]
  },
  {
    path: '/logout',
    component: {
      template: '<div></div>',
    },
    beforeEnter(_to, _from, next) {
      let redirect = '/login';

      const sessionStore = useSessionStore();

      sessionStore.logout();
      Cookies.remove('isLogged');

      next(redirect);
    },
  },
  {
    path: "",
    component: DefaultLayout,
    beforeEnter: [
      sessionMiddleware,
      roleValidateMiddleware('guest'),
    ],
    children: [
      {
        path: '',
        component: DashboardPage,
      },
      {
        path: 'monitor',
        component: MonitorPage,
      },
      {
        path: 'queue/:id',
        component: QueuePage,
      },
      {
        path: 'group/:id',
        component: GroupPage,
      }
    ]
  },
  {
    path: '/manager',
    component: DefaultLayout,
    beforeEnter: [
      sessionMiddleware,
      roleValidateMiddleware('administrator'),
    ],
    children: [
      { path: '', redirect: '/manager/users' },
      { path: 'users', component: UsersPage },
      { path: 'groups', component: GroupsPage },
      { path: 'queues', component: QueuesPage },
      { path: 'queues/import', component: ImportQueuesPage },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  linkExactActiveClass: "active",
  routes: routes,
  scrollBehavior() {
    return { top: 0, behavior: "smooth" };
  },
});

export default router;