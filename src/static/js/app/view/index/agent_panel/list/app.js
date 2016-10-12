import React from 'react';
import './app.less';
import { Table, Button } from 'antd';
import { Link } from 'react-router';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as UserActions from '../../../../actions/user';


function mapStateToProps(state) {
	const { user: { list, detail } } = state;
	return { list, detail };
}

function mapDispatchToProps(dispatch) {
	const {
		userList,
		userDetail,
	} = bindActionCreators(UserActions, dispatch);
	return {
		userList,
		userDetail,
	};
}

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

class AgentTable extends React.Component {
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
		const pager = { page : 1, per_page: 10}
		this.props.userList(pager);
		// this.fetch();
	}
	getList(){
		this.props.userList();
		this.props.userDetail(20);
	}
	showList(){
		console.log(this.props.list);
		console.log(this.props.detail);
	}
	render() {
		const list = this.props.list;
		let data = '';
		let dataSource = new Array;
		if(list && list.fetch == true) {
			data = list.result.data[0];
			console.log(data);
			dataSource = [{
				key: '1',
				index: '1',
				user: data.name,
				contact: data.contact,
				mobile: data.mobile,
				address: data.address,
				number: '1234',
			}
			];
		}
		return (
			<div className="table">
				<div className="detail-button">
					<button onClick={this.getList.bind(this)}>CLICK ME</button>
					<button onClick={this.showList.bind(this)}>LIST</button>
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

export default connect(mapStateToProps, mapDispatchToProps)(AgentTable);
