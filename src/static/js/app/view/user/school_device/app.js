import React from 'react';
import '../device_list/app.less';
import { Table, Button, Breadcrumb } from 'antd';
import { Link } from 'react-router';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as DeviceActions from '../../../actions/device';
import * as UserActions from '../../../actions/user';

function mapStateToProps(state) {
	const { device: { list }, user: {schoolDevice} } = state;
	return { list, schoolDevice };
}

function mapDispatchToProps(dispatch) {
	const {
		getDeviceList,
	} = bindActionCreators(DeviceActions, dispatch);
	const {
		getSchoolDevice,
	} = bindActionCreators(UserActions, dispatch);
	return {
		getDeviceList,
		getSchoolDevice,
	};
}

const columns = [{
	title: '序号',
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
	dataIndex: 'fourthPulseName',
	key: 'fourthPulseName',
}, {
	title: '操作',
	dataIndex: 'action',
	key: 'action',
	render: (text, record) => (
		<span>
			<Link to={"/user/device/edit/" + record.key}>修改</Link>
			<span className="ant-divider" />
			<a href="#">删除</a>
			<span className="ant-divider" />
			<a href="#">停止</a>
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
		};
	}
	componentDidMount() {
		const schoolId = this.props.params.id;
		const pager = { page: this.state.page, perPage: this.state.perPage };
		this.props.getSchoolDevice(USER.id, schoolId, pager);
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
				// 执行函数获取对应的 page 数据,传递的参数是当前页码和需要的数据条数
				console.log('Current: ', current, '; PageSize: ', pageSize);
			},
			onChange(current) {
				const pager = { page : current, perPage: self.state.perPage};
				self.setState(pager);
				self.props.getSchoolDevice(USER.id, schoolId, pager);
				// 执行函数获取对应的 page 数据,传递的参数是当前页码
				console.log('Current: ', current);
			},
		}
	}
	render() {
		const pagination = this.initializePagination();
		const schoolDevice = this.props.schoolDevice;
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
						address: item.address,
						firstPulsePrice: item.firstPulsePrice,
						secondPulsePrice: item.secondPulsePrice,
						thirdPulsePrice: item.thirdPulsePrice,
						fourthPulseName: item.fourthPulseName,
					}
				})
			}
		}
		return (
		<div className="detail">
			<div className="detail-head">
				<Breadcrumb separator=">">
					<Breadcrumb.Item>代理商管理</Breadcrumb.Item>
					<Breadcrumb.Item href="#">设备管理</Breadcrumb.Item>
					<Breadcrumb.Item href="#">学校</Breadcrumb.Item>
				</Breadcrumb>
			</div>
			<div className="detail-form">
				<div className="table">
						<div>
							<div className="detail-button">
								<Button type="primary">
									<Link to="/user/device/edit">
										添加新设备
									</Link>
								</Button>
							</div>
							<Table columns={columns}
								   dataSource={dataSource}
								   pagination={pagination}
								   loading={this.state.loading}
								   onChange={this.handleTableChange}
							/>
						</div>
				</div>
			</div>
		</div>

		);
	}
}


DeviceTable.propTypes = {
	handleTableChange: React.PropTypes.func,
};

export default connect(mapStateToProps, mapDispatchToProps)(DeviceTable);
