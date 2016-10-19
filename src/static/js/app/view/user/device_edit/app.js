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
		patchPulseName,
		getRefDevice,
	} = bindActionCreators(DeviceActions, dispatch);
	const {
		getProvinceList,
		getProvinceSchoolList,
	} = bindActionCreators(RegionActions, dispatch);
	return {
		getDeviceDetail,
		putDeviceDetail,
		patchPulseName,
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
	}
	componentWillMount() {
		const deviceId = this.props.params.id;
		if(deviceId) {
			this.props.getDeviceDetail(9273);
		} else {
			this.setState({addNew: true});
		}
		// 获取关联设备列表
		this.props.getRefDevice();
		//获取省份列表
		// this.props.getProvinceList();
		// 获取省份对应学校列表

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
	handleSelect(provinceId, schoolId) {
		// this.setState({
		// 	provinceId: provinceId,
		// 	schoolId: schoolId,
		// })
	}
	changeName(currentPulse,e) {
		e.preventDefault();
		this.setState({
			currentPulse: currentPulse,
		});
		this.showModal();
	}
	changePulseName(pulseName) {
		// 修改的脉冲服务名称
		const deviceId = this.props.params.id;
		const pulseNameKey = key[this.state.currentPulse-1] + 'PulseName';
		const thePulseName = {};
		thePulseName[pulseNameKey] = pulseName;
		const addNew = this.state.addNew;
		this.setState(thePulseName);
		// 如果是修改,则需要确保反馈是成功,才能 setState
		if(addNew) {
			// this.setState(thePulseName);
		} else {
			// edit
			const thePulseName = {};
			thePulseName[pulseNameKey] = pulseName;
			const device = { deviceId: deviceId };
			let data = Object.assign({}, device, thePulseName);
			console.log('data',data);
			this.props.patchPulseName(9273, data);
		}
	}
	showModal() {
		this.setState({ visible: true });
	}
	hideModal() {
		this.setState({ visible: false });
	}
	componentWillReceiveProps(nextProps) {
		const result = nextProps.pulseName;
		if(result && result.fetch == false) {
			console.log('update');
				// this.props.getDeviceDetail(9273);
			// this.setState(thePulseName);
		}
	}
	render() {
		// 关联设备列表
		const pulseName = this.props.pulseName;
		console.log('pulseName',pulseName);
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
		const detail = this.props.detail;
		console.log('device',this.props.detail);
		let initialValue = {};
		if(detail) {
			if(detail.fetch == true){
				const device = detail.result.data;
				initialValue = {
					'serialNumber': device.serialNumber,
					'school': device.schoolId,
					'province': device.provinceId,
					'address': device.address,
					'referenceDevice': device.referenceDeviceId,
					'firstPulsePrice': device.firstPulsePrice,
					'secondPulsePrice': device.secondPulsePrice,
					'thirdPulsePrice': device.thirdPulsePrice,
					'fourthPulsePrice': device.fourthPulsePrice,
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
		return (
		<div className="index">
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
								})(
									<Input placeholder="请输入设备编号" />
								)}
							</FormItem>
							<div className="select-school">
								<span className="select-title">省份学校:</span>
								<SchoolSelect handleSelect={this.handleSelect}/>
							</div>
							<FormItem
								{...formItemLayout}
								label="楼层信息" >
								{getFieldDecorator('address', {
									rules: [
										{ message: '请输入楼层信息' },
									],
									initialValue: initialValue.address,
								})(
									<Input placeholder="请输入楼层信息" />
								)}
							</FormItem>
							<FormItem
								{...formItemLayout}
								label="关联设备类型"
							>
								{getFieldDecorator('referenceDevice', {
									rules: [
										{ message: '请选择关联设备类型' },
									],
									initialValue: initialValue.referenceDevice,
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
									],
									initialValue: initialValue.firstPulsePrice,
								})(
									<Input placeholder="请输入单脱价格"/>
								)}
								{this.state.addNew ?
									(this.state.firstPulseName ?
										<span>服务名称已修改为: {this.state.firstPulseName}
											<a href="#" onClick={this.changeName.bind(this,1)}>修改</a>
										</span> :
										<span><a href="#" onClick={this.changeName.bind(this,1)}>修改服务名称</a></span>)
									:
									(initialValue.firstPulseName ?
										<span>服务名称已修改为: {this.state.firstPulseName?this.state.firstPulseName:initialValue.firstPulseName}
											<a href="#" onClick={this.changeName.bind(this,1)}>修改</a>
										</span> :
										<span><a href="#" onClick={this.changeName.bind(this,1)}>修改服务名称</a></span>)
								}
							</FormItem>
							<FormItem
								{...formItemLayout}
								label="快洗价格" >
								{getFieldDecorator('secondPulsePrice', {
									rules: [
										{ required: true, message: '请输入快洗价格' },
									],
									initialValue: initialValue.secondPulsePrice,
								})(
									<Input placeholder="请输入快洗价格"/>
								)}
								{this.state.addNew ?
									(this.state.secondPulseName ?
										<span>服务名称已修改为: {this.state.secondPulseName}
											<a href="#" onClick={this.changeName.bind(this,2)}>修改</a>
										</span> :
										<span><a href="#" onClick={this.changeName.bind(this,2)}>修改服务名称</a></span>)
									:
									(initialValue.secondPulseName ?
										<span>服务名称已修改为: {initialValue.secondPulseName}
											<a href="#" onClick={this.changeName.bind(this,2)}>修改</a>
										</span> :
										<span><a href="#" onClick={this.changeName.bind(this,2)}>修改服务名称</a></span>)
								}
							</FormItem>
							<FormItem
								{...formItemLayout}
								label="标准洗价格">
								{getFieldDecorator('thirdPulsePrice', {
									rules: [
										{required: true, message: '请输入标准洗价格'},
									],
									initialValue: initialValue.thirdPulsePrice,
								})(
									<Input placeholder="请输入标准洗价格"/>
								)}
								{this.state.addNew ?
									(this.state.thirdPulseName?
										<span>服务名称已修改为: {this.state.thirdPulseName}
											<a href="#" onClick={this.changeName.bind(this,3)}>修改</a>
										</span> :
										<span><a href="#" onClick={this.changeName.bind(this,3)}>修改服务名称</a></span>)
									:
									(initialValue.thirdPulseName ?
										<span>服务名称已修改为: {initialValue.thirdPulseName}
											<a href="#" onClick={this.changeName.bind(this,3)}>修改</a>
										</span> :
										<span><a href="#" onClick={this.changeName.bind(this,3)}>修改服务名称</a></span>)
								}
							</FormItem>
							<FormItem
								{...formItemLayout}
								label="大物洗价格">
								{getFieldDecorator('fourthPulsePrice', {
									rules: [
										{required: true, message: '请输入大物洗价格'},
									],
									initialValue: initialValue.fourthPulsePrice,
								})(
									<Input placeholder="请输入大物洗价格"/>
								)}
								{this.state.addNew ?
									(this.state.fourthPulseName ?
										<span>服务名称已修改为: {this.state.fourthPulseName}
											<a href="#" onClick={this.changeName.bind(this,4)}>修改</a>
										</span> :
										<span><a href="#" onClick={this.changeName.bind(this,4)}>修改服务名称</a></span>)
									:
									(initialValue.fourthPulseName ?
										<span>服务名称已修改为: {initialValue.fourthPulseName}
											<a href="#" onClick={this.changeName.bind(this,4)}>修改</a>
										</span> :
										<span><a href="#" onClick={this.changeName.bind(this,4)}>修改服务名称</a></span>)
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
										   first={this.state.firstPulseName}
										   second={this.state.secondPulseName}
										   third={this.state.thirdPulseName}
										   fourth={this.state.fourthPulseName}
 								/>
							</div>
						</Form>
					</div>
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
