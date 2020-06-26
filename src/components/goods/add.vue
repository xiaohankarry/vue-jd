<template>
	<div>
		<el-breadcrumb separator-class="el-icon-arrow-right">
		  <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
		  <el-breadcrumb-item>商品管理</el-breadcrumb-item>
		  <el-breadcrumb-item>添加商品</el-breadcrumb-item>
		</el-breadcrumb>
		<!-- 卡片视图 -->
		<el-card>
			<!-- 消息提示 -->
			 <el-alert
			    title="添加商品信息"
			    type="info"
			    center
			    show-icon
				:closable='false'>
			  </el-alert>
			  <!-- 步骤区 -->
			  <el-steps :space="200" :active="activeIndex - 0" finish-status="success" align-center>
			    <el-step title="基本信息"></el-step>
			    <el-step title="商品参数"></el-step>
			    <el-step title="商品属性"></el-step>
			    <el-step title="商品图片"></el-step>
			    <el-step title="商品内容"></el-step>
			    <el-step title="完成"></el-step>
			  </el-steps>
			  <!-- 标签栏 -->
			  <el-form :model="addForm" :rules="addFormrules" ref="addFormRef" label-width="100px" label-position='top'>
			   <el-tabs :tab-position="'left'" v-model='activeIndex' :before-leave='beforeLeaveTab' @tab-click='tabClicked'>
			      <el-tab-pane label="基本信息" name='0'>
					  <el-form-item label="商品名称" prop="goods_name">
					      <el-input v-model="addForm.goods_name"></el-input>
					  </el-form-item>
					  <el-form-item label="商品价格" prop="goods_price">
						  <el-input v-model="addForm.goods_price" type='number'></el-input>
					  </el-form-item>
					  <el-form-item label="商品重量" prop="goods_weight">
						  <el-input v-model="addForm.goods_weight" type='number'></el-input>
					  </el-form-item>
					  <el-form-item label="商品数量" prop="goods_number">
						  <el-input v-model="addForm.goods_number" type='number'></el-input>
					  </el-form-item>
					  <el-form-item label='商品分类' prop='goods_cat'>
						  <el-cascader
						      v-model="addForm.goods_cat"
						      :options="catelist"
						      :props="cateProps"
						      @change="handleChange"></el-cascader>
					  </el-form-item>
				  </el-tab-pane>
			      <el-tab-pane label="商品参数" name='1'>
					  <el-form-item 
					  v-for='item in manyTableData'
					  :key = 'item.attr_id'
					  :label = 'item.attr_name'
					  >
					  <el-checkbox-group v-model="item.attr_vals">
					      <el-checkbox :label="cb" v-for='(cb,i) in item.attr_vals'
						  :key='i' border></el-checkbox>
					    </el-checkbox-group>
					  </el-form-item>
				  </el-tab-pane>
			      <el-tab-pane label="商品属性" name='2'>
					  <el-form-item
					  :label='item.attr_name'
					  v-for='item in onlyTableData'
					  :key='item.attr_id'
					  >
					  <el-input v-model='item.attr_vals'></el-input>
					  </el-form-item>
				  </el-tab-pane>
			      <el-tab-pane label="商品图片" name='3'>
					  <!-- action是上传到的地址 -->
					  <el-upload
					    :action="uploadUrl"
					    :on-preview="handlePreview"
					    :on-remove="handleRemove"
					    list-type="picture"
						:headers="headerObj"
						:on-success='handleSuccess'>
					    <el-button size="small" type="primary">点击上传</el-button>
					    <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
					  </el-upload>
				  </el-tab-pane>
			      <el-tab-pane label="商品内容" name='4'>
					  <!-- 富文本 编辑器组件-->
					  <quill-editor v-model='addForm.goods_introduce'></quill-editor>
					  <!-- 添加商品按钮 -->
					  <el-button type='primary' class='button' @click='add'>添加商品</el-button>
				  </el-tab-pane>
			    </el-tabs>
			</el-form>
		</el-card>
		<!-- 图片预览 -->
		<el-dialog
		  title="图片预览"
		  :visible.sync="previewShow"
		  width="50%"
		  >
		  <img :src='previewPath' alt="" class="preivewimg"/>
		</el-dialog>
	</div>
</template>

<script>
	import _ from 'lodash'
	export default {
		data(){
			return {
				activeIndex:'0',
				//
				addForm:{
					goods_name:'',
					goods_price:0,
					goods_number:0,
					goods_weight:0,
					//商品所属的分类数组
					goods_cat:[],
					//图片数组
					pics:[],
					//商品的详情描述
					goods_introduce:'',
					attrs:[]
				},
				addFormrules:{
					goods_name:[ 
						{ required: true, message: '请输入商品名称', trigger: 'blur' },
						],
					goods_price:[
						{ required: true, message: '请输入商品价格', trigger: 'blur' },
					],
					goods_number:[
						{ required: true, message: '请输入商品数量', trigger: 'blur' },
					],
					goods_weight:[
						{ required: true, message: '请输入商品重量', trigger: 'blur' },
					],
					goods_cat:[
						{ required: true, message: '请输入商品分类', trigger: 'blur' },
					],
				},
			//商品分类列表
			catelist:[],
			//配置
			cateProps:{
				expandTrigger: 'hover',
				value:'cat_id',
				label:'cat_name',
				children:'children'
			},
			manyTableData:[],
			onlyTableData:[],
			uploadUrl:'http://127.0.0.1:8888/api/private/v1/upload',
			headerObj:{
				Authorization:window.sessionStorage.getItem('token')
			},
			previewPath:'',
			previewShow:false
			}
			
	},
	created(){
		this.getCatelist()
	},
	methods:{
		getCatelist(){
			this.$http.get('categories').then(
				res => {
					this.catelist = res.data.data
				}
			)
		},
		//级联选择器选中变化，会触发这个函数
		handleChange(){
			if(this.addForm.goods_cat.length !==3 ){
				this.addForm.goods_cat = []
			}
		},
		beforeLeaveTab(activeName,oldActiveName){
			if(this.addForm.goods_cat.length !== 3 ){
				this.$message.error('请选择商品分类')
				return false
			}
		},
		tabClicked(){
			//证明访问的是动态面板
			if(this.activeIndex === '1'){
				this.$http.get(`categories/${this.cateId}/attributes`,
				{params:{sel:'many'}}).then(
					res => {
						console.log(res)
						res.data.data.forEach(item => {
							item.attr_vals =
							item.attr_vals.length === 0 ? [] : 
							item.attr_vals.split(',')
						})
						this.manyTableData = res.data.data 
					}
				)
			}
			if(this.activeIndex === '2'){
				this.$http.get(`categories/${this.cateId}/attributes`,
				{params:{sel:'only'}}).then(
					res => {
						this.onlyTableData = res.data.data
					}
				)
			}
			if(this.activeIndex === '3'){}
			if(this.activeIndex === '4'){}
		},
		//图片预览
		handlePreview(file){
			this.previewPath = file.response.data.url
			this.previewShow = true
		},
		//图片移出
		handleRemove(file){
			//1.获取要删除的图片临时路径
			const filePath = file.response.data.tmp_path
			//2.从pics数组中，找到这个图片对应的索引
		const i = this.addForm.pics.findIndex(x => x.pic === filePath)
			//3.调用数组中的splice方法，把图片信息对象，从pics中移出
		this.addForm.pics.splice(i,1)
		},
		//监听图片上传成功事件
		handleSuccess(response){
			//1.拼接得到一个图片信息对象
			console.log(response.data)
			const picInfo = {pic:response.data.tmp_path}
			//将图片信息对象。放pics
			this.addForm.pics.push(picInfo)
			console.log(this.addForm.pics)
		},
		add(){
			//预验证
			this.$refs.addFormRef.validate(valid => {
				if(!valid){
					return this.$message.error('error,请填写必要的商品信息')
				}
				const form = _.cloneDeep(this.addForm)
				form.goods_cat = form.goods_cat.join(',')
				//处理动态属性
				this.manyTableData.forEach(item => {
					const newInfo = {attr_id:item.attr_id,
					attr_value:item.attr_vals.join(' ')}
					this.addForm.attrs.push(newInfo)
				})
				//处理静态属性
				this.onlyTableData.forEach(item => {
					const newInfo = {attr_id:item.attr_id,
					attr_value:item.attr_vals.join}
					this.addForm.attrs.push(newInfo)
				})
				form.attrs = this.addForm.attrs
				console.log(form)
				this.$http.post('goods',form).then(
					res => {
						this.$message.success('success')
						this.$router.push('/goods')
					}
				)
			})
		}
	},
	computed:{
		cateId(){
			if(this.addForm.goods_cat.length === 3){
				return this.addForm.goods_cat[2]
			}
			return null
		}
	}
	}
</script>

<style lang="less" scoped>
	.el-checkbox{
		margin: 0 9px 0 0 !important;
	}
	.preivewimg{
		width: 100%;
	}
	.button{
		margin-top: 15px;
	}
</style>
