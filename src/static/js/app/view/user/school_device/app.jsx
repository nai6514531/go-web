import React from 'react';
import '../device_list/app.less';
import { Table, Button, Breadcrumb, Popconfirm } from 'antd';
import { Link } from 'react-router';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as DeviceActions from '../../../actions/device';
import * as UserActions from '../../../actions/user';

function mapStateToProps(state) {
	const { device: { list, status }, user: {schoolDevice} } = state;
	return { list, status, schoolDevice };
}

function mapDispatchToProps(dispatch) {
	const {
		getDeviceList,
		deleteDevice,
		patchDeviceStatus,
	} = bindActionCreators(DeviceActions, dispatch);
	const {
		getSchoolDevice,
	} = bindActionCreators(UserActions, dispatch);
	return {
		getDeviceList,
		deleteDevice,
		patchDeviceStatus,
		getSchoolDevice,
	};
}

const columns = [{
	title: 'ID',
	dataIndex: 'index',
	key: 'index',
}, {
	title: '编号',
	dataIndex: 'serialNumber',
	key: 'serialNumber',
}, {
	title: '关联设备类型',
	dataIndex: 'referenceDevice',
	key: 'referenceDevice',
}, {
	title: '状态',
	dataIndex: 'status',
	key: 'status',
}, {
	title: '楼层信息',
	dataIndex: 'address',
	key: 'address',
}, {
	title: '单脱',
	dataIndex: 'firstPulsePrice',
	key: 'firstPulsePrice',
}, {
	title: '快洗',
	dataIndex: 'secondPulsePrice',
	key: 'secondPulsePrice',
}, {
	title: '标准洗',
	dataIndex: 'thirdPulsePrice',
	key: 'thirdPulsePrice',
}, {
	title: '大物洗',
	dataIndex: 'fourthPulsePrice',
	key: 'fourthPulsePrice',
}, {
	title: '操作',
	dataIndex: 'action',
	key: 'action',
	render: (text, record) => (
		<span>
			<Link to={"/user/device/edit/" + record.key}>修改</Link>
			<span className="ant-divider" />
			<Popconfirm title="确认删除吗?" onConfirm={record.remove.bind(this, record.key)}>
				<a href="#">删除</a>
			</Popconfirm>
			<span className="ant-divider" />
			{record.status == 9 ?
				<Popconfirm title="确认启用吗?" onConfirm={record.changeStatus.bind(this, record.key, true)}>
					<a href="#">启用</a>
				</Popconfirm>
				:
				<Popconfirm title="确认停止吗?" onConfirm={record.changeStatus.bind(this, record.key, false)}>
					<a href="#">停止</a>
				</Popconfirm>
			}

		</span>
	),
}];


class DeviceTable extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			data: [],
			pagination: {},
			loading: false,
			pager: {},
			page: 1,
			perPage: 10,
			changeState: 0,
		};
		this.remove = this.remove.bind(this);
		this.changeStatus = this.changeStatus.bind(this);

	}
	componentDidMount() {
		const schoolId = this.props.params.id;
		const pager = { page: this.state.page, perPage: this.state.perPage };
		this.props.getSchoolDevice(USER.id, schoolId, pager);
	}
	componentWillReceiveProps(nextProps) {
		const self = this;
		// 成功才拉取,失败就提示
		if(this.theStatus == 0 || this.theStatus == 9) {
			if(nextProps.status && nextProps.status.fetch == true){
				const schoolId = this.props.params.id;
				const pager = { page : this.state.page, perPage: this.state.perPage};
				this.props.getSchoolDevice(USER.id, schoolId, pager);
			} else if(nextProps.status && nextProps.status.fetch == false) {
				alert('操作失败!');
				console.log(nextProps.status.result.msg);
			}
			self.theStatus = -1;
		}

	}
	initializePagination() {
		let total = 1;
		if (this.props.schoolDevice && this.props.schoolDevice.fetch == true) {
			total = this.props.schoolDevice.result.data.total;
		}
		const self = this;
		const schoolId = this.props.params.id;
		return {
			total: total,
			showSizeChanger: true,
			onShowSizeChange(current, pageSize) {
				const pager = { page : current, perPage: pageSize};
				self.setState(pager);
				self.props.getSchoolDevice(USER.id, schoolId, pager);
			},
			onChange(current) {
				const pager = { page : current, perPage: self.state.perPage};
				self.setState(pager);
				self.props.getSchoolDevice(USER.id, schoolId, pager);
			},
		}
	}
	remove(id) {
		this.props.deleteDevice(id);
	}
	changeStatus(id,start) {
		const self = this;
		if(start){
			const status = { status: 0 };
			this.props.patchDeviceStatus(id,status);
			self.theStatus = 0;
		}else {
			const status = { status: 9 };
			this.props.patchDeviceStatus(id,status);
			self.theStatus = 9;
		}
	}
	render() {
		const pagination = this.initializePagination();
		const schoolDevice = this.props.schoolDevice;
		const schoolId = this.props.params.id;
		const self = this;
		let dataSource = [];
		if(schoolDevice) {
			if(schoolDevice.fetch == true){
				const data = schoolDevice.result.data.list;
				dataSource = data.map(function (item, key) {
					return {
						key: item.id,
						index: item.id,
						serialNumber: item.serialNumber,
						referenceDevice: '洗衣机',
						status: item.status,
						address: item.address + item.label,
						firstPulsePrice: item.firstPulsePrice,
						secondPulsePrice: item.secondPulsePrice,
						thirdPulsePrice: item.thirdPulsePrice,
						fourthPulsePrice: item.fourthPulsePrice,
						remove: self.remove,
						changeStatus: self.changeStatus,
					}
				})
			}
		}
		return (
			<section className="view-user-list">
				<header>
					<Breadcrumb separator=">">
						<Breadcrumb.Item><Link to="/user">代理商管理</Link></Breadcrumb.Item>
						<Breadcrumb.Item><Link to="/user/device/list">设备管理</Link></Breadcrumb.Item>
						<Breadcrumb.Item>学校</Breadcrumb.Item>
					</Breadcrumb>
				</header>
				<div className="toolbar">
					<Button type="primary" className="item">
						<Link to="/user/device/edit">
							添加新设备
						</Link>
					</Button>
				</div>
				<section className="view-content">
					<Table columns={columns}
						   dataSource={dataSource}
						   pagination={pagination}
						   loading={this.state.loading}
						   onChange={this.handleTableChange}
						   bordered
					/>
				</section>
			</section>
		);
	}
}


DeviceTable.propTypes = {
	handleTableChange: React.PropTypes.func,
};

export default connect(mapStateToProps, mapDispatchToProps)(DeviceTable);
