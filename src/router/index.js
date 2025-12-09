import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const routes = [
  {
    path: '/',
    name: 'Landing',
    component: () => import('@/views/LandingPage.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/Dashboard.vue'),
    meta: { requiresAuth: true }
  },
  // Management routes
  {
    path: '/management/documents',
    name: 'DocumentManagement',
    component: () => import('@/views/management/DocumentManagement.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/management/project',
    name: 'Project',
    component: () => import('@/views/management/Project.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/management/glossary',
    name: 'Glossary',
    component: () => import('@/views/management/Glossary.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/management/schedule',
    name: 'Schedule',
    component: () => import('@/views/management/Schedule.vue'),
    meta: { requiresAuth: true }
  },
  // Conversation routes
  {
    path: '/conversation/scenario',
    name: 'Scenario',
    component: () => import('@/views/conversation/Scenario.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/conversation/practice/:scenarioId',
    name: 'Practice',
    component: () => import('@/views/conversation/Practice.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/conversation/expression',
    name: 'Expression',
    component: () => import('@/views/conversation/Expression.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/conversation/mistakes',
    name: 'Mistakes',
    component: () => import('@/views/conversation/Mistakes.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/conversation/speaking-tutor',
    name: 'SpeakingTutor',
    component: () => import('@/views/conversation/SpeakingTutor.vue'),
    meta: { requiresAuth: true }
  },
  // Translation routes
  {
    path: '/translation/text',
    name: 'TextTranslation',
    component: () => import('@/views/translation/Text.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/translation/voice',
    name: 'VoiceTranslation',
    component: () => import('@/views/translation/Voice.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/translation/video',
    name: 'VideoTranslation',
    component: () => import('@/views/translation/Video.vue'),
    meta: { requiresAuth: true }
  },
  // Collaboration routes
  {
    path: '/collaboration/mail',
    name: 'Mail',
    component: () => import('@/views/collaboration/Mail.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/collaboration/messenger',
    name: 'Messenger',
    component: () => import('@/views/collaboration/Messenger.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/collaboration/messenger/slack/callback',
    name: 'SlackCallback',
    component: () => import('@/views/collaboration/SlackCallback.vue'),
    meta: { requiresAuth: true }
  }
  // Settings route removed - UserProfileModal is now used for settings
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Navigation guards
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();

  // Check token from localStorage
  const token = localStorage.getItem('token');
  const isAuthenticated = !!token && authStore.isAuthenticated;

  if (to.meta.requiresAuth && !isAuthenticated) {
    // Redirect to login if route requires auth and user is not authenticated
    next('/login');
  } else if (to.meta.requiresGuest && isAuthenticated) {
    // Redirect to dashboard if route is for guests only and user is authenticated
    next('/dashboard');
  } else {
    next();
  }
});

export default router;
