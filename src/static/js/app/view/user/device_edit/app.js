import React from 'react';
import './app.less';
import { Button, Form, Input, Radio, Select, Cascader, Modal, Breadcrumb } from 'antd';
const createForm = Form.create;
const FormItem = Form.Item;
const RadioGroup = Radio.Group;

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as DeviceActions from '../../../actions/device';
import * as RegionActions from '../../../actions/region';


function mapStateToProps(state) {
	const { device: { detail, status, result, ref_device }, region: {province_list, province_school} } = state;
	return { detail, status, result, ref_device, province_list, province_school };
}

function mapDispatchToProps(dispatch) {
	const {
		deviceDetail,
		deviceEdit,
		pulseName,
		refDevice,
	} = bindActionCreators(DeviceActions, dispatch);
	const {
		provinceList,
		provinceSchoolList,
	} = bindActionCreators(RegionActions, dispatch);
	return {
		deviceDetail,
		deviceEdit,
		pulseName,
		refDevice,
		provinceList,
		provinceSchoolList,
	};
}

class DeviceForm extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			ModalText: 'Content of the modal dialog',
			visible: false,
		};
		this.handleSubmit = this.handleSubmit.bind(this);
		this.handleReset = this.handleReset.bind(this);
		this.handleCancel = this.handleCancel.bind(this);
		this.showModal = this.showModal.bind(this);
		this.handleOk = this.handleOk.bind(this);
	}
	componentWillMount() {
		const device_id = this.props.params.id;
		if(device_id) {
			this.props.deviceDetail(device_id);
		}
		// 获取关联设备列表
		this.props.refDevice();
		//获取省份列表
		this.props.provinceList();
		// 获取省份对应城市列表
		

	}
	showModal() {
		this.setState({
			visible: true,
		});
	}
	handleOk() {
		this.setState({
			ModalText: 'The modal dialog will be closed after two seconds',
			confirmLoading: true,
		});
		setTimeout(() => {
			this.setState({
				visible: false,
				confirmLoading: false,
			});
		}, 2000);
	}
	handleCancel() {
		console.log('Clicked cancel button');
		this.setState({
			visible: false,
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
	render() {
		// 关联设备列表
		const ref_device = this.props.ref_device;
		let ref_device_node = [];
		if(ref_device) {
			if(ref_device.fetch == true){
				ref_device_node = ref_device.result.data.map(function (item, key) {
					return (
						<Radio value={item.id}>{item.name}</Radio>
					)
				})
			}
		}
		// 省份列表
		const address = [{
			value: 'guangdong',
			label: '广东',
			children: [{
				value: 'shenzhen',
				label: '深圳',
			}],
		}];
		console.log('device',this.props.detail);
		const detail = this.props.detail;
		let initialValue = {};
		if(detail) {
			if(detail.fetch == true){
				const device = detail.result.data;
				initialValue = {
					'serial_number': device.serial_number,
					'school': device.school_id,
					'province': device.province_id,
					'address': device.address,
					'reference_device': device.reference_device_id,
					'first_pulse_price': device.first_pulse_price,
					'second_pulse_price': device.second_pulse_price,
					'third_pulse_price': device.third_pulse_price,
					'fourth_pulse_price': device.fourth_pulse_price,

				}
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
							<Breadcrumb.Item href="#">添加</Breadcrumb.Item>
						</Breadcrumb>
					</div>
					<div className="detail-form">
						<Form horizontal>
							<FormItem
								{...formItemLayout}
								label="设备编号" >
								{getFieldDecorator('serial_number', {
									rules: [
										{ required: true, message: '请输入设备编号' },
									],
								})(
									<Input placeholder="请输入设备编号" />
								)}
							</FormItem>
							<FormItem
								{...formItemLayout}
								label="省份"
							>
								{getFieldDecorator('province', {
									rules: [{ required: true, type: 'array',message: '请选择省份' }],
								})(
									<Cascader options={address} />
								)}
							</FormItem>
							<FormItem
								{...formItemLayout}
								label="学校"
							>
								{getFieldDecorator('school', {
									rules: [{ required: true, type: 'array',message: '请选择学校' }],
								})(
									<Cascader options={address} />
								)}
							</FormItem>
							<FormItem
								{...formItemLayout}
								label="楼层信息" >
								{getFieldDecorator('address', {
									rules: [
										{ required: true, message: '请输入楼层信息' },
									],
								})(
									<Input placeholder="请输入楼层信息" />
								)}
							</FormItem>
							<FormItem
								{...formItemLayout}
								label="关联设备类型"
							>
								{getFieldDecorator('reference_device', {
									rules: [
										{ required: true, message: '请选择关联设备类型' },
									],
								})(
									<RadioGroup>
										{ref_device_node}
									</RadioGroup>
								)}
							</FormItem>
							<FormItem
								{...formItemLayout}
								label="单脱价格" >
								{getFieldDecorator('first_pulse_price', {
									rules: [
										{ required: true, message: '请输入单脱价格' },
									],
								})(
									<div>
										<Input placeholder="请输入单脱价格"/>
										<span><a href="#">修改服务名称</a></span>
									</div>
								)}
							</FormItem>
							<FormItem
								{...formItemLayout}
								label="快洗价格" >
								{getFieldDecorator('second_pulse_price', {
									rules: [
										{ required: true, message: '请输入快洗价格' },
									],
								})(
									<div>
										<Input placeholder="请输入快洗价格"/>
										<span><a href="#">修改服务名称</a></span>
									</div>
								)}
							</FormItem>
							<FormItem
								{...formItemLayout}
								label="标准洗价格">
								{getFieldDecorator('third_pulse_price', {
									rules: [
										{required: true, message: '请输入标准洗价格'},
									],
								})(
									<div>
										<Input placeholder="请输入标准洗价格"/>
										<span><a href="#">修改服务名称</a></span>
									</div>
								)}
							</FormItem>
							<FormItem
								{...formItemLayout}
								label="大物洗价格">
								{getFieldDecorator('fourth_pulse_name', {
									rules: [
										{required: true, message: '请输入大物洗价格'},
									],
								})(
									<div>
										<Input placeholder="请输入大物洗价格"/>
										<span><a href="#">修改服务名称</a></span>
									</div>
								)}
							</FormItem>
							<FormItem wrapperCol={{ span: 12, offset: 7 }}>
								<Button type="ghost" onClick={this.handleReset}>取消</Button>
								<Button type="primary" onClick={this.handleSubmit}>保存</Button>
							</FormItem>
							<div>
								<Button type="primary" onClick={this.showModal}>Open a modal dialog</Button>
								<Modal title="Title of the modal dialog"
									   visible={this.state.visible}
									   onOk={this.handleOk}
									   confirmLoading={this.state.confirmLoading}
									   onCancel={this.handleCancel}
								>
									<p>{this.state.ModalText}</p>
								</Modal>
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

export default connect(mapStateToProps, mapDispatchToProps)(DeviceForm);
