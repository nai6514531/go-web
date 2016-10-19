import React from 'react';
import './../device/app.less';
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
		};
	}
	handleTableChange(pagination, filters, sorter) {
		const pager = this.state.pagination;
		pager.current = pagination.current;
		this.setState({
			pagination: pager,
		});
		this.fetch({
			results: pagination.pageSize,
			page: pagination.current,
			sortField: sorter.field,
			sortOrder: sorter.order,
			...filters,
		});
	}
	fetch(params = {}) {
		console.log(params);
		this.setState({ loading: true });
	}
	componentDidMount() {
		// this.fetch();
		const id = USER.id;
		const schoolId = this.props.params.id;
		const pager = { page:1, perPage:10 };
		this.props.getSchoolDevice(id, schoolId, pager);
	}
	render() {
		const schoolDevice = this.props.schoolDevice;
		console.log('schoolDevice',schoolDevice);
		let dataSource = [];
		let loading = false;
		if(schoolDevice) {
			loading = true;
			if(schoolDevice.fetch == true){
				loading = false;
				const data = schoolDevice.result.data.list;
				dataSource = data.map(function (item, key) {
					return {
						key: item.id,
						index: key,
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
		let pagination = {
			pageSize: 10,
			current: 1,
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
								   loading={loading}
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
