import React from 'react';
import './app.less';
import { Button, Form, Input, Radio, Select, Cascader, Modal, Breadcrumb } from 'antd';
const createForm = Form.create;
const FormItem = Form.Item;
const RadioGroup = Radio.Group;
import SchoolSelect from '../../common/school_select/app.jsx';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as DeviceActions from '../../../actions/device';
import * as RegionActions from '../../../actions/region';
import * as SchoolActions from '../../../actions/school';
import { Link } from 'react-router';


function mapStateToProps(state) {
	const { device: { detail, status, result, refDevice, pulseName, resultPutDetail, resultSerialNumber },
		region: {provinceList, provinceSchool},school:{schoolDetail} } = state;
	return { detail, status, result, refDevice, pulseName,
		resultPutDetail, resultSerialNumber, provinceList, provinceSchool,schoolDetail };
}

function mapDispatchToProps(dispatch) {
	const {
		getDeviceDetail,
		putDeviceDetail,
		postDeviceDetail,
		patchPulseName,
		putSerialNumber,
		getRefDevice,
	} = bindActionCreators(DeviceActions, dispatch);
	const {
		getProvinceList,
		getProvinceSchoolList,
	} = bindActionCreators(RegionActions, dispatch);
	const {
		getSchoolDetail,
	} = bindActionCreators(SchoolActions, dispatch);
	return {
		getDeviceDetail,
		putDeviceDetail,
		postDeviceDetail,
		patchPulseName,
		putSerialNumber,
		getRefDevice,
		getProvinceList,
		getProvinceSchoolList,
		getSchoolDetail,
	};
}
const key = ['first','second','third','fourth'];
const nameList = ['单脱价格','快洗价格','标准洗价格','大物洗价格'];

class DeviceForm extends React.Component {
	constructor(props, context) {
		super(props, context);
		this.state = {
			provinceId: '',
			schoolId: '',
			refDeviceType: 1,
			addNew: false,
			currentPulse: 1,
			firstPulseName: '',
			secondPulseName: '',
			thirdPulseName: '',
			fourthPulseName: '',
			visible: false,
			unsaved: true,
			tips: '',
		};
		this.handleSubmit = this.handleSubmit.bind(this);
		this.showModal = this.showModal.bind(this);
		this.hideModal = this.hideModal.bind(this);
		this.handleSelect = this.handleSelect.bind(this);
		this.changePulseName = this.changePulseName.bind(this);
		this.checkNumber = this.checkNumber.bind(this);
		this.checkPrice = this.checkPrice.bind(this);
	}
	static contextTypes = {
		router: React.PropTypes.object
	}
	componentWillMount() {
		const deviceId = this.props.params.id;
		if(deviceId) {
			this.props.getDeviceDetail(deviceId);
		} else {
			this.setState({addNew: true});
		}
		this.props.getRefDevice();
		const { schoolId } = this.props.params;
		this.props.getSchoolDetail(schoolId);
	}
	componentWillReceiveProps(nextProps) {
		const self = this;
		const pulseName = nextProps.pulseName;
		if(this.theName == 0){
			if(pulseName && pulseName.fetch == true) {
				// alert('服务名修改成功');
				const pulseNameKey = key[this.state.currentPulse-1] + 'PulseName';
				this[pulseNameKey] = self.pulseName;
			} else if (pulseName && pulseName.fetch == false) {
				alert('服务名修改失败,请重试.');
			}
			self.theName = 1;
		}
		// 修改详情时 设置初始省市 ID
		const deviceId = this.props.params.id;
		if(deviceId) {
			if(this.props.provinceList !== nextProps.provinceList) {
				const provinceId = nextProps.detail.result.data.provinceId;
				const schoolId = nextProps.detail.result.data.schoolId;
				const provinceName = nextProps.provinceList.result.data.filter(function (item) {
					return item.id == provinceId;
				});
				self.provinceId = provinceId;
				self.schoolId = schoolId;
				if(provinceName.length >= 1){
					self.provinceName = provinceName[0].name;
				}
				this.props.getProvinceSchoolList(provinceId);
				self.getSchool = 1;
			}
			if(this.getSchool
				&& this.props.provinceSchool !== nextProps.provinceSchool
				&& nextProps.provinceSchool
				&& nextProps.provinceSchool.fetch == true){
				const schoolName = nextProps.provinceSchool.result.data.filter(function (item) {
					return item.id == self.schoolId;
				})
				if(schoolName){
					if(schoolName.length > 0 ){
						self.schoolName = schoolName[0].name;
					}
				}
				else {
					alert(nextProps.provinceSchool.result.msg);
				}
				this.getSchool = 0;

			}
		}
		if(this.props.detail !== nextProps.detail && nextProps.detail.fetch == true){
			const device = nextProps.detail.result.data;
			self.firstPulseName = device.firstPulseName;
			self.secondPulseName = device.secondPulseName;
			self.thirdPulseName = device.thirdPulseName;
			self.fourthPulseName = device.fourthPulseName;
		}
		if(this.saveDetail == 1){
			const resultSerialNumber = this.props.resultSerialNumber;
			if(resultSerialNumber !== nextProps.resultSerialNumber) {
				if( nextProps.resultSerialNumber.fetch == true) {
					self.context.router.goBack();
					alert('添加设备成功');
					self.saveDetail = -1;
				} else if(nextProps.resultSerialNumber.fetch == false) {
					switch (nextProps.resultSerialNumber.result.status){
						case 1:
						case 3:
						case 12:
							alert(nextProps.resultSerialNumber.result.msg);
							break;
						default:
							alert('添加设备失败');
							break;
					}
				}
				self.saveDetail = -1;
			}
			const resultPutDetail = this.props.resultPutDetail;
			if(resultPutDetail !== nextProps.resultPutDetail) {
				if(nextProps.resultPutDetail.fetch == true){
					alert('修改设备成功');
					self.context.router.goBack();
					self.saveDetail = -1;
				} else if(nextProps.resultPutDetail.fetch == false) {
					alert('修改设备失败');
					self.saveDetail = -1;
				}
			}
		}

	}
	handleSubmit(e) {
		e.preventDefault();
		const self = this;
		this.props.form.validateFields((errors, values) => {
			if(!self.provinceId || !self.schoolId) {
				self.setState({tips:'必选'});
				// alert('请选择学校和省份');
				return;
			}
			if (errors) {
				return;
			}
			const deviceValue = {
				"serialNumber": values.serialNumber,
				"provinceId": self.provinceId,
				"schoolId": self.schoolId,
				// 'label': values.label,
				"address": values.address,
				"referenceDeviceId": values.referenceDevice,
				"firstPulsePrice": parseInt((+values.firstPulsePrice)*100),
				"secondPulsePrice": parseInt((+values.secondPulsePrice)*100),
				"thirdPulsePrice": parseInt((+values.thirdPulsePrice)*100),
				"fourthPulsePrice": parseInt((+values.fourthPulsePrice)*100),
				"firstPulseName": self.firstPulseName ? self.firstPulseName : "",
				"secondPulseName": self.secondPulseName ? self.secondPulseName : "",
				"thirdPulseName": self.thirdPulseName ? self.thirdPulseName : "",
				"fourthPulseName": self.fourthPulseName ? self.fourthPulseName : "",
			}
			const deviceId = this.props.params.id;
			if(deviceId) {
				this.props.putDeviceDetail(deviceId,deviceValue);
			} else {
				this.props.putSerialNumber(values.serialNumber,deviceValue);
			}
			self.saveDetail = 1;
		});
	}
	handleSelect(provinceId, schoolId) {
		this.provinceId = provinceId;
		this.schoolId = schoolId;
		this.setState({tips:''});
	}
	changeName(currentPulse,e) {
		e.preventDefault();
		this.setState({
			currentPulse: currentPulse,
		});
		this.showModal();
	}
	changePulseName(pulseName) {
		const deviceId = this.props.params.id;
		// 被修改脉冲的 key
		const pulseNameKey = key[this.state.currentPulse-1] + 'PulseName';
		const thePulseName = {};
		// 被修改的脉冲 key-value
		thePulseName[pulseNameKey] = pulseName;
		const addNew = this.state.addNew;
		this.theName = 0;
		this.pulseName = pulseName;
		if(addNew) {
			this[pulseNameKey] = pulseName;
		} else {
			const device = { deviceId: deviceId };
			let data = Object.assign({}, device, thePulseName);
			this.props.patchPulseName(deviceId, data);
		}
	}
	showModal() {
		this.setState({ visible: true });
	}
	hideModal() {
		// 取消就重置内部数据
		this.setState({ visible: false });
	}
	checkNumber(rule, value, callback) {
		var pattern=new RegExp(/^\d+$/);
		if(value && !pattern.test(value)){
			callback('只能为数字');
		} else {
			callback();
		}
	}
	checkPrice(rule, value, callback) {
		// 只要大于零的数字
		var pattern=new RegExp(/^(0|[1-9][0-9]{0,9})(\.[0-9]*)?$/g);
		if(value && !pattern.test(value)){
			callback('只能为数字');
		} else {
			callback();
		}
	}
	// 待优化
	checkOnePluse(rule,value,callback) {
		this.checkPrice(rule,value,callback);
	}
	checkTwoPluse(rule,value,callback) {
		this.checkPrice(rule,value,callback);
	}
	checkThreePluse(rule,value,callback) {
		this.checkPrice(rule,value,callback);
	}
	checkFourPluse(rule,value,callback) {
		this.checkPrice(rule,value,callback);
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
	render() {
		const schoolDetail = this.props.schoolDetail;
		let schoolName = '';
		if(schoolDetail && schoolDetail.fetch == true){
			schoolName = schoolDetail.result.data.name;
		}
		// 关联设备列表
		const refDevice = this.props.refDevice;
		let refDeviceNode = [];
		if(refDevice) {
			if(refDevice.fetch == true){
				refDeviceNode = refDevice.result.data.map(function (item, key) {
					return (
						<Radio key={key} value={item.id}>{item.name}</Radio>
					)
				})
			}
		}
		// 初始化参数
		const self = this;
		const detail = this.props.detail;
		const { id, schoolId } = this.props.params;
		let initialValue = {};
		if(detail && id) {
			if(detail.fetch == true){
				const device = detail.result.data;
				initialValue = {
					'serialNumber': device.serialNumber,
					'school': device.schoolId,
					'province': device.provinceId,
					// 'label': device.label,
					'address': device.address,
					'referenceDevice': device.referenceDeviceId,
					'firstPulsePrice': (device.firstPulsePrice/100).toString(),
					'secondPulsePrice': (device.secondPulsePrice/100).toString(),
					'thirdPulsePrice': (device.thirdPulsePrice/100).toString(),
					'fourthPulsePrice': (device.fourthPulsePrice/100).toString(),
					'firstPulseName': device.firstPulseName,
					'secondPulseName': device.secondPulseName,
					'thirdPulseName': device.thirdPulseName,
					'fourthPulseName': device.fourthPulseName,
				}
			}
		}
		const { getFieldDecorator } = this.props.form;
		const formItemLayout = {
			labelCol: { span: 7 },
			wrapperCol: { span: 12 },
		};
		let breadcrumb = '添加设备';
		if(id) {
			breadcrumb = '修改设备';
		}
		return (
			<section className="view-user-list" onKeyDown={this.handleEnter.bind(this)}>
				<header>
					{
						schoolId !== "-1" ?
						<Breadcrumb >
							<Breadcrumb.Item><Link to="/user">代理商管理</Link></Breadcrumb.Item>
							<Breadcrumb.Item><Link to="/user/device/list">设备管理</Link></Breadcrumb.Item>
							<Breadcrumb.Item><Link to={"/user/device/school/"+ schoolId}>{schoolName?schoolName:'未分类学校'}</Link></Breadcrumb.Item>
							<Breadcrumb.Item>{breadcrumb}</Breadcrumb.Item>
						</Breadcrumb>
							:
						<Breadcrumb >
							<Breadcrumb.Item><Link to="/user">代理商管理</Link></Breadcrumb.Item>
							<Breadcrumb.Item><Link to="/user/device/list">设备管理</Link></Breadcrumb.Item>
							<Breadcrumb.Item>{breadcrumb}</Breadcrumb.Item>
						</Breadcrumb>
					}

				</header>
				<section className="view-content">
					<Form horizontal>
						<FormItem
							{...formItemLayout}
							label="设备编号" >
							{getFieldDecorator('serialNumber', {
								rules: [
									{ len:10, message: '长度为十位' },
									{ required: true, message: '必填' },
								],
								initialValue: initialValue.serialNumber,
							})( id ?
								<Input disabled placeholder="请输入设备编号" />
								:
								<Input placeholder="请输入设备编号" />
							)}
						</FormItem>
						<div className="select-school">
							<label className="select-title">省份学校</label>
							<SchoolSelect handleSelect={this.handleSelect}
										  provinceId={this.provinceId}
										  schoolId={this.schoolId}
										  provinceName={this.provinceName}
										  schoolName={this.schoolName}
							/>
							{this.state.tips?<span className="tip-error">{this.state.tips}</span>
								:''}
						</div>
						<FormItem
							{...formItemLayout}
							label="楼道信息" >
							{getFieldDecorator('address', {
								rules: [
									{ max:30, message: '不超过三十个字' },
								],
								initialValue: initialValue.address,
							})(
								<Input placeholder="请输入楼道信息" />
							)}
						</FormItem>
						<FormItem
							{...formItemLayout}
							label="关联设备类型"
						>
							{getFieldDecorator('referenceDevice', {
								initialValue: initialValue.referenceDevice ?
									initialValue.referenceDevice : this.state.refDeviceType,
							})(
								<RadioGroup>
									{refDeviceNode}
								</RadioGroup>
							)}
						</FormItem>
						<FormItem
							{...formItemLayout}
							label="单脱价格(元)" >
							{getFieldDecorator('firstPulsePrice', {
								rules: [
									{ required: true, message: '必填' },
									{ validator: this.checkOnePluse.bind(this) },
								],
								initialValue: initialValue.firstPulsePrice,
							})(
								<Input placeholder="请输入单脱价格" />
							)}
							{this.firstPulseName !== nameList[0] && this.firstPulseName?
								<span>服务名称已修改为: {this.firstPulseName}
									<a href="#" onClick={this.changeName.bind(this,1)}>修改</a>
										</span> :
								<span><a href="#" onClick={this.changeName.bind(this,1)}>修改服务名称</a></span>
							}
						</FormItem>
						<FormItem
							{...formItemLayout}
							label="快洗价格(元)" >
							{getFieldDecorator('secondPulsePrice', {
								rules: [
									{ required: true, message: '必填' },
									{ validator: this.checkTwoPluse.bind(this) },
								],
								initialValue: initialValue.secondPulsePrice,
							})(
								<Input placeholder="请输入快洗价格"/>
							)}
							{this.secondPulseName !== nameList[1] && this.secondPulseName?
								<span>服务名称已修改为: {this.secondPulseName}
									<a href="#" onClick={this.changeName.bind(this,2)}>修改</a>
										</span> :
								<span><a href="#" onClick={this.changeName.bind(this,2)}>修改服务名称</a></span>
							}
						</FormItem>
						<FormItem
							{...formItemLayout}
							label="标准洗价格(元)">
							{getFieldDecorator('thirdPulsePrice', {
								rules: [
									{ required: true, message: '必填'},
									{ validator: this.checkThreePluse.bind(this) },
								],
								initialValue: initialValue.thirdPulsePrice,
							})(
								<Input placeholder="请输入标准洗价格"/>
							)}
							{this.thirdPulseName !== nameList[2] && this.thirdPulseName?
								<span>服务名称已修改为: {this.thirdPulseName}
									<a href="#" onClick={this.changeName.bind(this,3)}>修改</a>
										</span> :
								<span><a href="#" onClick={this.changeName.bind(this,3)}>修改服务名称</a></span>
							}
						</FormItem>
						<FormItem
							{...formItemLayout}
							label="大物洗价格(元)">
							{getFieldDecorator('fourthPulsePrice', {
								rules: [
									{ required: true, message: '必填'},
									{ validator: this.checkFourPluse.bind(this) },
								],
								initialValue: initialValue.fourthPulsePrice,
							})(
								<Input placeholder="请输入大物洗价格"/>
							)}
							{this.fourthPulseName !== nameList[3] && this.fourthPulseName?
									<span>服务名称已修改为: {this.fourthPulseName}
										<a href="#" onClick={this.changeName.bind(this,4)}>修改</a>
										</span> :
									<span><a href="#" onClick={this.changeName.bind(this,4)}>修改服务名称</a></span>
							}
						</FormItem>
						<FormItem wrapperCol={{ span: 12, offset: 7 }}>
							<Button type="ghost" onClick={this.goBack.bind(this)}>取消</Button>
							<Button type="primary" onClick={this.handleSubmit}>保存</Button>
						</FormItem>
						<div>
							<PulseName changePulseName={this.changePulseName}
									   visible={this.state.visible}
									   onCancel={this.hideModal.bind(this)}
									   currentPulse={this.state.currentPulse}
									   first={this.firstPulseName}
									   second={this.secondPulseName}
									   third={this.thirdPulseName}
									   fourth={this.fourthPulseName}
									   checkNumber={this.checkNumber}
							/>
						</div>
					</Form>
				</section>
			</section>

		);
	}
}

DeviceForm = createForm()(DeviceForm);

DeviceForm.propTypes = {
	title: React.PropTypes.string,
};

class PulseName extends React.Component {
	constructor(props) {
		super(props);
		this.handleSubmit = this.handleSubmit.bind(this);
		this.onCancel = this.onCancel.bind(this);
	}
	handleSubmit() {
		const currentPulse = this.props.currentPulse;
		const itemKey = key[currentPulse-1] + 'PulseName';
		const pulseName = this.props.form.getFieldsValue()[itemKey];
		this.props.form.validateFields((errors, values) => {
			if(errors){
				return false;
			} else {
				// 修改后的当前脉冲的值
				this.props.changePulseName(pulseName);
				this.props.onCancel();
			}
		})

	}
	onCancel() {
		this.props.onCancel();
		const { setFieldsValue } = this.props.form;
		// 脉冲字段,四个脉冲分别设置四种 name
		const currentPulse = this.props.currentPulse;
		switch (currentPulse){
			case 1:
				setFieldsValue({'firstPulseName':this.props.first?this.props.first:nameList[0]});
				break;
			case 2:
				setFieldsValue({'secondPulseName':this.props.second?this.props.second:nameList[1]});
				break;
			case 3:
				setFieldsValue({'thirdPulseName':this.props.third?this.props.third:nameList[2]});
				break;
			case 4:
				setFieldsValue({'fourthPulseName':this.props.fourth?this.props.fourth:nameList[3]});
				break;
		}
	}
	render() {
		const { getFieldDecorator, setFieldsValue } = this.props.form;
		const formItemLayout = {
			labelCol: { span: 4 },
			wrapperCol: { span: 20 },
		};
		const currentPulse = this.props.currentPulse;
		// 脉冲字段,四个脉冲分别设置四种 name
		const itemKey = key[currentPulse-1] + 'PulseName';
		let initialValue = '';
		switch (currentPulse) {
			case 1:
				initialValue = this.props.first?this.props.first:nameList[0];
				break;
			case 2:
				initialValue = this.props.second?this.props.second:nameList[1];
				break;
			case 3:
				initialValue = this.props.third?this.props.third:nameList[2];
				break;
			case 4:
				initialValue = this.props.fourth?this.props.fourth:nameList[3];
				break;
		}
		// 四个脉冲的初始值
		const itemNode = <FormItem {...formItemLayout} label="服务名称" >
			{getFieldDecorator(itemKey,{
				rules: [
					{ required: true, message: '必填' },
					{ max:30, message: '不超过三十个字'}
				],
				initialValue:initialValue})(<Input type="text"/>)}
		</FormItem>
		return (
			<div>
				<Modal title="修改服务名称" visible={this.props.visible} onOk={this.handleSubmit} onCancel={this.onCancel}>
					<Form horizontal>
						{itemNode}
					</Form>
				</Modal>
			</div>
		);
	}

}

PulseName = createForm()(PulseName);

export default connect(mapStateToProps, mapDispatchToProps)(DeviceForm);
