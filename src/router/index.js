import Vue from 'vue'
import VueRouter from 'vue-router'
// import Home from '../components/Home.vue'
// import Login from '../components/Login.vue'
// import Welcome from '../components/Welcome.vue'
// import Users from '../components/user/users.vue'
// import Rights from '../components/power/rights.vue'
// import Roles from '../components/power/roles.vue'
// import Cate from '../components/goods/cate.vue'
// import List from '../components/goods/list.vue'
// import Params from '../components/goods/params.vue'
// import Add from '../components/goods/add.vue'
// import Order from '../components/order/Order.vue'
// import Report from '../components/report/report.vue'


// 路由懒加载
const Login = () => import(/* webpackChunkName: "Login_Home_Welcome" */ '../components/Login.vue')
const Home = () => import(/* webpackChunkName: "Login_Home_Welcome" */ '../components/Home.vue')
const Welcome = () => import(/* webpackChunkName: "Login_Home_Welcome" */ '../components/Welcome.vue')

const Users = () => import(/* webpackChunkName: "Users_Rights_Roles" */ '../components/user/users.vue')
const Rights = () => import(/* webpackChunkName: "Users_Rights_Roles" */ '../components/power/rights.vue')
const Roles = () => import(/* webpackChunkName: "Users_Rights_Roles" */ '../components/power/roles.vue')

const Cate = () => import(/* webpackChunkName: "Cate_Params" */ '../components/goods/cate.vue')
const Params = () => import(/* webpackChunkName: "Cate_Params" */ '../components/goods/params.vue')

const List = () => import(/* webpackChunkName: "GoodsList_Add" */ '../components/goods/list.vue')
const Add = () => import(/* webpackChunkName: "GoodsList_Add" */ '../components/goods/add.vue')

const Order = () => import(/* webpackChunkName: "Order_Report" */ '../components/order/Order.vue')
const Report = () => import(/* webpackChunkName: "Order_Report" */ '../components/report/report.vue')

Vue.use(VueRouter)
//解决在使用ElementUI中的导航时，默认情况下如果重复点击某选项，会报错。
const originalPush = VueRouter.prototype.push
VueRouter.prototype.push = function push(location) {
  return originalPush.call(this, location).catch(err => err)
}

  const routes = [
	{path:'/login',component:Login},
	{path:'/home',component:Home,redirect:'/welcome',
	children:[
		{path:'/welcome',component:Welcome},
		{path:'/users',component:Users},
		{path:'/rights',component:Rights},
		{path:'/roles',component:Roles},
		{path:'/categories',component:Cate},
		{path:'/goods',component:List},
		{path:'/params',component:Params},
		{path:'/goods/add',component:Add},
		{path:'/orders',component:Order},
		{path:'/reports',component:Report}
	]
	},
	{path:'/',redirect:'/login'}
	
]

const router = new VueRouter({
  routes
})
router.beforeEach((to,from,next) => {
	if(to.path === '/login') return next()
	const tokenStr = window.sessionStorage.getItem('token');
	if(!tokenStr) return next('/login')
	next()
})
export default router
