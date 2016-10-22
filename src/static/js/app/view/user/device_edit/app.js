import React from 'react';
import './app.less';
import { Button, Form, Input, Radio, Select, Cascader, Modal, Breadcrumb } from 'antd';
const createForm = Form.create;
const FormItem = Form.Item;
const RadioGroup = Radio.Group;
import SchoolSelect from '../../common/school_select/app';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as DeviceActions from '../../../actions/device';
import * as RegionActions from '../../../actions/region';


function mapStateToProps(state) {
	const { device: { detail, status, result, refDevice, pulseName }, region: {provinceList, provinceSchool} } = state;
	return { detail, status, result, refDevice, pulseName, provinceList, provinceSchool };
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
	return {
		getDeviceDetail,
		putDeviceDetail,
		postDeviceDetail,
		patchPulseName,
		putSerialNumber,
		getRefDevice,
		getProvinceList,
		getProvinceSchoolList,
	};
}
const key = ['first','second','third','fourth'];

class DeviceForm extends React.Component {
	constructor(props) {
		super(props);
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
		};
		this.handleSubmit = this.handleSubmit.bind(this);
		this.handleReset = this.handleReset.bind(this);
		this.showModal = this.showModal.bind(this);
		this.hideModal = this.hideModal.bind(this);
		this.handleSelect = this.handleSelect.bind(this);
		this.changePulseName = this.changePulseName.bind(this);
		this.checkNumber = this.checkNumber.bind(this);
	}
	componentWillMount() {
		const deviceId = this.props.params.id;
		if(deviceId) {
			this.props.getDeviceDetail(deviceId);
		} else {
			this.setState({addNew: true});
		}
		// 获取关联设备列表
		this.props.getRefDevice();
	}
	componentWillReceiveProps(nextProps) {
		const self = this;
		const pulseName = nextProps.pulseName;
		if(this.theName == 0){
			if(pulseName && pulseName.fetch == true) {
				alert('脉冲名修改成功');
				const pulseNameKey = key[this.state.currentPulse-1] + 'PulseName';
				this[pulseNameKey] = self.pulseName;
			} else if (pulseName && pulseName.fetch == false) {
				alert('脉冲名修改失败,请重试.');
			}
			self.theName = 1;
		}
		// 修改详情时 设置初始省市 ID
		const deviceId = this.props.params.id;
		if(deviceId) {
			if(this.props.provinceList !== nextProps.provinceList) {
				const provinceId = nextProps.detail.result.data.provinceId;
				const cityId = nextProps.detail.result.data.cityId;
				const provinceName = nextProps.provinceList.result.data.filter(function (item) {
					return item.id == provinceId;
				});
				self.provinceId = provinceId;
				self.cityId = cityId;
				self.provinceName = provinceName[0].name;
				this.props.getProvinceSchoolList(provinceId);
			}
			if(this.props.provinceSchool == undefined && this.props.provinceSchool !== nextProps.provinceSchool) {
				const schoolName = nextProps.provinceSchool.result.data.filter(function (item) {
					return item.id == self.schoolId;
				})
				self.schoolName = schoolName[0].name;
			}
		}

		if(this.props.detail !== nextProps.detail && nextProps.detail.fetch == true){
			const device = nextProps.detail.result.data;
			self.firstPulseName = device.firstPulseName;
			self.secondPulseName = device.secondPulseName;
			self.thirdPulseName = device.thirdPulseName;
			self.fourthPulseName = device.fourthPulseName;
		}
	}
	handleSubmit(e) {
		e.preventDefault();
		const self = this;
		this.props.form.validateFields((errors, values) => {
			if (errors) {
				return;
			}
			console.log(values);
			const deviceValue = {
				"serialNumber": values.serialNumber,
				"provinceId": self.provinceId,
				"schoolId": self.schoolId,
				'label': values.label,
				"address": values.address,
				"referenceDeviceId": values.referenceDevice,
				"firstPulsePrice": parseInt(values.firstPulsePrice),
				"secondPulsePrice": parseInt(values.secondPulsePrice),
				"thirdPulsePrice": parseInt(values.thirdPulsePrice),
				"fourthPulsePrice": parseInt(values.fourthPulsePrice),
				"firstPulseName": self.firstPulseName ? self.firstPulseName : "",
				"secondPulseName": self.secondPulseName ? self.secondPulseName : "",
				"thirdPulseName": self.thirdPulseName ? self.thirdPulseName : "",
				"fourthPulseName": self.fourthPulseName ? self.fourthPulseName : "",
			}
			const deviceId = this.props.params.id;
			// 新增设备
			// this.props.postDeviceDetail(deviceValue);
			if(deviceId) {
				this.props.putDeviceDetail(deviceId,deviceValue);
			} else {
				this.props.putSerialNumber(values.serialNumber,deviceValue);
			}
			// 修改设备
		});
	}
	handleReset(e) {
		e.preventDefault();
		this.props.form.resetFields();
	}
	handleSelect(provinceId, schoolId) {
		this.provinceId = provinceId;
		this.schoolId = schoolId;
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
		this.setState({ visible: false });
	}
	checkNumber(rule, value, callback) {
		var pattern=new RegExp(/\d+/);
		if(pattern.test(parseInt(value))){
			callback();
		} else {
			callback('只能为数字');
		}
	}
	render() {
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
		console.log('device',this.props.detail);
		const { id } = this.props.params;
		let initialValue = {};
		if(detail && id) {
			if(detail.fetch == true){
				const device = detail.result.data;
				initialValue = {
					'serialNumber': device.serialNumber,
					'school': device.schoolId,
					'province': device.provinceId,
					'label': device.label,
					'address': device.address,
					'referenceDevice': device.referenceDeviceId,
					'firstPulsePrice': device.firstPulsePrice.toString(),
					'secondPulsePrice': device.secondPulsePrice.toString(),
					'thirdPulsePrice': device.thirdPulsePrice.toString(),
					'fourthPulsePrice': device.fourthPulsePrice.toString(),
					'firstPulseName': device.firstPulseName,
					'secondPulseName': device.secondPulseName,
					'thirdPulseName': device.thirdPulseName,
					'fourthPulseName': device.fourthPulseName,

				}
				// 由于这边设置了,所以修改后又在这里被修改回来
				self.provinceId = device.provinceId;
				self.schoolId = device.schoolId;
			}
		}
		const { getFieldDecorator } = this.props.form;
		const formItemLayout = {
			labelCol: { span: 7 },
			wrapperCol: { span: 12 },
		};
		return (
			<div className="body-panel">
				<div className="detail">
					<div className="detail-head">
						<Breadcrumb separator=">">
							<Breadcrumb.Item>代理商管理</Breadcrumb.Item>
							<Breadcrumb.Item href="#">设备管理</Breadcrumb.Item>
							<Breadcrumb.Item href="#">添加</Breadcrumb.Item>
						</Breadcrumb>
					</div>
					<div className="detail-form">
						<Form horizontal>
							<FormItem
								{...formItemLayout}
								label="设备编号" >
								{getFieldDecorator('serialNumber', {
									rules: [
										{ required: true, message: '请输入设备编号' },
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
							</div>
							<FormItem
								{...formItemLayout}
								label="学校区域信息" >
								{getFieldDecorator('address', {
									rules: [
										{ message: '请输入学校区域信息' },
									],
									initialValue: initialValue.address,
								})(
									<Input placeholder="请输入学校区域信息" />
								)}
							</FormItem>
							<FormItem
								{...formItemLayout}
								label="楼层信息" >
								{getFieldDecorator('label', {
									rules: [
										{ message: '请输入楼层信息' },
									],
									initialValue: initialValue.label,
								})(
									<Input placeholder="请输入楼层信息" />
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
								label="单脱价格" >
								{getFieldDecorator('firstPulsePrice', {
									rules: [
										{ required: true, message: '请输入单脱价格' },
										{ validator: this.checkNumber },
									],
									initialValue: initialValue.firstPulsePrice,
								})(
									<Input placeholder="请输入单脱价格" />
								)}
								{this.firstPulseName ?
									<span>服务名称已修改为: {this.firstPulseName}
										<a href="#" onClick={this.changeName.bind(this,1)}>修改</a>
										</span> :
									<span><a href="#" onClick={this.changeName.bind(this,1)}>修改服务名称</a></span>
								}
							</FormItem>
							<FormItem
								{...formItemLayout}
								label="快洗价格" >
								{getFieldDecorator('secondPulsePrice', {
									rules: [
										{ required: true, message: '请输入快洗价格' },
										{ validator: this.checkNumber },
									],
									initialValue: initialValue.secondPulsePrice,
								})(
									<Input placeholder="请输入快洗价格"/>
								)}
								{this.secondPulseName ?
										<span>服务名称已修改为: {this.secondPulseName}
											<a href="#" onClick={this.changeName.bind(this,2)}>修改</a>
										</span> :
										<span><a href="#" onClick={this.changeName.bind(this,2)}>修改服务名称</a></span>
								}
							</FormItem>
							<FormItem
								{...formItemLayout}
								label="标准洗价格">
								{getFieldDecorator('thirdPulsePrice', {
									rules: [
										{ required: true, message: '请输入标准洗价格'},
										{ validator: this.checkNumber },
									],
									initialValue: initialValue.thirdPulsePrice,
								})(
									<Input placeholder="请输入标准洗价格"/>
								)}
								{this.thirdPulseName?
										<span>服务名称已修改为: {this.thirdPulseName}
											<a href="#" onClick={this.changeName.bind(this,3)}>修改</a>
										</span> :
										<span><a href="#" onClick={this.changeName.bind(this,3)}>修改服务名称</a></span>
								}
							</FormItem>
							<FormItem
								{...formItemLayout}
								label="大物洗价格">
								{getFieldDecorator('fourthPulsePrice', {
									rules: [
										{ required: true, message: '请输入大物洗价格'},
										{ validator: this.checkNumber },
									],
									initialValue: initialValue.fourthPulsePrice,
								})(
									<Input placeholder="请输入大物洗价格"/>
								)}
								{
									this.fourthPulseName ?
										<span>服务名称已修改为: {this.fourthPulseName}
											<a href="#" onClick={this.changeName.bind(this,4)}>修改</a>
										</span> :
										<span><a href="#" onClick={this.changeName.bind(this,4)}>修改服务名称</a></span>
								}
							</FormItem>
							<FormItem wrapperCol={{ span: 12, offset: 7 }}>
								<Button type="ghost" onClick={this.handleReset}>取消</Button>
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
 								/>
							</div>
						</Form>
					</div>
				</div>
			</div>

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
	}
	handleSubmit() {
		const currentPulse = this.props.currentPulse;
		const itemKey = key[currentPulse-1] + 'PulseName';
		const pulseName = this.props.form.getFieldsValue()[itemKey];
		// 修改后的当前脉冲的值
		this.props.changePulseName(pulseName);
		this.props.onCancel();
	}
	render() {
		const { getFieldDecorator } = this.props.form;
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
				initialValue = this.props.first;
				break;
			case 2:
				initialValue = this.props.second;
				break;
			case 3:
				initialValue = this.props.third;
				break;
			case 4:
				initialValue = this.props.fourth;
				break;
		}
		// 四个脉冲的初始值
		console.log('initialValue',initialValue);
		const itemNode = <FormItem {...formItemLayout} label="服务名称" >
			{getFieldDecorator(itemKey,{initialValue:initialValue})(<Input type="text"/>)}
		</FormItem>
		return (
			<div>
				<Modal title="修改服务名称" visible={this.props.visible} onOk={this.handleSubmit} onCancel={this.props.onCancel}>
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
