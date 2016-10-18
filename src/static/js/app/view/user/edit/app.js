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
	const { user: { result, detail }, region: { provinceList, provinceCity, cityList } }= state;
	return { result, detail, provinceList, provinceCity, cityList };
}

function mapDispatchToProps(dispatch) {
	const {
		postUserDetail,
		putUserDetail,
		getUserDetail,
	} = bindActionCreators(UserActions, dispatch);
	const {
		getProvinceList,
		getCityList,
	} = bindActionCreators(regionActions, dispatch);
	return {
		postUserDetail,
		putUserDetail,
		getUserDetail,
		getProvinceList,
		getCityList,
	};
}

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
		// if(user_data.cash.type == 1) {
		// 	this.setState({ alipay: false });
		// } else {
		// 	this.setState({ alipay: true });
		// }
		this.props.getProvinceList();
		this.props.getCityList();
		const id = this.props.params.id;
		if(id && id !== 'new') {
			this.props.getUserDetail(id);
		}
	}
	handleSubmit(e) {
		e.preventDefault();
		this.props.form.validateFields((errors, values) => {
			if (errors) {
				return;
			}
			let cashValue = {};
			const baseValue = {
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
				cashValue = {
					"cash": {
						"type": parseInt(values.type),
						"realName": values.realName,
						"bankName": values.bankName,
						"account": values.account,
						"mobile": values.bankMobile,
						"cityId": values.city[1],
						"provinceId":  values.city[0]
					}
				}
			} else {
				cashValue = {
					"cash": {
						"realName": values.alipayName,
						"account": values.alipayAccount,
					}
				}
			}
			const data = Object.assign({}, baseValue, cashValue);
			if(this.props.params.id == 'new') {
				this.props.postUserDetail(data);
			} else {
				this.props.putUserDetail(this.props.params.id, data);
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
		const detail = this.props.detail;
		let initialValue = {};
		if(id && id !== 'new' && detail) {
			if(detail.fetch == true){
				const data = detail.result.data;
				const baseValues = {
					name: data.user.name,
					contact: data.user.contact,
					address: data.user.address,
					mobile : data.user.mobile,
					telephone: data.user.telephone,
				}
				let cashValues = {};
				if(data.cash && data.cash.type == 1){
					cashValues = {
						type: data.cash.type.toString(),
						realName: data.cash.realName,
						bankName: data.cash.bankName,
						account: data.cash.account,
						bankMobile: data.cash.mobile,
						city: [data.cash.provinceId,data.cash.cityId],
					}
				} else if (data.cash && data.cash.type == 2){
					cashValues = {
						type: data.cash.type.toString(),
						alipayAccount: '',
						alipayName: '',
					}
				}
				initialValue = Object.assign({}, baseValues, cashValues);
			} else {
				console.log('拉取用户详情失败');
			}
		}
		const provinceList = this.props.getProvinceList;
		const cityList = this.props.getCityList;
		// 待优化
		let address = [];
		if(provinceList && cityList) {
			if(provinceList.fetch == true){
				address = provinceList.result.data.map(function(item, key){
					const data = cityList.result.data;
					let children = [];
					for (let i = 0; i < data.length; i++){
						if( data[i].parentId == item.id) {
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
										{getFieldDecorator('alipayAccount', {
											rules: [
												{required: true, message: '请输入支付宝账号'},
											],
											initialValue: initialValue.alipayAccount,

										})(
											<Input placeholder="请输入支付宝账号"/>
										)}
									</FormItem>
									<FormItem
										{...formItemLayout}
										label="支付宝姓名">
										{getFieldDecorator('alipayName', {
											rules: [
												{required: true, message: '请输入支付宝姓名'},
											],
											initialValue: initialValue.alipayName,

										})(
											<Input placeholder="请输入支付宝姓名"/>
										)}
									</FormItem>
								</div> :
								<div>
									<FormItem
										{...formItemLayout}
										label="转账户名">
										{getFieldDecorator('realName', {
											rules: [
												{required: true, message: '请输入转账户名'},
											],
											initialValue: initialValue.realName,

										})(
											<Input placeholder="请输入转账户名"/>
										)}
									</FormItem>
									<FormItem
										{...formItemLayout}
										label="开户行">
										{getFieldDecorator('bankName', {
											rules: [
												{required: true, message: '请输入开户行'},
											],
											initialValue: initialValue.bankName,

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
										{getFieldDecorator('bankMobile', {
											rules: [
												{required: true, min: 11, message: '请输入11位短信通知手机号'},
											],
											initialValue: initialValue.bankMobile,

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
											initialValue: initialValue.type,
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
