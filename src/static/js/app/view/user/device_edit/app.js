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
const key = ['first','second','third','fourth'];

class DeviceForm extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			province_id: '',
			school_id: '',
			add_new: false,
			current_pulse: 1,
			first_pulse_name: '',
			second_pulse_name: '',
			third_pulse_name: '',
			fourth_pulse_name: '',
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
		const device_id = this.props.params.id;
		console.log('device_id',device_id);
		if(device_id) {
			console.log('get device detail');
			this.props.deviceDetail(9273);
		} else {
			this.setState({add_new: true});
		}
		// 获取关联设备列表
		this.props.refDevice();
		//获取省份列表
		// this.props.provinceList();
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
	handleSelect(province_id, school_id) {
		// this.setState({
		// 	province_id: province_id,
		// 	school_id: school_id,
		// })
	}
	changeName(current_pulse, e) {
		e.preventDefault();
		this.setState({
			current_pulse: current_pulse,
		});
		this.showModal();
	}
	changePulseName(pulse_name) {
		// 修改的脉冲服务名称
		const device_id = this.props.params.id;
		const pulse_name_key = key[this.state.current_pulse-1] + '_pulse_name';
		const the_pulse_name = {};
		the_pulse_name[pulse_name_key] = pulse_name;
		this.setState(the_pulse_name);
		const add_new = this.state.add_new;
		if(!add_new) {
			// edit
			const the_pulse_name = {};
			the_pulse_name[pulse_name_key] = pulse_name;
			const device = { device_id: device_id };
			let data = Object.assign({}, device, the_pulse_name);
			console.log('data',data);
			// this.props.pulseName(data);
		};
	}
	showModal() {
		this.setState({ visible: true });
	}
	hideModal() {
		this.setState({ visible: false });
	}
	render() {
		// 关联设备列表
		const ref_device = this.props.ref_device;
		let ref_device_node = [];
		if(ref_device) {
			if(ref_device.fetch == true){
				ref_device_node = ref_device.result.data.map(function (item, key) {
					return (
						<Radio key={key} value={item.id}>{item.name}</Radio>
					)
				})
			}
		}
		//
		if(this.props.pulse_name) {
			this.props.deviceDetail(9273);
		}
		// 初始化参数
		const detail = this.props.detail;
		console.log('device',this.props.detail);
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
					'first_pulse_name': device.first_pulse_name,
					'second_pulse_name': device.second_pulse_name,
					'third_pulse_name': device.third_pulse_name,
					'fourth_pulse_name': device.fourth_pulse_name,

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
								{getFieldDecorator('serial_number', {
									rules: [
										{ required: true, message: '请输入设备编号' },
									],
									initialValue: initialValue.serial_number,
								})(
									<Input placeholder="请输入设备编号" />
								)}
							</FormItem>
							<span>省份学校</span>
							<SchoolSelect handleSelect={this.handleSelect}/>
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
								{getFieldDecorator('reference_device', {
									rules: [
										{ required: true, message: '请选择关联设备类型' },
									],
									initialValue: initialValue.reference_device,
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
									initialValue: initialValue.first_pulse_price,
								})(
									<Input placeholder="请输入单脱价格"/>
								)}
								{this.state.add_new ?
									(this.state.first_pulse_name ?
										<span>服务名称已修改为: {this.state.first_pulse_name}
											<a href="#" onClick={this.changeName.bind(this,1)}>修改</a>
										</span> :
										<span><a href="#" onClick={this.changeName.bind(this,1)}>修改服务名称</a></span>)
									:
									(initialValue.first_pulse_name ?
										<span>服务名称已修改为: {initialValue.first_pulse_name}
											<a href="#" onClick={this.changeName.bind(this,1)}>修改</a>
										</span> :
										<span><a href="#" onClick={this.changeName.bind(this,1)}>修改服务名称</a></span>)
								}
							</FormItem>
							<FormItem
								{...formItemLayout}
								label="快洗价格" >
								{getFieldDecorator('second_pulse_price', {
									rules: [
										{ required: true, message: '请输入快洗价格' },
									],
									initialValue: initialValue.second_pulse_price,
								})(
									<Input placeholder="请输入快洗价格"/>
								)}
								{this.state.add_new ?
									(this.state.second_pulse_name ?
										<span>服务名称已修改为: {this.state.second_pulse_name}
											<a href="#" onClick={this.changeName.bind(this,2)}>修改</a>
										</span> :
										<span><a href="#" onClick={this.changeName.bind(this,2)}>修改服务名称</a></span>)
									:
									(initialValue.second_pulse_name ?
										<span>服务名称已修改为: {initialValue.second_pulse_name}
											<a href="#" onClick={this.changeName.bind(this,2)}>修改</a>
										</span> :
										<span><a href="#" onClick={this.changeName.bind(this,2)}>修改服务名称</a></span>)
								}
							</FormItem>
							<FormItem
								{...formItemLayout}
								label="标准洗价格">
								{getFieldDecorator('third_pulse_price', {
									rules: [
										{required: true, message: '请输入标准洗价格'},
									],
									initialValue: initialValue.third_pulse_price,
								})(
									<Input placeholder="请输入标准洗价格"/>
								)}
								{this.state.add_new ?
									(this.state.third_pulse_name ?
										<span>服务名称已修改为: {this.state.third_pulse_name}
											<a href="#" onClick={this.changeName.bind(this,3)}>修改</a>
										</span> :
										<span><a href="#" onClick={this.changeName.bind(this,3)}>修改服务名称</a></span>)
									:
									(initialValue.third_pulse_name ?
										<span>服务名称已修改为: {initialValue.third_pulse_name}
											<a href="#" onClick={this.changeName.bind(this,3)}>修改</a>
										</span> :
										<span><a href="#" onClick={this.changeName.bind(this,3)}>修改服务名称</a></span>)
								}
							</FormItem>
							<FormItem
								{...formItemLayout}
								label="大物洗价格">
								{getFieldDecorator('fourth_pulse_price', {
									rules: [
										{required: true, message: '请输入大物洗价格'},
									],
									initialValue: initialValue.fourth_pulse_price,
								})(
									<Input placeholder="请输入大物洗价格"/>
								)}
								{this.state.add_new ?
									(this.state.fourth_pulse_name ?
										<span>服务名称已修改为: {this.state.fourth_pulse_name}
											<a href="#" onClick={this.changeName.bind(this,4)}>修改</a>
										</span> :
										<span><a href="#" onClick={this.changeName.bind(this,4)}>修改服务名称</a></span>)
									:
									(initialValue.fourth_pulse_name ?
										<span>服务名称已修改为: {initialValue.fourth_pulse_name}
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
										   current_pulse={this.state.current_pulse}
										   first={this.state.first_pulse_name}
										   second={this.state.second_pulse_name}
										   third={this.state.third_pulse_name}
										   fourth={this.state.fourth_pulse_name}
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
		const current_pulse = this.props.current_pulse;
		const item_key = key[current_pulse-1] + '_pulse_name';
		const pulse_name = this.props.form.getFieldsValue()[item_key];
		this.props.changePulseName(pulse_name);
		this.props.onCancel();
	}
	render() {
		const { getFieldDecorator } = this.props.form;
		const formItemLayout = {
			labelCol: { span: 4 },
			wrapperCol: { span: 20 },
		};
		const current_pulse = this.props.current_pulse;
		const item_key = key[current_pulse-1] + '_pulse_name';
		let initialValue = '';
		switch (current_pulse) {
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
		const item_node = <FormItem {...formItemLayout} label="服务名称" >
			{getFieldDecorator(item_key,{initialValue:initialValue})(<Input type="text"/>)}
		</FormItem>
		return (
			<div>
				<Modal title="修改服务名称" visible={this.props.visible} onOk={this.handleSubmit} onCancel={this.props.onCancel}>
					<Form horizontal>
						{item_node}
					</Form>
				</Modal>
			</div>
		);
	}

}

PulseName = createForm()(PulseName);

export default connect(mapStateToProps, mapDispatchToProps)(DeviceForm);
