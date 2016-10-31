import React from 'react';
import './app.less';
import { Button, Form, Input, Radio, Select, Cascader, Breadcrumb } from 'antd';
const createForm = Form.create;
const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const Option = Select.Option;
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
	constructor(props, context) {
		super(props, context);
		this.state = {
			type: "3",
			payType: 0,
            provinceChange: false,
            cityChange: false,
			unsaved: true,
		}
		this.handleSubmit = this.handleSubmit.bind(this);
        this.provinceChange = this.provinceChange.bind(this);
		this.checkNumber = this.checkNumber.bind(this);
	}
	static contextTypes = {
		router: React.PropTypes.object
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
				// const type = Math.abs(nextProps.detail.result.data.cashAccount.type);
				const type = nextProps.detail.result.data.cashAccount.type;
				console.log('the type',type);
				if(type) {
					switch (type) {
						case 1:
							this.setState({ payType: 1 });
							break;
						case 3:
							this.setState({ payType: 3 });
							const provinceId = nextProps.detail.result.data.cashAccount.provinceId;
							this.props.getProvinceCityList(provinceId);
							break;
						default:
							this.setState({ payType: 0 });
					}
				}
			}
		}
		if(self.saveDetail == 1){
			const resultPostDetail = this.props.resultPostDetail;
			if(resultPostDetail !== nextProps.resultPostDetail
				&& nextProps.resultPostDetail.fetch == true){
				alert('添加代理商成功');
				self.context.router.goBack();
				self.saveDetail = -1;
			} else if(resultPostDetail !== nextProps.resultPostDetail
				&& nextProps.resultPostDetail.fetch == false){
				const code = nextProps.resultPostDetail.result.status;
				switch (code) {
					case 13:
					case 7:
						alert('该手机号已存在');
						break;
					default:
						alert('添加代理商失败');
				}
				self.saveDetail = -1;
			}
			const resultPutDetail = this.props.resultPutDetail;
			if(resultPutDetail !== nextProps.resultPutDetail
				&& nextProps.resultPutDetail.fetch == true){
				alert('修改代理商成功');
				self.context.router.goBack();
				self.saveDetail = -1;
			} else if(resultPutDetail !== nextProps.resultPutDetail
				&& nextProps.resultPutDetail.fetch == false){
				const code = nextProps.resultPutDetail.result.status;
				switch (code) {
					case 8:
					case 7:
						alert('该手机号已存在');
						break;
					default:
						alert('修改代理商失败');
				}
				// alert('修改代理商失败');
				self.saveDetail = -1;
			}
		}
	}
    provinceChange(event) {
		this.props.getProvinceCityList(event);
		const { setFieldsValue } = this.props.form;
		setFieldsValue({'cityId':'-1'});
		this.default = -1;
        this.setState({provinceChange:true});
        this.setState({cityChange: true});
    }
    cityChange(event) {
        this.setState({cityChange:true});
    }
	handleSubmit(e) {
		e.preventDefault();
        const self = this;
		this.props.form.validateFields((errors, values) => {
			if (errors) {
				return;
			}
			if(values.cityId == -1) {
				self.cityIdHelp = {'help':'请选择城市','className':'has-error'};
				alert('请选择城市');
				return false;
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
                    "cityId": parseInt(values.cityId),
                    "provinceId": parseInt(values.provinceId),
				}
			} else if(values.type == 1){
                cashAccount = {
                    "type": parseInt(values.type),
                    "realName": values.alipayName,
                    "account": values.alipayAccount,
				}
			} else {
				cashAccount = {
					"type": parseInt(values.type),
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
			self.saveDetail = 1;
		});
	}

	handleRadio(select) {
		if (select === '3') {
			this.setState({ payType: 3 });
		} else if (select === '1') {
			this.setState({ payType: 1 });
		} else {
			this.setState({ payType: 0 });
		}
	}
	handleEnter(event) {
		if (event.keyCode==13) {
			this.handleSubmit(event);
		}
	}
	goBack() {
		if(this.state.unsaved) {
			if(confirm('确定取消?')){
				this.context.router.goBack();
			}
		}
	}
	checkNumber(rule, value, callback) {
		var pattern=new RegExp(/^\d+$/);
		if(pattern.test(value) || !value){
			callback();
		} else {
			callback('只能为数字');
		}
	}
	checkAreaCode(rule, value, callback) {
		var pattern = new RegExp(/^((0\d{2,3}-\d{7,8})|(1\d{10}))$/);
		if(pattern.test(value) || !value){
			callback();
		} else {
			callback('请填写正确号码');
		}
	}
	render() {
		let ProvinceNode = [];
		if(this.props.provinceList && this.props.provinceList.fetch == true){
			ProvinceNode = this.props.provinceList.result.data.map(function (item, key) {
				return <Option key={key} value={item.id.toString()}>{item.name}</Option>
			})
		}
		let cityNode = [];
		if(this.props.provinceCity && this.props.provinceCity.fetch == true){
			const firstNode = <Option key="-1" value="-1">请选择城市</Option>;
			cityNode.push(firstNode);
			const list = this.props.provinceCity.result.data;
			for(let i = 0;i<list.length; i++) {
				const item = <Option key={i} value={list[i].id.toString()}>{list[i].name}</Option>
				cityNode.push(item);
			}
			// cityNode = this.props.provinceCity.result.data.map(function (item, key) {
			// 	return <Option key={key} value={item.id.toString()}>{item.name}</Option>
			// })
		}
		const self = this;
        const { id } = this.props.params;
		const userId = USER.id;
        const { detail, provinceCity, provinceList } = this.props;
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
				if(data.cashAccount) {
					const type = Math.abs(data.cashAccount.type);
					if(type == 3) {
						cashValues = {
							type: data.cashAccount.type.toString(),
							realName: data.cashAccount.realName,
							bankName: data.cashAccount.bankName,
							account: data.cashAccount.account,
							bankMobile: data.cashAccount.mobile,
							provinceId: data.cashAccount.provinceId.toString(),
							cityId: data.cashAccount.cityId.toString(),
						}
					} else if (type == 1) {
						cashValues = {
							type: data.cashAccount.type.toString(),
							alipayAccount: data.cashAccount.account,
							alipayName: data.cashAccount.realName,
						}
					}
				}
				initialValue = Object.assign({}, baseValues, cashValues);
			} else {
				console.log('获取代理商信息失败,请重试.');
			}
		}
		const { getFieldDecorator } = this.props.form;
		const formItemLayout = {
			labelCol: { span: 7 },
			wrapperCol: { span: 12 },
		};
		let breadcrumb = '添加代理商';
		if(id !== 'new') {
			breadcrumb = '修改代理商';
		}
		let payNode = '';
		this.cityIdHelp = {};
		if(this.state.payType == 1){
			payNode = <div>
				<FormItem
					{...formItemLayout}
					label="支付宝账号">
					{getFieldDecorator('alipayAccount', {
						rules: [
							{required: true,  message: '必填'},
							{ max:30, message: '不超过三十个字'},
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
							{required: true, message: '必填'},
							{max:30, message: '不超过三十个字'},
						],
						initialValue: initialValue.alipayName,

					})(
						<Input placeholder="请输入支付宝姓名"/>
					)}
				</FormItem>
			</div>
		} else if (this.state.payType == 3){
			payNode = <div>
				<FormItem
					{...formItemLayout}
					label="转账户名">
					{getFieldDecorator('realName', {
						rules: [
							{required: true, message: '必填'},
							{max:30, message: '不超过三十个字'},
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
							{required: true, message: '必填'},
							{max:30, message: '不超过三十个字'},
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
							{required: true, message: '必填'},
							{max:30, message: '不超过三十位'},
							{ validator: this.checkNumber },
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
							{required: true, message: '必填'},
							{len: 11, message: '请输入11位短信通知手机号'},
						],
						initialValue: initialValue.bankMobile,

					})(
						<Input placeholder="请输入短信通知手机号"/>
					)}
				</FormItem>
				<FormItem
					{...formItemLayout}
					label="省份"
				>
					{getFieldDecorator('provinceId', {
						rules: [
							{ required: true, message: '请选择省份' },
						],
						initialValue: initialValue.provinceId,
					})(
						<Select placeholder="请选择省份" onChange={this.provinceChange.bind(this)}>
							{ProvinceNode}
						</Select>
					)}
				</FormItem>
				<FormItem
					{...formItemLayout}
					label="城市"
					{...this.cityIdHelp}
				>
					{getFieldDecorator('cityId', {
						rules: [
							{ required: true, message: '请选择城市' },
						],
						initialValue: initialValue.cityId,
					})(
						<Select placeholder="请选择城市" onChange={this.cityChange.bind(this)}>
							{cityNode}
						</Select>
					)}
				</FormItem>
			</div>
		}
		return (
			<section className="view-user-list" onKeyDown={this.handleEnter.bind(this)}>
				<header>
					{userId == id?
						<Breadcrumb >
							<Breadcrumb.Item><Link to="/user">代理商管理</Link></Breadcrumb.Item>
							<Breadcrumb.Item>{breadcrumb}</Breadcrumb.Item>
						</Breadcrumb>
						:
						<Breadcrumb >
							<Breadcrumb.Item><Link to="/user">代理商管理</Link></Breadcrumb.Item>
							<Breadcrumb.Item><Link to={"/user/" + userId}>下级代理商</Link></Breadcrumb.Item>
							<Breadcrumb.Item>{breadcrumb}</Breadcrumb.Item>
						</Breadcrumb>
					}

				</header>
				<section className="view-content">
					<Form horizontal>
						<FormItem
							{...formItemLayout}
							label="代理商名称" >
							{getFieldDecorator('name', {
								rules: [
									{required: true, message: '必填'},
									{max:30, message: '不超过三十个字' },
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
									{ required: true, message: '必填' },
									{ max:30, message: '不超过三十个字' },
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
									{ required: true, message: '必填' },
									{ max:30, message: '不超过三十个字' },
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
									{ len: 11, message: '请输入11位' },
									{ required: true, message: '必填' },
									{ validator: this.checkNumber },
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
									{  message: '请选择收款方式' },
								],
								initialValue: initialValue.type? (+initialValue.type<=0?"0":initialValue.type): this.state.payType.toString(),
							})(
								<RadioGroup>
									<Radio value="0" onClick = {this.handleRadio.bind(this, '0')} className="radio-block">
										无
									</Radio>
									<Radio value="1" onClick = {this.handleRadio.bind(this, '1')} className="radio-block">
										实时分账(必须拥有支付宝,收取 x% 手续费)
									</Radio>
									<Radio value="3" onClick = {this.handleRadio.bind(this, '3')} className="radio-block">
										财务定期结账(需提供正确银行卡号)
									</Radio>
								</RadioGroup>
							)}
						</FormItem>
						{payNode}
						<FormItem
							{...formItemLayout}
							label="服务电话" >
							{getFieldDecorator('telephone', {
								rules: [
									{ required: true, message: '必填' },
									{ max:30, message: '长度不超过三十位' },
									{ validator: this.checkAreaCode },
								],
								initialValue: initialValue.telephone,

							})(
								<Input placeholder="请输入服务电话" />
							)}
						</FormItem>
						<FormItem wrapperCol={{ span: 12, offset: 7 }}>
							<Button type="ghost" onClick={this.goBack.bind(this)}>取消</Button>
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
