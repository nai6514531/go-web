import React from 'react';
import './app.less';
import { Button, Form, Input, Radio, Select, Cascader, Breadcrumb } from 'antd';
const createForm = Form.create;
const FormItem = Form.Item;
const RadioGroup = Radio.Group;

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as UserActions from '../../../actions/user';
import * as regionActions from '../../../actions/region';


function mapStateToProps(state) {
	const { user: { result, detail }, region: { province_list, province_city, city_list } }= state;
	return { result, detail, province_list, province_city, city_list };
}

function mapDispatchToProps(dispatch) {
	const {
		userCreate,
		userEdit,
		userDetail,
	} = bindActionCreators(UserActions, dispatch);
	const {
		provinceList,
		cityList,
	} = bindActionCreators(regionActions, dispatch);
	return {
		userCreate,
		userEdit,
		userDetail,
		provinceList,
		cityList,
	};
}
const user_data = JSON.parse(document.getElementById('main').dataset.user);

class UserForm extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			alipay: false,
		}
		this.handleSubmit = this.handleSubmit.bind(this);
		this.handleReset = this.handleReset.bind(this);
	}
	componentWillMount() {
		if(user_data.cash.type == 1) {
			this.setState({ alipay: false });
		} else {
			this.setState({ alipay: true });
		}
		this.props.provinceList();
		this.props.cityList();
	}
	handleSubmit(e) {
		e.preventDefault();
		this.props.form.validateFields((errors, values) => {
			if (errors) {
				return;
			}
			console.log(values);
			let data = {};
			let cash_value = {};
			const base_value = {
				"user": {
					"account": values.mobile,
					"name": values.name,
					"contact": values.contact,
					"password": "",
					"mobile": values.mobile,
					"telephone": values.telephone,
					"email": ""
				}
			}
			if(values.type == 1) {
				cash_value = {
					"cash": {
						"type": parseInt(values.type),
						"real_name": values.real_name,
						"bank_name": values.bank_name,
						"account": values.account,
						"mobile": values.bank_mobile,
						"city_id": values.city[1],
						"province_id":  values.city[0]
					}
				}
			} else {
				cash_value = {
					"cash": {
						"real_name": values.alipay_name,
						"account": values.alipay_account,
					}
				}
			}
			data = Object.assign({}, base_value, cash_value);
			console.log('USER',data);
			if(this.props.params.id) {
				this.props.userEdit(user_data.user.id,data);
			} else {
				this.props.userCreate(data);
			}
		});
	}
	handleReset(e) {
		e.preventDefault();
		this.props.form.resetFields();
	}
	handleRadio(select) {
		if (select === '1') {
			this.setState({ alipay: false });
		} else {
			this.setState({ alipay: true });
		}
	}
	render() {
		const result = this.props.result;
		if(result) {
			if(result.fetch == true){
				alert('修改成功');
			} else {
				console.log(result.result.msg);
			}
		}
		const id = this.props.params.id;
		let initialValue = {};
		if(id) {
			const base_values = {
				name: user_data.user.name,
				contact: user_data.user.contact,
				address: user_data.user.address,
				mobile : user_data.user.mobile,
				telephone: user_data.user.telephone,
				type: user_data.cash.type.toString(),
			}
			if(user_data.cash.type == 1){
				const cash_values = {
					real_name: user_data.cash.real_name,
					bank_name: user_data.cash.bank_name,
					account: user_data.cash.acccount,
					bank_mobile: user_data.cash.mobile,
					city: user_data.cash.city_id,
				}
				initialValue = Object.assign({}, base_values, cash_values);
			} else {
				const cash_values = {
					alipay_account: '',
					alipay_name: '',
				}
				initialValue = Object.assign({}, base_values, cash_values);
			}
		}
		const province_list = this.props.province_list;
		const city_list = this.props.city_list;
		// 待优化
		let address = [];
		if(province_list && city_list) {
			if(province_list.fetch == true){
				address = province_list.result.data.map(function(item, key){
					const data = city_list.result.data;
					let children = [];
					for (let i = 0; i < data.length; i++){
						if( data[i].parent_id == item.id) {
							children[i] = {
								'value': data[i].id,
								'label': data[i].name,
							}
						}
					}
					return {
						'value': item.id,
						'label': item.name,
						'children' : children,
					}
				})
			}
		}
		const { getFieldDecorator, getFieldError, isFieldValidating } = this.props.form;
		const formItemLayout = {
			labelCol: { span: 7 },
			wrapperCol: { span: 12 },
		};

		return (
		<div className="index">
			<div className="body-panel">
				<div className="detail">
					<div className="detail-head">
						<Breadcrumb separator=">">
							<Breadcrumb.Item>代理商管理</Breadcrumb.Item>
							<Breadcrumb.Item href="#">设备管理</Breadcrumb.Item>
						</Breadcrumb>
					</div>
					<div className="detail-form">
						<Form horizontal>
							<FormItem
								{...formItemLayout}
								label="代理商名称" >
								{getFieldDecorator('name', {
									rules: [
										{ required: true, message: '请输入代理商名称' },
									],
									initialValue: initialValue.name,
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
									initialValue: initialValue.contact,
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
									initialValue: initialValue.address,
								})(
									<Input placeholder="请输入地址" />
								)}
							</FormItem>
							<FormItem
								{...formItemLayout}
								label="手机号" >
								{getFieldDecorator('mobile', {
									rules: [
										{ required: true, min: 11, message: '请输入11位手机号' },
									],
									initialValue: initialValue.mobile,
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
									initialValue: initialValue.type,
								})(
									<RadioGroup>
										<Radio value="2" onClick = {this.handleRadio.bind(this, '2')}>实时分账(必须拥有支付宝,收取 x% 手续费)</Radio>
										<Radio value="1" onClick = {this.handleRadio.bind(this, '1')}>财务定期结账(需提供正确银行卡号)</Radio>
									</RadioGroup>
								)}
							</FormItem>
							{ this.state.alipay ?
								<div>
									<FormItem
										{...formItemLayout}
										label="支付宝账号">
										{getFieldDecorator('alipay_account', {
											rules: [
												{required: true, message: '请输入支付宝账号'},
											],
											initialValue: initialValue.alipay_account,

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
											initialValue: initialValue.alipay_name,

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
											initialValue: initialValue.real_name,

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
											initialValue: initialValue.bank_name,

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
											initialValue: initialValue.account,

										})(
											<Input placeholder="请输入账号"/>
										)}
									</FormItem>
									<FormItem
										{...formItemLayout}
										label="短信通知手机号">
										{getFieldDecorator('bank_mobile', {
											rules: [
												{required: true, min: 11, message: '请输入11位短信通知手机号'},
											],
											initialValue: initialValue.bank_mobile,

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
											initialValue: [330000,331100],
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
									initialValue: initialValue.telephone,

								})(
									<Input placeholder="请输入服务电话" />
								)}
							</FormItem>
							<FormItem wrapperCol={{ span: 12, offset: 7 }}>
								<Button type="ghost" onClick={this.handleReset}>取消</Button>
								<Button type="primary" onClick={this.handleSubmit}>保存</Button>
							</FormItem>
						</Form>
					</div>
				</div>
			</div>
		</div>
		);
	}
}

UserForm = createForm()(UserForm);

UserForm.propTypes = {
	title: React.PropTypes.string,
};

export default connect(mapStateToProps, mapDispatchToProps)(UserForm);
