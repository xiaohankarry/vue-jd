<template>
	<div id="app" class="login_container">
		<div class="login_box">
			<!-- 头像区域 -->
			<div class="avatar_box">
				<img src="../assets/下载.jpg" />
			</div>
			<!-- 登入表单区域 -->
			<el-form ref='loginRef' label-width="0px" class="login_form" :model="loginform" :rules='loginrules'>
				<!-- 用户名 -->
			  <el-form-item prop="username">
			    <el-input  prefix-icon="el-icon-user" v-model='loginform.username'></el-input>
			  </el-form-item>
			  <!-- 密码 -->
			  <el-form-item prop="password">
			    <el-input  prefix-icon="el-icon-lock" v-model='loginform.password' type='password'></el-input>
			  </el-form-item>
			  <!-- 按钮区域 -->
			  <el-form-item class="btns" >
			     <el-button type="primary" @click='login'>登入</el-button>
				 <el-button type="info" @click='resetLoginForm'>重置</el-button>
			  </el-form-item>
			</el-form>
		</div>
	</div>
</template>

<script>
	export default {
		name: 'Login',
		data(){
			return {
				//这是登入表单的数据绑定对象
				loginform:{
					username:'hqwjk',
					password:'9999999999'
				},
				//这是表单的验证规则对象
				loginrules:{
					//验证用户名
					username: [
					            { required: true, message: '请输入用户名', trigger: 'blur' },
					            { min: 3, max: 10, message: '长度在 3 到 5 个字符', trigger: 'blur' }
					 ],
					 //验证密码
					 password:[
					            { required: true, message: '请输入密码', trigger: 'blur' },
					            { min: 6, max: 16, message: '长度在 3 到 5 个字符', trigger: 'blur' }
					 ]
				}
			}
		},
	methods:{
		resetLoginForm(){
			this.$refs.loginRef.resetFields()
		},
		login(){
			this.$refs.loginRef.validate(async valid =>{
				if(!valid) return;
				const {data:res} = await this.$http.post('login',this.loginform)
				if(res.meta.status !== 200) return this.$message.error('登入失败')
				this.$message.success('登入成功');
				//要讲token保存到客户端sessionStorage
				//必须登入后才能访问，token只在当前网站打开期间生效，所以保存到客户端sessionStorage
				window.sessionStorage.setItem("token",res.data.token);
				//编程式地跳转到后台主页
				this.$router.push('/home');
			})
		}
	}
	}
</script>

<style lang="less" scoped>
	.login_container{
		background-color: #2b4b6b;
		height: 100%;
	}
	.login_box{
		background-color: #fff;
		width: 450px;
		height: 300px;
		border-radius: 3px;
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translateX(-50%) translateY(-50%);
	}
	.avatar_box{
		width: 130px;
		height: 130px;
		border: 1px solid #0091CA;
		border-radius: 50%;
		padding: 10px;
		box-shadow: 0 0 10px #005599;
		position: absolute;
		left: 50%;
		transform: translateX(-50%) translateY(-50%);
		background-color: #fff;
		img{
			width: 100%;
			height: 100%;
			border-radius: 50%;
			background-color: #0091CA;
		}
		
	}
	.login_form{
		position: absolute;
		bottom: 0;
		width: 100%;
		padding: 0 20px;
		box-sizing: border-box;
	}
	.btns{
		display: flex;
		justify-content: flex-end;
	}
</style>
