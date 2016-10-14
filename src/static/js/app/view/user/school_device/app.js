import React from 'react';
import './../device/app.less';
import { Table, Button, Breadcrumb } from 'antd';
import { Link } from 'react-router';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as DeviceActions from '../../../actions/device';
import * as UserActions from '../../../actions/user';

function mapStateToProps(state) {
	console.log(state);
	const { device: { list }, user: {school_device} } = state;
	return { list, school_device };
}

function mapDispatchToProps(dispatch) {
	const {
		deviceList,
	} = bindActionCreators(DeviceActions, dispatch);
	const {
		schoolDevice,
	} = bindActionCreators(UserActions, dispatch);
	return {
		deviceList,
		schoolDevice,
	};
}

const columns = [{
	title: '序号',
	dataIndex: 'index',
	key: 'index',
}, {
	title: '编号',
	dataIndex: 'serial_number',
	key: 'serial_number',
}, {
	title: '关联设备类型',
	dataIndex: 'reference_device',
	key: 'reference_device',
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
	dataIndex: 'first_pulse_price',
	key: 'first_pulse_price',
}, {
	title: '快洗',
	dataIndex: 'second_pulse_price',
	key: 'second_pulse_price',
}, {
	title: '标准洗',
	dataIndex: 'third_pulse_price',
	key: 'third_pulse_price',
}, {
	title: '大物洗',
	dataIndex: 'fourth_pulse_name',
	key: 'fourth_pulse_name',
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



const user_data = JSON.parse(document.getElementById('main').dataset.user);

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
		const id = user_data.user.id;
		const school_id = this.props.params.id;
		this.props.schoolDevice(id, school_id);
	}
	render() {
		const school_device = this.props.school_device;
		console.log('school_device',school_device);
		let dataSource = [];
		let loading = false;
		if(school_device) {
			loading = true;
			if(school_device.fetch == true){
				loading = false;
				const data = school_device.result.data.list;
				dataSource = data.map(function (item, key) {
					return {
						key: item.id,
						index: key,
						serial_number: item.serial_number,
						reference_device: '洗衣机',
						status: item.status,
						address: item.address,
						first_pulse_price: item.first_pulse_price,
						second_pulse_price: item.second_pulse_price,
						third_pulse_price: item.third_pulse_price,
						fourth_pulse_name: item.fourth_pulse_name,
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
								   rowKey={record => record.key}
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
