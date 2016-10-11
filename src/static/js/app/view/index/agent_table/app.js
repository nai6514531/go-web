import React from 'react';
import './app.less';
import { Table, Button } from 'antd';
import { Link } from 'react-router';


const columns = [{
	title: '序号',
	dataIndex: 'index',
	key: 'index',
}, {
	title: '代理商名称',
	dataIndex: 'user',
	key: 'user',
}, {
	title: '联系人',
	dataIndex: 'contact',
	key: 'contact',
}, {
	title: '手机',
	dataIndex: 'mobile',
	key: 'mobile',
}, {
	title: '地址',
	dataIndex: 'address',
	key: 'address',
}, {
	title: '模块数量',
	dataIndex: 'number',
	key: 'number',
}, {
	title: '操作',
	dataIndex: 'action',
	key: 'action',
	render: (text, record) => (
		<span>
			<Link to='/agent/new'>修改</Link>
			<span className="ant-divider" />
			<Link to='/agent'>下级代理商</Link>
			<span className="ant-divider" />
			<Link to='/agent/device'>设备管理</Link>
		</span>
	),
}];

const dataSource = [{
	key: '1',
	index: '1',
	user: '木牛智能',
	contact: 'Laura',
	mobile: '12312341234',
	address: '深圳南山',
	number: '1234',
}
];

export default class AgentTable extends React.Component {
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
				<div className="detail-button">
					<Button type="primary">
						<Link to='/agent/new'>
							添加新代理商
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
		);
	}
}


AgentTable.propTypes = {
	handleTableChange: React.PropTypes.func,
};
