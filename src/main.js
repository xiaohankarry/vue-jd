import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './assets/css/coment.css'
import './plugins/element.js'
// 导入表格树
import TreeTable from 'vue-table-with-tree-grid'

import axios from 'axios'

import VueQuillEditor from 'vue-quill-editor' // 调用富文本编辑器
import 'quill/dist/quill.core.css' 
 import 'quill/dist/quill.snow.css' 
import 'quill/dist/quill.bubble.css' 
// 导入NProgress, 包对应的JS和CSS
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
// //配置请求根路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
//这里是利用axios的一个方法给我们的头部追加一个Authorization值是token
axios.interceptors.request.use(config => {
	config.headers.Authorization = window.sessionStorage.getItem('token')
	return config
})
// response 拦截器中,  隐藏进度条NProgress.done()
axios.interceptors.response.use(config => {
  NProgress.done()
  return config
})
Vue.prototype.$http = axios
Vue.config.productionTip = false
// 组件全局注册 表格树
Vue.component('tree-table', TreeTable)
//导入
Vue.use(VueQuillEditor)
//全局注册过滤器
Vue.filter('dateFormat',function(originVal){
const dt = new Date(originVal)

const y = dt.getFullYear()
const m = (dt.getMonth() + 1 + '').padStart(2,'0')
const d = (dt.getDate() + '').padStart(2,'0')

const hh = (dt.getHours() + '').padStart(2,'0')
const mm = (dt.getMinutes() + '').padStart(2,'0')
const ss = (dt.getSeconds() + '').padStart(2,'0')

return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
