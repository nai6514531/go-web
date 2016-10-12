import React from 'react';
import './app.less';
import { Button, Form, Input, Radio, Select, Cascader } from 'antd';
const createForm = Form.create;
const FormItem = Form.Item;
const RadioGroup = Radio.Group;

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as UserActions from '../../../actions/user';


function mapStateToProps(state) {
	const { user: { result } } = state;
	return { result };
}

function mapDispatchToProps(dispatch) {
	const {
		userCreate,
		userEdit,
	} = bindActionCreators(UserActions, dispatch);
	return {
		userCreate,
		userEdit,
	};
}
class UserForm extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			alipay: true,
		}
		this.handleSubmit = this.handleSubmit.bind(this);
		this.handleReset = this.handleReset.bind(this);

	}
	componentWillMount() {
		this.props.form.setFieldsValue({
			type: 'current',
		});
	}
	handleSubmit(e) {
		e.preventDefault();
		this.props.form.validateFields((errors, values) => {
			if (errors) {
				console.log('Errors in form!!!');
				return;
			}
			console.log('Submit!!!');
			console.log(values);
		});
	}
	handleReset(e) {
		e.preventDefault();
		this.props.form.resetFields();
	}
	handleRadio(select) {
		if (select === 'current') {
			this.setState({ alipay: true });
		} else {
			this.setState({ alipay: false });
		}
	}
	handleClick(e){
		e.preventDefault();
		const data = {
			"user": {
				"account": "aazz啊",
				"name": "soda",
				"contact": "iris",
				"password": "123516",
				"mobile": "1802338046这种1啊啊啊啊26",
				"telephone": "0766-2885411",
				"email": "317808023@qq.com"
			},
			"cash": {
				"type": 1,
				"real_name": "伍明煜",
				"bank_name": "中国银行",
				"account": "44444441200001111",
				"mobile": "18023380455",
				"city_id": 3333,
				"province_id": 2222
			}
		}
		// this.props.userCreate(data);
		this.props.userEdit(327,data);
	}
	handleShow(e){
		e.preventDefault();
		console.log(this.props.result);
	}
	render() {
		const address = [{
			value: 'guangdong',
			label: '广东',
			children: [{
				value: 'shenzhen',
				label: '深圳',
			}],
		}];
		const { getFieldDecorator, getFieldError, isFieldValidating } = this.props.form;
		const formItemLayout = {
			labelCol: { span: 7 },
			wrapperCol: { span: 12 },
		};

		return (
			<Form horizontal>
				<FormItem
					{...formItemLayout}
					label="代理商名称" >
					{getFieldDecorator('user', {
						rules: [
							{ required: true, message: '请输入代理商名称' },
						],
					})(
						<Input placeholder="请输入代理商名称" />
					)}
				</FormItem>
				<FormItem
					{...formItemLayout}
					label="联系人" >
					{getFieldDecorator('contact', {
						rules: [
							{ required: true, message: '请输入联系人' },
						],
					})(
						<Input placeholder="请输入联系人" />
					)}
				</FormItem>
				<FormItem
					{...formItemLayout}
					label="地址" >
					{getFieldDecorator('address', {
						rules: [
							{ required: true, message: '请输入地址' },
						],
					})(
						<Input placeholder="请输入地址" />
					)}
				</FormItem>

				<FormItem
					{...formItemLayout}
					label="手机号" >
					{getFieldDecorator('mobile', {
						rules: [
							{ required: true, message: '请输入手机号' },
						],
					})(
						<Input placeholder="请输入手机号" />
					)}
				</FormItem>
				<FormItem
					{...formItemLayout}
					label="收款方式"
				>
					{getFieldDecorator('type', {
						rules: [
							{ required: true, message: '请选择收款方式' },
						],
					})(
						<RadioGroup>
							<Radio value="current" onClick = {this.handleRadio.bind(this, 'current')}>实时分账(必须拥有支付宝,收取 x% 手续费)</Radio>
							<Radio value="regular" onClick = {this.handleRadio.bind(this, 'regular')}>财务定期结账(需提供正确银行卡号)</Radio>
						</RadioGroup>
					)}
				</FormItem>
				{this.state.alipay ?
					<div>
						<FormItem
							{...formItemLayout}
							label="支付宝账号">
							{getFieldDecorator('alipay_account', {
								rules: [
									{required: true, message: '请输入支付宝账号'},
								],
							})(
								<Input placeholder="请输入支付宝账号"/>
							)}
						</FormItem>
						<FormItem
							{...formItemLayout}
							label="支付宝姓名">
							{getFieldDecorator('alipay_name', {
								rules: [
									{required: true, message: '请输入支付宝姓名'},
								],
							})(
								<Input placeholder="请输入支付宝姓名"/>
							)}
						</FormItem>
					</div> :
					<div>
						<FormItem
							{...formItemLayout}
							label="转账户名">
							{getFieldDecorator('real_name', {
								rules: [
									{required: true, message: '请输入转账户名'},
								],
							})(
								<Input placeholder="请输入转账户名"/>
							)}
						</FormItem>
						<FormItem
							{...formItemLayout}
							label="开户行">
							{getFieldDecorator('bank_name', {
								rules: [
									{required: true, message: '请输入开户行'},
								],
							})(
								<Input placeholder="请输入开户行"/>
							)}
						</FormItem>
						<FormItem
							{...formItemLayout}
							label="账号">
							{getFieldDecorator('account', {
								rules: [
									{required: true, message: '请输入账号'},
								],
							})(
								<Input placeholder="请输入账号"/>
							)}
						</FormItem>
						<FormItem
							{...formItemLayout}
							label="短信通知手机号">
							{getFieldDecorator('bank_mobile', {
								rules: [
									{required: true, message: '请输入短信通知手机号'},
								],
							})(
								<Input placeholder="请输入短信通知手机号"/>
							)}
						</FormItem>
						<FormItem
							{...formItemLayout}
							label="城市"
						>
							{getFieldDecorator('city', {
								rules: [{ required: true, type: 'array',message: '请选择城市' }],
							})(
								<Cascader options={address} />
							)}
						</FormItem>

					</div>
				}
				<FormItem
					{...formItemLayout}
					label="服务电话" >
					{getFieldDecorator('telephone', {
						rules: [
							{ required: true, message: '请输入服务电话' },
						],
					})(
						<Input placeholder="请输入服务电话" />
					)}
				</FormItem>
				<FormItem wrapperCol={{ span: 12, offset: 7 }}>
					<Button type="ghost" onClick={this.handleReset}>取消</Button>
					<Button type="primary" onClick={this.handleSubmit}>保存</Button>
					<Button type="ghost" onClick={this.handleClick.bind(this)}>Click Me</Button>
					<Button type="ghost" onClick={this.handleShow.bind(this)}>SHOW ME</Button>
				</FormItem>
			</Form>
		);
	}
}

UserForm = createForm()(UserForm);

UserForm.propTypes = {
	title: React.PropTypes.string,
};

export default connect(mapStateToProps, mapDispatchToProps)(UserForm);
