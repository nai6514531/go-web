import React, { PropTypes } from 'react';
import './app.less';
import md5 from 'md5';
import { Button, Form, Input, message } from 'antd';
const createForm = Form.create;
const FormItem = Form.Item;
import LoginService from '../app/service/login';
export class LoginForm extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			url: '',
			loginButton: true,
			getCaptcha: false,
			account: '',
			password: '',
			captcha: '',

		}
		this.handleSubmit = this.handleSubmit.bind(this);
		this.getCaptcha = this.getCaptcha.bind(this);
	}
	error(text) {
		if(text) {
			message.error(text);
		}
		this.getCaptcha();
	}
	handleSubmit(e) {
		e.preventDefault();
		if(this.state.loginButton == false){return;}
		const self = this;
		this.setState({loginButton:false,account:'',password:'',captcha:''});
		this.props.form.validateFields((errors, values) => {
			if (errors) {
				this.setState({loginButton:true});
				return;
			} else {
				const { account, password, verificode, captcha } = values;
				const data = {
					account: account,
					password: md5(password),
					verificode: verificode,
					captcha: captcha,
				};
				LoginService.login(data).then((response)=>{
					window.location.href = '/';
				},(response) => {
					console.log(response);
					switch (response.status) {
						case 1:
						case 9:
							self.setState({account:response.msg});
							break;
						case 2:
						case 10:
							self.setState({password:response.msg});
							break;
						case 3:
						case 4:
						case 5:
							self.setState({captcha:response.msg});
							break;
						default:
							self.error(response.msg);
							break;
					}
					this.getCaptcha();
				});
			}
		});
	}
	componentWillUpdate(nextProps, nextState) {
		const self = this;
		if(this.captcha && this.state.url !== nextState.url) {
			this.setState({loginButton:true});
			this.captcha = 0;
		}  else if (this.first == false && this.captcha
			&& this.state.url == nextState.url) {
			// 两次时间戳结果相等,表示操作太快
			alert('您的操作太快!');
			self.getCaptcha();
		}
	}
	getCaptcha(e) {
		if(e){
			e.preventDefault();
		}
		const url = '/captcha.png';
		var timestamp =new Date().getTime();
		this.captcha = 1;
		this.setState({ url: `${url}?${timestamp}`});
	}
	componentWillMount() {
		this.getCaptcha();
		this.first = true;
	}
	handleEnter(event) {
		if(this.state.loginButton) {
			if (event.keyCode==13) {
				this.handleSubmit(event);
			}
		}
	}
	render() {
		const { getFieldDecorator } = this.props.form;
		const formItemLayout = {
			labelCol: { span: 7 },
			wrapperCol: { span: 12 },
		};
		const accountHelp = this.state.account?{'help':this.state.account,'className':'has-error'}:{};
		const passwordHelp = this.state.password?{'help':this.state.password,'className':'has-error'}:{};
		const captchaHelp = this.state.captcha?{'help':this.state.captcha,'className':'has-error'}:{};
		return (
				<Form horizontal onKeyDown={this.handleEnter.bind(this)}>
					<FormItem {...formItemLayout}
						label="用户名"
						{...accountHelp}
					>
						{getFieldDecorator('account', {
							rules: [
								{ required: true, message: '请输入用户名' },
							],
						})(
							<Input placeholder="请输入用户名" />
						)}
					</FormItem>
					<FormItem
						{...formItemLayout}
						label="密码"
						{...passwordHelp}
					>
						{getFieldDecorator('password', {
							rules: [
								{ required: true, message: '请输入密码' },
							],
						})(
							<Input type="password" placeholder="请输入密码" />
						)}
					</FormItem>
					<FormItem
						{...formItemLayout}
						label="图形验证码"
						{...captchaHelp}
					>
						{getFieldDecorator('captcha', {
							rules: [
								{ required: true, message: '请输入图形验证码' },
							],
						})(
							<div>
								<Input  placeholder="请输入图形验证码" style={{ width: '60%', marginRight: 8 }}/>
								<img className="captcha"  src={this.state.url} onClick={this.getCaptcha}/>
								<span><a href="#" onClick={this.getCaptcha}>看不清楚? 换一张</a></span>
							</div>
						)}
					</FormItem>
					<FormItem wrapperCol={{ span: 12, offset: 7 }}>
						{this.state.loginButton ?
							<Button type="primary" onClick={this.handleSubmit}>登录</Button>
								:
							<Button type="primary" disabled onClick={this.handleSubmit}>登录</Button>
						}
					</FormItem>
				</Form>
		);
	}
}

LoginForm.propTypes = {
	children: React.PropTypes.object,
};

LoginForm = createForm()(LoginForm);

const App = React.createClass({
	render() {
		return (<div className="application application-login">
			<h2>
				<p>苏打生活管理系统</p>
			</h2>
			<div className="form">
				<LoginForm />
			</div>
		</div>);
	}
});

export default App;
