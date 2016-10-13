import React from 'react';
import './app.less';
import { Table, Button, Breadcrumb } from 'antd';
import { Link } from 'react-router';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as UserActions from '../../../actions/user';


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
			<Link to='/user/edit/20'>修改</Link>
			<span className="ant-divider" />
			<Link to='/user'>下级代理商</Link>
			<span className="ant-divider" />
			<Link to='/user/device'>设备管理</Link>
		</span>
	),
}];

class AgentTable extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			dataSource: [],
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
	render() {
		const list = this.props.list;
		console.log('list:',list);
		let loading = false;
		let data = '';
		let dataSource = [];
		if(list){
			loading = true;
			if(list.fetch == true){
				data = list.result.data.list[0];
				loading = false;
				dataSource = [{
					key: '1',
					index: '1',
					user: data.user.name,
					contact: data.user.contact,
					mobile: data.user.mobile,
					address: data.user.address,
					number: data.device.sum,
				}
				];
			}
		}
		return (
		<div className="index">
			<div className="body-panel">
				<div className="detail">
					<div className="detail-head">
						<Breadcrumb separator=">">
							<Breadcrumb.Item>代理商管理</Breadcrumb.Item>
						</Breadcrumb>
					</div>
					<div className="detail-form">
						<div className="table">
							<div className="detail-button">
								<Button type="primary">
									<Link to='/user/edit'>
										添加新代理商
									</Link>
								</Button>
							</div>
							<Table columns={columns}
								   rowKey={record => record.key}
								   dataSource={dataSource}
								   pagination={this.state.pagination}
								   loading={loading ? loading : false}
								   onChange={this.handleTableChange}
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
		);
	}
}


AgentTable.propTypes = {
	handleTableChange: React.PropTypes.func,
};

export default connect(mapStateToProps, mapDispatchToProps)(AgentTable);
