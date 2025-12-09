import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '@/views/LoginView.vue'
import GroupView from '../views/GroupView.vue'
import FriendingView from '../views/FriendingView.vue'
import HomeView from '@/views/challenges/HomeView.vue'
import ChallengeView from '@/views/challenges/ChallengeView.vue'
import ChallengeCreatorView from '@/views/challenges/ChallengeCreatorView.vue'
import ChallengeParticipantView from '@/views/challenges/ChallengeParticipantView.vue'
import ChallengeInviteeView from '@/views/challenges/ChallengeInviteeView.vue'
import CreateChallengeView from '@/views/challenges/CreateChallengeView.vue'
import leaderboardView from '@/views/leaderboardView.vue'
import RequestsView from '@/views/challenges/RequestsView.vue'
import ManageView from '@/views/challenges/ManageView.vue'
import ProgressView from '@/views/challenges/ProgressView.vue'
import FriendsView from '../views/FriendsView.vue'
import VerificationApproverView from '@/views/challenges/VerificationApproverView.vue'
import VerificationRequesterView from '@/views/challenges/VerificationRequesterView.vue'
import CreateVerificationRequestView from '@/views/challenges/CreateVerificationRequestView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue'),
    },
    {
      path: '/group',
      name: 'group',
      component: GroupView,
    },
    {
      path: '/network',
      name: 'friending',
      component: FriendingView,
    },
    {
      path: '/friends',
      name: 'friends',
      component: FriendsView,
    },
    { path: '/requests', name: 'requests', component: RequestsView },
    { path: '/progress', name: 'progress', component: ProgressView },
    { path: '/manage', name: 'manage', component: ManageView },
    {
      path: '/challenge/:challenge',
      component: ChallengeView, // parent wrapper
      children: [
        { path: 'participant', component: ChallengeParticipantView },
        { path: 'invitee', component: ChallengeInviteeView },
        { path: 'creator', component: ChallengeCreatorView },
        { path: 'createVerification', component: CreateVerificationRequestView },
        { path: 'requester', component: VerificationRequesterView },
        { path: 'approver', component: VerificationApproverView },
      ],
    },
    {
      path: '/create',
      name: 'create challenge',
      component: CreateChallengeView,
    },
    {
      path: '/leaderboard',
      name: 'leaderboard',
      component: leaderboardView,
    },
  ],
})

export default router
