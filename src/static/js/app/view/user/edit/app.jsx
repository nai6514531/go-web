import React from 'react';
import './app.less';
import { Button, Form, Input, Radio, Select, Cascader, Breadcrumb } from 'antd';
const createForm = Form.create;
const FormItem = Form.Item;
const RadioGroup = Radio.Group;
import { Link } from 'react-router';


import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as UserActions from '../../../actions/user';
import * as regionActions from '../../../actions/region';


function mapStateToProps(state) {
	const { user: { resultPostDetail, resultPutDetail, detail }, region: { provinceList, provinceCity, cityList } }= state;
	return { resultPostDetail, resultPutDetail, detail, provinceList, provinceCity, cityList };
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
			type: "3",
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
        const self = this;
		if(this.props.detail !== nextProps.detail && nextProps.detail && nextProps.detail.fetch == true){
            if(nextProps.detail.result.data.cashAccount){
				const type = nextProps.detail.result.data.cashAccount.type;
				if(type && type == 3){
					this.setState({ alipay: false });
					const provinceId = nextProps.detail.result.data.cashAccount.provinceId;
					this.props.getProvinceCityList(provinceId);
				} else {
					this.setState({ alipay: true });
				}
			}
		}
        if(this.props.provinceCity !== nextProps.provinceCity){
            // 每次切换省,都要将城市预至成第一个
            if(nextProps.provinceCity.fetch == true) {
                self.cityId = nextProps.provinceCity.result.data[0].id;
            }
        }
		const resultPostDetail = this.props.resultPostDetail;
		if(resultPostDetail !== nextProps.resultPostDetail && nextProps.resultPostDetail.fetch == true){
			console.log('添加成功');
		} else {
			console.log('添加失败');
		}
		const resultPutDetail = this.props.resultPutDetail;
		if(resultPutDetail !== nextProps.resultPutDetail && nextProps.resultPutDetail.fetch == true){
			console.log('修改成功');
		} else {
			console.log('修改失败');
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
        this.setState({provinceChange:true});
        this.setState({cityChange: true});
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
                    "address": values.address,
					"email": ""
			}
			if(values.type == 3) {
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
		this.setState({alipay:false});
	}
	handleRadio(select) {
		if (select === '3') {
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
                // 修改用户 省市信息预设为用户省市信息
                if (this.state.provinceChange == false) {
                    self.provinceId = detail.result.data.cashAccount.provinceId;
                }
                if (this.state.cityChange == false) {
                    self.cityId = detail.result.data.cashAccount.cityId;
                }
            }
        } else {
            if(provinceCity && provinceCity.fetch == true && provinceList && provinceList.fetch == true) {
                // 新增用户 省市信息预设为第一个
                // 获取省市信息成功但是实际没数据后报错
                if (this.state.provinceChange == false) {
                    self.provinceId = provinceCity.result.data[0].id;
                }
                if (this.state.cityChange == false) {
                    self.cityId = provinceCity.result.data[0].id;
                }
            }
        }

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
				if(data.cashAccount && data.cashAccount.type == 3){
					cashValues = {
						type: data.cashAccount.type.toString(),
						realName: data.cashAccount.realName,
						bankName: data.cashAccount.bankName,
						account: data.cashAccount.account,
						bankMobile: data.cashAccount.mobile,
					}
				} else if (data.cashAccount && data.cashAccount.type == 1){
					cashValues = {
						type: data.cashAccount.type.toString(),
						alipayAccount: data.cashAccount.account,
						alipayName: data.cashAccount.realName,
					}
				}
				initialValue = Object.assign({}, baseValues, cashValues);
			} else {
				alert('获取用户信息失败,请重试.');
			}
		}
		const { getFieldDecorator } = this.props.form;
		const formItemLayout = {
			labelCol: { span: 7 },
			wrapperCol: { span: 12 },
		};

		return (
			<section className="view-user-list">
				<header>
					<Breadcrumb separator=">">
						<Breadcrumb.Item><Link to="/user">代理商管理</Link></Breadcrumb.Item>
						<Breadcrumb.Item>添加/修改用户</Breadcrumb.Item>
					</Breadcrumb>
				</header>
				<section className="view-content">
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
								initialValue: initialValue.type ? initialValue.type : this.state.type,
							})(
								<RadioGroup>
									<Radio value="1" onClick = {this.handleRadio.bind(this, '1')}>
										实时分账(必须拥有支付宝,收取 x% 手续费)
									</Radio>
									<Radio value="3" onClick = {this.handleRadio.bind(this, '3')}>
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
									<label>省份</label>
									<select name="province" id="province" value={this.provinceId}
											onChange={this.provinceChange.bind(this)}>
										{this.provinceOption()}
									</select>
									<span></span>
								</div>
								<div className="province-filter">
									<label>城市</label>
									<select name="city" id="city" value={this.cityId}
											onChange={this.cityChange.bind(this)}>
										{this.cityOption()}
									</select>
									<span></span>
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
				</section>
			</section>
		);
	}
}

UserForm = createForm()(UserForm);

UserForm.propTypes = {
	title: React.PropTypes.string,
};

export default connect(mapStateToProps, mapDispatchToProps)(UserForm);
