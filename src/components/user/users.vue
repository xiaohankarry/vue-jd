<template>
	<div>
		<!-- 面包屑导航 -->
		<el-breadcrumb separator-class="el-icon-arrow-right">
		  <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
		  <el-breadcrumb-item>用户管理</el-breadcrumb-item>
		  <el-breadcrumb-item>用户列表</el-breadcrumb-item>
		</el-breadcrumb>
		<!-- 卡片 -->
		<el-card>
			<!-- 搜索与添加区域 -->
			  <el-row :gutter='10'>
				  <el-col :span='9'>
					  <el-input placeholder="请输入内容" v-model='queryInfo.query' clearable @clear='getUserList'>
					     <el-button slot="append" icon="el-icon-search" @click='getUserList'></el-button>
					   </el-input>
				  </el-col>
				  <el-col :span='4'>
					  <el-button type='primary' @click='addDialogVisible = true'>添加用户</el-button>
				  </el-col>
			  </el-row>
			  <!-- 用户列表区 -->
			  <el-table :data='userlist' border stripe>
				 <el-table-column type='index'></el-table-column> 
				 <el-table-column label='姓名' prop='username'></el-table-column> 
				 <el-table-column label='邮箱' prop='email'></el-table-column> 
				 <el-table-column label='电话' prop='mobile'></el-table-column> 
				 <el-table-column label='角色' prop='role_name'></el-table-column> 
				 <el-table-column label='状态' prop='mg_state'>
					 <template slot-scope='scope'>
						 <el-switch
						   v-model="scope.row.mg_state"
						   @change='userStateChanged(scope.row)'
						 >
						 </el-switch>
					 </template>
				 </el-table-column> 
				 <el-table-column label='操作' width='180px'>
					 <template slot-scope='scope'>
						 <el-button type="primary" icon="el-icon-edit" size='mini' @click='ModifyDialog(scope.row.id)'></el-button>
						 <el-button type="danger" icon="el-icon-delete" size='mini' @click='removeUserById(scope.row.id)'></el-button>
						   <el-tooltip  effect="dark" content="分配角色" placement="top" :enterable='false'>
								<el-button type="warning" icon="el-icon-setting" size='mini' @click='setRole(scope.row)'></el-button>
						     </el-tooltip>
					 </template>
				 </el-table-column> 
			  </el-table>
			  <!-- 分页 -->
			  <el-pagination
			        @size-change="handleSizeChange"
			        @current-change="handleCurrentChange"
			        :current-page="queryInfo.pagenum"
			        :page-sizes="[1, 2, 3, 4]"
			        :page-size="queryInfo.pagesize"
			        layout="total, sizes, prev, pager, next, jumper"
			        :total="total">
			   </el-pagination>
		</el-card>
		<!-- 添加用户对话框 -->
		<el-dialog
		  title="添加用户"
		  :visible.sync="addDialogVisible"
		  width="50%"
		  @close='addDialogClosed'
		 >
		 <!-- 内容主题区 -->
		<el-form :model="addForm" :rules="addFormrules" ref="addFormRef" label-width="70px" >
			<el-form-item label="用户名" prop="username">
				<el-input v-model="addForm.username"></el-input>
			</el-form-item>
			<el-form-item label="密码" prop="password">
					<el-input v-model="addForm.password"></el-input>
			</el-form-item>
			<el-form-item label="邮箱" prop="email">
					<el-input v-model="addForm.email"></el-input>
			</el-form-item>
			<el-form-item label="手机" prop="mobile">
					<el-input v-model="addForm.mobile"></el-input>
				</el-form-item>
			
		</el-form>	
			<!-- 底部区 -->
		  <span slot="footer" class="dialog-footer">
		    <el-button @click="addDialogVisible = false">取 消</el-button>
		    <el-button type="primary" @click="addUser">确 定</el-button>
		  </span>
		</el-dialog>
		<!-- 修改对话框 -->
		<el-dialog
		  title="修改对话框"
		  :visible.sync="editDialogVisible"
		  width="50%"
		  @close='editDialogClosed'
		  >
		  <el-form :model="editFrom" :rules="addFormrules" ref="editFromRef" label-width="70px" >
		  	<el-form-item label="用户名">
		  		<el-input v-model="editFrom.username" disabled></el-input>
		  	</el-form-item>
			<el-form-item label="邮箱" prop="email">
					<el-input v-model="editFrom.email"></el-input>
			</el-form-item>
			<el-form-item label="手机" prop="mobile">
					<el-input v-model="editFrom.mobile"></el-input>
				</el-form-item>
			</el-form>
		  <span slot="footer" class="dialog-footer">
		    <el-button @click="editDialogVisible = false">取 消</el-button>
		    <el-button type="primary" @click='editUserInfo'>确 定</el-button>
		  </span>
		</el-dialog>
<!-- 分配角色对话框 -->
		<el-dialog
		  title="分配角色"
		  :visible.sync="setDialogVisible"
		  width="50%"
		  @close='setRoleDiglogRoledId'
		  >
		  <div>
			  <p>当前用户：{{userInfo.username}}</p>
			  <p>当前角色：{{userInfo.role_name}}</p>
			  <p>分配新角色：
			  <el-select v-model="selectRoledId" placeholder="请选择">
			      <el-option
			        v-for="item in rolesList"
			        :key="item.id"
			        :label="item.roleName"
			        :value="item.id">
			      </el-option>
			    </el-select>
			  </p>
		  </div>
		  <span slot="footer" class="dialog-footer">
		    <el-button @click="setDialogVisible = false">取 消</el-button>
		    <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
		  </span>
		</el-dialog>
	</div>
	
</template>

<script>
	export default {
		data(){
			//自定义验证邮箱规则
			var checkEmail = (rule, value, callback) => {
				const regEmail = /^([a-zA-Z]|[0-9])(\w|\-)+@[a-zA-Z0-9]+\.([a-zA-Z]{2,4})$/
				if(regEmail.test(value)){
					return callback()
				}
				callback(new Error('请输入合法的邮箱'))
			}
			//自定义验证手机号规则
			var checkMobile = (rule, value, callback) => {
				const regMobeil = /^1[3456789]\d{9}$/
					if(regMobeil.test(value)){
						return callback()
					}
					callback(new Error('请输入合法的手机号'))
				
			}
			
			return {
				queryInfo:{
					//搜索关键字
					query:'',
					//当前页数
					pagenum:1,
					pagesize:2
				},
				userlist:[],
				total:0,
				//控制对话框的显示与隐藏
				addDialogVisible:false,
				//添加用户表单数据
				addForm:{
					username:'',
					password:'',
					email:'',
					mobile:''
				},
				//添加用户表单数据验证规则
				addFormrules:{
					username:[
						 { required: true, message: '请输入用户名', trigger: 'blur' },
						 { min: 3, max: 10, message: '长度在 3 到 5 个字符', trigger: 'blur' }
					],
					password:[
						            { required: true, message: '请输入密码', trigger: 'blur' },
						            { min: 6, max: 16, message: '长度在 3 到 5 个字符', trigger: 'blur' }
						 ],
					email:[
						 	            { required: true, message: '请输入邮箱', trigger: 'blur' },
						 	            { validator:checkEmail, trigger: 'blur' }
						 	 ],
					mobile:[
						 	            { required: true, message: '请输入手机号', trigger: 'blur' },
						 	            { validator:checkMobile, trigger: 'blur' }
						 	 ]
						 
					
				},
				// 控制修改对话框的显示隐藏
				editDialogVisible:false,
				editFrom:{},
				//控制分配角色对话框的显示隐藏
				setDialogVisible:false,
				userInfo:{},
				rolesList:[],
				selectRoledId:''
				
			}
		},
		created() {
			this.getUserList()
		},
		methods:{
			async getUserList(){
				const {data:res} = await this.$http.get('users',{params:this.queryInfo})
				if(res.meta.status !== 200){
					return this.$message.error('获取用户失败')
				}
				  this.userlist = res.data.users
				  this.total = res.data.total
			// 	 console.log(res.data)
			},
			//监听pagesize改变的事件
			handleSizeChange(newSize){
				this.queryInfo.pagesize = newSize
				this.getUserList()
			},
			//监听页码值改变的事件
			handleCurrentChange(newPage){
				this.queryInfo.pagenum = newPage
				this.getUserList()
			},
			//状态的更新
			async userStateChanged(userinfo){
			const {data:res} = await this.$http.put(`users/${userinfo.id}/state/${userinfo.mg_state}`)
			if(res.meta.status !== 200){
				userinfo.mg_state = !userinfo.mg_state
				return this.$message.error('更新状态失败')
			}
			this.$message.success('更新状态成功')
			},
			//重置添加的对话框
			addDialogClosed(){
				this.$refs.addFormRef.resetFields()
			},
			//添加用户
			addUser(){
				this.$refs.addFormRef.validate( async valid => {
					if(!valid) return
					//可以发起真正的添加用户请求
					   const {data:res} = await this.$http.post('users',this.addForm)
						
							if(res.meta.status !==201){
								this.$message.error('添加用户失败')
						}
						this.$message.success('添加用户成功')
						//隐藏添加用户的对话框
						this.addDialogVisible = false
						//添加用户了列表会重新加载数据
						this.getUserList()
					
				})
			},
			//修改对话框获取信息
			ModifyDialog(id){
				console.log(id)
				this.$http.get('users/' + id).then(
					res => {
						// console.log(res)
						if(res.data.meta.status === 200){
							this.editFrom = res.data.data
						}
					}
				)
				this.editDialogVisible = true
			},
			//async ModifyDialog(id){
			// 	const {data:res} = await this.$http.get('users/' + id)
			// 	console.log(res,res.meta.status)
			// 	if(res.meta.status !== 200){
			// 		return this.$message.error('查询用户失败')
			// 	}
			// 	this.editFrom = res.data
			// 	console.log(this.editFrom)
			// 	this.editDialogVisible = true
			// },
			// //修改对话框表单重置
			editDialogClosed(){
				this.$refs.editFromRef.resetFields()
			},
			//预验证修改对话框,修改并提交
			editUserInfo(){
				this.$refs.editFromRef.validate(valid => {
					if(!valid) return
					//发起修改用户的数据请求
					this.$http.put('users/' + this.editFrom.id,{
					email:this.editFrom.email,
					mobile:this.editFrom.mobile
					}).then(
						res => {
							// console.log(res)
							if(res.data.meta.status == 200){
								//关闭对话框
								this.editDialogVisible = false
								//刷新数据列表
								this.getUserList()
								//提示修改成功
								this.$message.success('更新成功')
							}else{
								this.$message.error('error')
							}
							// 关闭对话框
								// this.editDialogVisible = false
							// 	//刷新数据列表
								// this.getUserList()
							// 	//提示修改成功
								// this.$message.success('更新成功')
						}
					)
				})
			},
			//根据id删除用户
		async removeUserById(id){
				//根据弹窗进行删除
			const Result = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
				          confirmButtonText: '确定',
				          cancelButtonText: '取消',
				          type: 'warning'
				        }).catch(err => err)
						//用户确认删除，则返回的是字符串 confirm
						//用户取消了删除，则返回的是字符串 cancel
						if(Result !== 'confirm'){
							return this.$message.info('已取消删除')
						}
						this.$http.delete('users/' + id).then(
							res => {
								this.$message.success('删除用户成功')
								this.getUserList()
							}
						).catch(
							err => {
								this.$message.error('删除用户失败')
							}
						)
			},
			setRole(userInfo){
				this.userInfo = userInfo
				//在展示对话框的之前，获取所有角色的列表
				this.$http.get('roles').then(
					res => {
						this.rolesList = res.data.data
					}
				)
				this.setDialogVisible = true
			},
			//点击按钮分配角色
			saveRoleInfo(){
				if(!this.selectRoledId){
					return this.$message.error('选择要分配的角色')
				}
				this.$http.put(`users/${this.userInfo.id}/role`,{
					rid : this.selectRoledId
				}).then(
					res => {
						this.$message.success('成功')
						this.getUserList()
						this.setDialogVisible = false
					}
				)
			},
			//监听分配角色对话框的关闭事件
			setRoleDiglogRoledId(){
				this.selectRoledId = ''
				this.userInfo = {}
			}
	},
	}
</script>

<style>
</style>

