import React from 'react';
import './app.less';
import { Button, Form, Input, Radio, Select, Cascader, Modal, Breadcrumb } from 'antd';
const createForm = Form.create;
const FormItem = Form.Item;
const RadioGroup = Radio.Group;

export class DeviceForm extends React.Component {
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
		this.props.form.setFieldsValue({
			type: 'current',
		});
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
		const address = [{
			value: 'guangdong',
			label: '广东',
			children: [{
				value: 'shenzhen',
				label: '深圳',
			}],
		}];
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
										<Radio value="washer">洗衣机</Radio>
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
