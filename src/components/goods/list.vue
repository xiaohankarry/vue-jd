<template>
	<div>
		<el-breadcrumb separator-class="el-icon-arrow-right">
		  <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
		  <el-breadcrumb-item>商品管理</el-breadcrumb-item>
		  <el-breadcrumb-item>商品列表</el-breadcrumb-item>
		</el-breadcrumb>
		<!-- 卡片视图 -->
		<el-card>
			<!-- 搜素 -->
			<el-row :gutter='20'>
				<el-col :span='8'>
					<el-input placeholder="请输入内容" v-model='queryInfo.query' clearable @clear='getGoodsList'>
					<el-button slot="append" icon="el-icon-search" @click='getGoodsList'></el-button>
					</el-input>
				</el-col>
				<el-col :span='4'>
					<el-button type='primary' @click='addPage'>添加商品</el-button>
				</el-col>
			</el-row>
			<!-- 信息数据 -->
			<el-table :data='goodsList' border stripe>
				<el-table-column type='index'></el-table-column>
				<el-table-column label='商品名称' prop='goods_name'></el-table-column>
				<el-table-column label='商品价格(元)' prop='goods_price' width='95px'></el-table-column>
				<el-table-column label='商品重量' prop='goods_weight' width='70px'></el-table-column>
				<el-table-column label='创建时间' prop='add_time' width='140px'>
					<template slot-scope='scope'>
						{{scope.row.add_time | dateFormat}}
					</template>
				</el-table-column>
				<el-table-column label='操作' width='140px'>
					<template slot-scope="scope">
						<el-button type="primary" icon="el-icon-edit" size='mini' @click='showGoods(scope.row.goods_id)'></el-button>
						<el-button type="danger" icon="el-icon-delete" size='mini' @click='deleteGoods(scope.row.goods_id)'></el-button>
					</template>
				</el-table-column>
			</el-table>
			<!-- 分页 -->
			 <el-pagination
			      @size-change="handleSizeChange"
			      @current-change="handleCurrentChange"
				  :current-page="queryInfo.pagenum"
			      :page-sizes="[1, 2, 3, 5]"
			      :page-size="queryInfo.pagesize"
			      layout="total, sizes, prev, pager, next, jumper"
			      :total="total" background>
			    </el-pagination>
		</el-card>
		<!-- 编辑 -->
		<el-dialog title="编辑商品" :visible.sync="showRoleDialogVisible" width="40%" @close="addRoleDialogClosed">
		  <el-form
		    :model="showRoleForm"
		    ref="showRoleFormRef"
		    :rules="showRoleFormRules"
		    label-width="100px"
		  >
		    <el-form-item label="商品名称" prop="goods_name">
		      <el-input v-model="showRoleForm.goods_name"></el-input>
		    </el-form-item>
		    <el-form-item label="商品价格" prop="goods_price">
		      <el-input v-model="showRoleForm.goods_price"></el-input>
		    </el-form-item>
			<el-form-item label="商品重量" prop="goods_weight">
			    <el-input v-model="showRoleForm.goods_weight"></el-input>
			  </el-form-item>
		    <el-form-item label="商品数量" prop="goods_number">
		      <el-input v-model="showRoleForm.goods_number"></el-input>
		    </el-form-item>
		  </el-form>
		  <span slot="footer" class="dialog-footer">
		    <el-button @click="showRoleDialogVisible = false">取 消</el-button>
		    <el-button type="primary" @click="showRoles">确 定</el-button>
		  </span>
		</el-dialog>
		
	</div>
</template>

<script>
	export default {
		data(){
			return {
				queryInfo:{
					pagenum:1,
					pagesize:10,
					query:''
				},
				goodsList:[],
				total:0,
				
				showRoleDialogVisible:false,
				showRoleForm: {},
				showRoleFormRules: {
				  goods_name: [
				    { required: true, message: '请输入商品名称', trigger: 'blur' }
				  ],
				 goods_price: [
				    { required: true, message: '请输入商品价格', trigger: 'blur' }
				  ],
				 goods_number: [
				    { required: true, message: '请输入商品数量', trigger: 'blur' }
				  ],
				goods_weight: [
				    { required: true, message: '请输入商品重量', trigger: 'blur' }
				  ]
				},
				
			}
		},
		created(){
			this.getGoodsList()
		},
		methods:{
			getGoodsList(){
				this.$http.get('goods',{params:this.queryInfo}).then(
					res => {
						// console.log(res)
						// this.$message.success('success')
					 	this.goodsList = res.data.data.goods
						this.total = res.data.data.total
					}
				)
			},
			handleSizeChange(newSize){
				this.queryInfo.pagesize = newSize
				this.getGoodsList()
			},
			handleCurrentChange(newNum){
				this.queryInfo.pagenum = newNum
				this.getGoodsList()
			},
		async deleteGoods(id){
			const result = await this.$confirm('删除文件是否继续','提示',{
					confirmButtonText:'确定',
					cancelButtonText:'取消',
					type:'warning'
				}).catch(err => err)
				if(result !== 'confirm'){
					return this.$message.info('已取消')
				}
			const {data:res} = await this.$http.delete(`goods/${id}`)
			if(res.meta.status !== 200){
				this.$message.error('error')
			}
			this.getGoodsList()
			this.$message.success('success')
			},
			//添加商品
			addPage(){
				this.$router.push('/goods/add')
			},
			//修改对话框表单重置
			addRoleDialogClosed(){
				this.$refs.showRoleFormRef.resetFields()
			},
			//编辑信息
			showGoods(id){
				// console.log(id)
				this.$http.get('goods/' + id).then(
					res => {
						this.showRoleForm = res.data.data
						this.showRoleDialogVisible = true
						// console.log(this.showRoleForm)
					}
				)
				
				},
				showRoles(){
					this.$refs.showRoleFormRef.validate(valid => {
					if(!valid) return
					this.$http.put('goods/' + this.showRoleForm.goods_id,
					{
					goods_name: this.showRoleForm.goods_name,
					goods_price: this.showRoleForm.goods_price,
					goods_number: this.showRoleForm.goods_number,
					goods_weight: this.showRoleForm.goods_weight
					}
					).then(
						res => {
							this.showRoleDialogVisible = false
							this.getGoodsList()
							this.$message.success('更新商品信息成功')
						}
					).catch(
						err => {
							this.$message.error('更新商品信息失败')
						}
					)
				})
				}
		}
	}
</script>

<style lang="less" scoped>
</style>
