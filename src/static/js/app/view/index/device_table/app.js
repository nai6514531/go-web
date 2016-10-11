import React from 'react';
import './app.less';
import { Table, Button } from 'antd';
import { Link } from 'react-router';

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
			<Link to="/agent/device/list/new">修改</Link>
			<span className="ant-divider" />
			<a href="#">删除</a>
			<span className="ant-divider" />
			<a href="#">停止</a>
		</span>
	),
}];

const dataSource = [{
	key: '1',
	index: '1',
	serial_number: 'ABCD',
	reference_device: '洗衣机',
	status: '空闲',
	address: '深圳南山',
	first_pulse_price: '1',
	second_pulse_price: '2',
	third_pulse_price: '3',
	fourth_pulse_name: '4',
}
];

export default class DeviceTable extends React.Component {
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
	}
	render() {
		return (
			<div className="table">
				{this.props.children ? this.props.children :
					<div>
						<div className="detail-button">
							<Button type="primary">
								<Link to="/agent/device/list/new">
									添加新设备
								</Link>
							</Button>
						</div>
						<Table columns={columns}
							   rowKey={record => record.registered}
							   dataSource={dataSource}
							   pagination={this.state.pagination}
							   loading={this.state.loading}
							   onChange={this.handleTableChange}
						/>
					</div>
				}
			</div>
		);
	}
}


DeviceTable.propTypes = {
	handleTableChange: React.PropTypes.func,
};
