<template>
	<div>
		<el-breadcrumb separator-class="el-icon-arrow-right">
			  <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
			  <el-breadcrumb-item>权限管理</el-breadcrumb-item>
			  <el-breadcrumb-item>角色管理</el-breadcrumb-item>
			</el-breadcrumb>
			<!-- 卡片视图 -->
			<el-card>
				<!-- 添加角色按钮 -->
				<el-row>
					<el-col>
						<el-button type='primary' @click="AddRoleDialogVisible=true">添加角色</el-button>
				</el-col>
				</el-row>
				<!-- 角色列表 -->
				<el-table :data='rolesList' border stripe>
					<!-- 展开列 -->
					 <el-table-column type='expand'>
						 <template slot-scope='scope'>
							<el-col v-for="(item1,i1) in scope.row.children"
							:key='item1.id'
							:class='["bdbottom",i1 === 0 ? "bdtop" : "","vcenter"]'
							>
								<!-- 一级权限 -->
								<el-col :span='5'>
									<el-tag closable
											@close='removeRightById(scope.row,item1.id)'>
										{{item1.authName}}
									</el-tag>
									<i class="el-icon-caret-right"></i>
								</el-col>
								<!-- 二级权限 和三级权限-->
								<el-col :span='19'>
									<!-- 通过循环写出二级权限 -->
									<el-row v-for='(item2,i2) in item1.children'
									:key="item2.id"
									:class="[i2 === 0 ? 'bdtop' : '','vcenter']">
										<el-col :span='6'
										>
											<el-tag type='success'
											closable
											@close='removeRightById(scope.row,item2.id)'>{{item2.authName}}</el-tag>
											<i class="el-icon-caret-right"></i>
										</el-col>
										<el-col :span='18'>
											<el-tag v-for='(item3,i3) in item2.children'
											:key='item3.id'
											type='warning'
											closable
											@close='removeRightById(scope.row,item3.id)'>
											{{item3.authName}}
											</el-tag>
										</el-col>
									</el-row>
								</el-col>
							</el-col>
						 </template>
					 </el-table-column> 
					<!-- 索引列 -->
					 <el-table-column type='index'></el-table-column> 
					 <el-table-column label='角色名称' prop='roleName'></el-table-column> 
					 <el-table-column label='角色描述'  prop='roleDesc'></el-table-column> 
					 <el-table-column label='操作'>
						<template slot-scope='scope'>  
						<el-button type="primary" icon="el-icon-edit" size='mini' @click='showEditDialog(scope.row.id)'>编辑</el-button>
						 <el-button type="danger" icon="el-icon-delete" size='mini' @click='remove(scope.row.id)'>删除</el-button>
						<el-button type="warning" icon="el-icon-setting" size='mini' @click='showSetRight(scope.row)'>分配权限</el-button>
						</template>
					 </el-table-column> 
				</el-table>
			</el-card>
			<!-- 分配权限对话框 -->
			<el-dialog
			  title="分配权限"
			  :visible.sync="setRightDiglogVisible"
			  width="50%"
			  @close='setRightDiglogColse'
			 >
			 <!-- 树形控件 -->
			  <el-tree :data="rightList" :props="treeProps" show-checkbox node-key='id' default-expand-all
			  :default-checked-keys='defKeys' ref='treeRef'></el-tree>
			  <span slot="footer" class="dialog-footer">
			    <el-button @click="setRightDiglogVisible = false">取 消</el-button>
			    <el-button type="primary" @click="allRights">确 定</el-button>
			  </span>
			</el-dialog>
<!-- 添加角色对话框 -->
    <el-dialog title="添加角色" :visible.sync="AddRoleDialogVisible" width="40%" @close="addRoleDialogClosed">
      <el-form
        :model="addRoleForm"
        ref="addRoleFormRef"
        :rules="addRoleFormRules"
        label-width="100px"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addRoleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addRoleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="AddRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRoles">确 定</el-button>
      </span>
    </el-dialog>
<!-- 编辑角色对话框 -->
    <el-dialog title="编辑角色" :visible.sync="editRoleDialogVisible" width="40%" @close="addRoleDialogClosed">
      <el-form
        :model="editRoleForm"
        ref="editRoleFormRef"
        :rules="editRoleFormRules"
        label-width="100px"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editRoleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editRoleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRoles">确 定</el-button>
      </span>
    </el-dialog>

	</div>
</template>

<script>
	export default {
		data(){
			return {
				rolesList:[],
				setRightDiglogVisible:false,
				// 所有权限数据
				rightList:[],
				// 树形控件属性绑定
				treeProps:{
					label:'authName',
					children:'children'
				},
				// 默认选中的节点ID值
				defKeys:[],
				//即将分配角色的权限的id
				roleid:'',
				//添加对话框
				AddRoleDialogVisible:false,
				//添加角色表单
				addRoleForm:{},
			  //   添加角色表单验证
			  addRoleFormRules: {
				roleName: [
				  { required: true, message: '请输入角色名称', trigger: 'blur' }
				],
				roleDesc: [
				  { required: true, message: '请输入角色描述', trigger: 'blur' }
				]
			  },
			  //编辑信息
			  editRoleDialogVisible:false,
			  editRoleForm: {},
			  editRoleFormRules: {
			    roleName: [
			      { required: true, message: '请输入角色名称', trigger: 'blur' }
			    ],
			    roleDesc: [
			      { required: true, message: '请输入角色描述', trigger: 'blur' }
			    ]
			  },
			  
			}
		},
		created(){
			this.getRolesList()
		},
		methods:{
			getRolesList(){
				this.$http.get('roles').then(
				res => {
					this.rolesList = res.data.data
					console.log(res,this.rolesList)
				}
				)
			},
			// 添加角色对话框的关闭
			addRoleDialogClosed () {
			  this.$refs.editRoleFormRef.resetFields()
			},
			//添加信息
			addRoles(){
				this.$refs.addRoleFormRef.validate( valid =>{
					if(!valid) return
					this.$http.post('roles',this.addRoleForm).then(
						res =>{
							this.getRolesList()
							this.AddRoleDialogVisible = false
							this.$message.success('添加角色成功！')
						}
					)
				})
				
			},
			
			//删除一条信息
		async remove(id){
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
							this.$http.delete('roles/' + id).then(
								res => {
									this.$message.success('删除用户成功')
									this.getRolesList()
								}
							).catch(
								err => {
									this.$message.error('删除用户失败')
								}
							)
			},
			//编辑角色提前获取未改信息
			showEditDialog(id){
				this.$http.get('roles/' + id).then(
					res => {
						this.editRoleForm = res.data.data
						this.editRoleDialogVisible = true
					}
				)
				
			},
			//开始修改信息
			editRoles(){
				this.$refs.editRoleFormRef.validate(valid => {
					if(!valid) return
					this.$http.put('roles/' + this.editRoleForm.roleId,
					{
					roleName: this.editRoleForm.roleName,
					  roleDesc: this.editRoleForm.roleDesc
					}
					).then(
						res => {
							this.editRoleDialogVisible = false
							this.getRolesList()
							this.$message.success('更新角色信息成功')
						}
					).catch(
						err => {
							this.$message.error('更新角色信息失败')
						}
					)
				})
			},
		async removeRightById(role,rightId){
			const Result = await this.$confirm('此操作将永久删除该内容, 是否继续?', '提示', {
				          confirmButtonText: '确定',
				          cancelButtonText: '取消',
				          type: 'warning'
				        }).catch(err => err)
						if(Result !== 'confirm'){
							return this.$message.error('取消删除')
						}
					const {data:res} = await this.$http.delete(`roles/${role.id}/rights/${rightId}rightId`)
						if(res.meta.status !== 200){
							return this.$message.error('删除失败')
						}
						role.children = res.data
						
			},
			// 展示权限对话框
		async showSetRight(role){
				//获取权限的值
				this.roleid = role.id
			const {data:res} = await this.$http.get('rights/tree')
			if(res.meta.status !== 200){
				return this.$message.error('获取信息失败')
			}
			this.rightList = res.data
			// console.log(this.rightList)
			// 递归获取三级节点的id
			this.getLeafKeys(role,this.defKeys)
			this.setRightDiglogVisible = true
		},
		//通过递归的形式，获取角色下的所有三级权限的id
		//并保存到defKeys数组中
		getLeafKeys(node,arr){
			if(!node.children){
				return arr.push(node.id)
			}
			node.children.forEach(item => {
				this.getLeafKeys(item,arr)
			})
		},
		//监听分配权限对话框的关闭事件
		setRightDiglogColse(){
			this.defKeys = []
		},
		//点击为角色分配权限
		allRights(){
			const keys = [
				...this.$refs.treeRef.getCheckedKeys(),
				...this.$refs.treeRef.getHalfCheckedKeys	()
			]
			// console.log(keys)
			const idStr = keys.join(',')
			this.$http.post(`roles/${this.roleid}/rights`,{rids:idStr}).then(
				res =>{
					this.getRolesList()
					this.setRightDiglogVisible = false
					}
			)
		}
	}
	}
</script>

<style lang="less" scoped>
	.el-tag{
		margin: 7px;
	}
	.bdtop{
		border-top: 1px solid #eee;
	}
	.bdbottom{
		border-bottom:1px solid #eee;
	}
	.vcenter{
		display: flex;
		align-items: center;
	}
</style>
