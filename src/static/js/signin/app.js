import React, { PropTypes } from 'react';
import './app.less';

import { Button, Form, Input, message } from 'antd';
const createForm = Form.create;
const FormItem = Form.Item;
import { checkStatus, parseJSON, parseCode } from '../common/common';

export class LoginForm extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			url: '',
		}
		this.handleSubmit = this.handleSubmit.bind(this);
		this.getCaptcha = this.getCaptcha.bind(this);
	}
	error(text) {
		if(text) {
			message.error(text);
		}
	}
	handleSubmit(e) {
		e.preventDefault();
		const that = this;
		this.props.form.validateFields((errors, values) => {
			if (errors) {
				return;
			} else {
				const { username, password, verificode, captcha } = values;
				fetch('/api/user/signin', {
					method: 'post',
					headers: {
						'Accept': 'application/json',
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({
						username: username,
						password: password,
						verificode: verificode,
						captcha: captcha,
					}),
					credentials: 'same-origin'
				}).then(checkStatus)
					.then(parseJSON)
					.then(function(response) {
						const newCode = parseCode(response.status);
						let tips = '';
						switch (newCode) {
							case 0: {
								window.location.href = '/admin';
								break;
							}
							default: {
								tips = response.msg;
								break;
							}
						}
						if(tips){
							that.error(tips);
						}
					}).catch(function(error) {
						throw new Error(error);
				});
			}
		});
	}
	getCaptcha(e) {
		if(e){
			e.preventDefault();
		}
		const that = this;
		fetch('/captcha.png', {
			method: 'get',
			headers: {
				'Content-Type': 'image/png; charset=UTF-8'
			},
			credentials: 'same-origin'
		}).then(checkStatus)
			.then(function(response) {
				var timestamp = Date.parse((new Date()).toString());
				that.setState({ url: `${response.url}?${timestamp}` })
			}).catch(function(error) {
			throw new Error(error);
		});
	}
	componentWillMount() {
		this.getCaptcha();
	}
	render() {
		const { getFieldDecorator } = this.props.form;
		const formItemLayout = {
			labelCol: { span: 7 },
			wrapperCol: { span: 12 },
		};
		return (
			<Form horizontal>
				<FormItem
					{...formItemLayout}
					label="用户名"
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
				>
					{getFieldDecorator('captcha', {
						rules: [
							{ required: true, message: '请输入图形验证码' },
						],
					})(
						<div>
							<Input  placeholder="请输入图形验证码" style={{ width: '60%', marginRight: 8 }}/>
							<img className="captcha"  src={this.state.url} />
							<span><a href="#" onClick={this.getCaptcha}>看不清楚? 换一张</a></span>
						</div>
					)}
				</FormItem>
				<FormItem wrapperCol={{ span: 12, offset: 7 }}>
					<Button type="primary" onClick={this.handleSubmit}>登录</Button>
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
