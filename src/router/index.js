import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
import ChannelList from '../views/ChannelList.vue'
import Channel from '../views/Channel.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/channels',
    name: 'ChannelList',
    component: ChannelList
  },
  {
    path: '/channels/:id',
    name: 'Channel',
    component: Channel,
    props: true
  }
  // {
  //   path: '/channels',
  //   name: 'Channels',
  //   // route level code-splitting
  //   // this generates a separate chunk (about.[hash].js) for this route
  //   // which is lazy-loaded when the route is visited.
  //   component: () =>
  //     import(/* webpackChunkName: "channels" */ '../views/Channels.vue')
  // }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
