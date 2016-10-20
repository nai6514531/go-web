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
        getProvinceCityList,
	} = bindActionCreators(regionActions, dispatch);
	return {
		postUserDetail,
		putUserDetail,
		getUserDetail,
		getProvinceList,
		getCityList,
        getProvinceCityList,
	};
}

class UserForm extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			alipay: false,
            provinceChange: false,
            cityChange: false,
		}
		this.handleSubmit = this.handleSubmit.bind(this);
		this.handleReset = this.handleReset.bind(this);
        this.provinceChange = this.provinceChange.bind(this);
	}
	componentWillMount() {
        // 默认北京市东城区
        this.props.getProvinceList();
        this.props.getProvinceCityList(110000);
		const id = this.props.params.id;
		if(id && id !== 'new') {
			this.props.getUserDetail(id);
		} else {
            this.provinceId = 110000;
        }
	}
	componentWillReceiveProps(nextProps) {
		if(this.props.detail== undefined && nextProps.detail && nextProps.detail.fetch == true){
            const provinceId = nextProps.detail.result.data.cashAccount.provinceId;
            this.props.getProvinceCityList(provinceId);
            const type = nextProps.detail.result.data.cashAccount.type;
            if(type && type == 1){
				this.setState({ alipay: false });
			} else {
				this.setState({ alipay: true });
			}
		}
	}
    provinceOption() {
        if(this.props.provinceList && this.props.provinceList.fetch == true){
            return this.props.provinceList.result.data.map(function (item, key) {
                    return <option key={key} value={item.id}>{item.name}</option>
            })
        }
    }
    provinceChange(event) {
        this.props.getProvinceCityList(event.target.value);
        this.provinceId = event.target.value;
        console.log('province change',this.provinceId);
        this.setState({provinceChange:true});
    }
    cityOption() {
        if(this.props.provinceCity && this.props.provinceCity.fetch == true){
            return this.props.provinceCity.result.data.map(function (item, key) {
                    return <option key={key} value={item.id}>{item.name}</option>
            })
        }
    }
    cityChange(event) {
        const self = this;
        self.cityId = event.target.value;
        console.log('change city id',self.cityId);
        this.setState({cityChange:true});
    }
	handleSubmit(e) {
		e.preventDefault();
        const self = this;
		this.props.form.validateFields((errors, values) => {
			if (errors) {
				return;
			}
			let cashAccount = {};
			const user = {
					"name": values.name,
					"contact": values.contact,
					"mobile": values.mobile,
					"telephone": values.telephone,
					"email": ""
			}
			if(values.type == 1) {
                cashAccount = {
                    "type": parseInt(values.type),
                    "realName": values.realName,
                    "bankName": values.bankName,
                    "account": values.account,
                    "mobile": values.bankMobile,
                    "cityId": parseInt(self.cityId),
                    "provinceId": parseInt(self.provinceId),
				}
			} else {
                cashAccount = {
                    "type": parseInt(values.type),
                    "realName": values.alipayName,
                    "account": values.alipayAccount,
				}
			}
            user.cashAccount = cashAccount;
			if(this.props.params.id == 'new') {
                user.account = values.mobile;
                this.props.postUserDetail(user);
			} else {
                user.account = self.account;
                this.props.putUserDetail(this.props.params.id, user);
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
        const self = this;
        const { id } = this.props.params;
        const { detail, provinceCity, provinceList } = this.props;
        if(id && id !== 'new') {
            if(detail && detail.fetch == true && provinceCity && provinceCity.fetch == true){
                if (this.state.provinceChange == false) {
                    self.provinceId = detail.result.data.cashAccount.provinceId;
                }
                if (this.state.cityChange == false) {
                    self.cityId = detail.result.data.cashAccount.cityId;
                }
                console.log('修改默认的省份城市为用户的',self.cityId,self.provinceId);
            }
        } else {
            if(provinceCity && provinceCity.fetch == true && provinceList && provinceList.fetch == true) {
                if (this.state.provinceChange == false) {
                    self.provinceId = provinceCity.result.data[0].id;
                }
                if (this.state.cityChange == false) {
                    self.cityId = provinceCity.result.data[0].id;
                }
            }
        }
		// const result = this.props.result;
		// if(result) {
		// 	if(result.fetch == true){
		// 		// alert('修改成功');
		// 	} else {
		// 		console.log(result.result.msg);
		// 	}
		// }
		let initialValue = {};
		if(id && id !== 'new' && detail) {
			if(detail.fetch == true){
				const data = detail.result.data;
				const baseValues = {
					name: data.name,
					contact: data.contact,
					address: data.address,
					mobile : data.mobile,
					telephone: data.telephone,
				}
                self.account = data.account;
				let cashValues = {};
				if(data.cashAccount && data.cashAccount.type == 1){
					cashValues = {
						type: data.cashAccount.type.toString(),
						realName: data.cashAccount.realName,
						bankName: data.cashAccount.bankName,
						account: data.cashAccount.account,
						bankMobile: data.cashAccount.mobile,
					}
				} else if (data.cashAccount && data.cashAccount.type == 2){
					cashValues = {
						type: data.cashAccount.type.toString(),
						alipayAccount: '',
						alipayName: '',
					}
				}
				initialValue = Object.assign({}, baseValues, cashValues);
			} else {
				console.log('拉取用户详情失败');
			}
		}
		const { getFieldDecorator } = this.props.form;
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
                            <div>{this.cityId},{this.provinceId}</div>
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
										{ required: true, len: 11, message: '请输入11位手机号' },
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
										<Radio value="2" onClick = {this.handleRadio.bind(this, '2')}>
                                            实时分账(必须拥有支付宝,收取 x% 手续费)
                                        </Radio>
										<Radio value="1" onClick = {this.handleRadio.bind(this, '1')}>
                                            财务定期结账(需提供正确银行卡号)
                                        </Radio>
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
												{required: true, len: 11, message: '请输入11位短信通知手机号'},
											],
											initialValue: initialValue.bankMobile,

										})(
											<Input placeholder="请输入短信通知手机号"/>
										)}
									</FormItem>
                                    <div className="province-filter">
                                        <span>省份:</span>
                                        <select name="province" id="province" value={this.provinceId}
                                                onChange={this.provinceChange.bind(this)}>
                                            {this.provinceOption()}
                                        </select>
                                    </div>
                                    <div className="province-filter">
                                        <span>城市:</span>
                                        <select name="city" id="city" value={this.cityId}
                                                onChange={this.cityChange.bind(this)}>
                                            {this.cityOption()}
                                        </select>
                                    </div>
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
