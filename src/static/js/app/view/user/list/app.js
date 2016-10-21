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
		getUserList,
		getUserDetail,
	} = bindActionCreators(UserActions, dispatch);
	return {
		getUserList,
		getUserDetail,
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
			<Link to={'/user/edit/' + record.key}>修改</Link>
			{record.showAction?
				<span>
					<span className="ant-divider" />
					<Link to={'/user/' + record.key} onClick={record.action}>下级代理商</Link>
					<span className="ant-divider" />
					<Link to='/user/device/list'>设备管理</Link>
				</span>
			:''}
		</span>
	),
}];

class AgentTable extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			dataSource: [],
			page: 1,
			perPage: 10,
			pagination: {},
			loading: false,
			child: false,
			list: [],
			pager: {},
		};
		this.showChild = this.showChild.bind(this);
	}
	componentDidMount() {
		const pager = { page : this.state.page, perPage: this.state.perPage};
		if(this.props.params.id) {
			this.props.getUserList(pager);
		} else {
			this.props.getUserDetail(USER.id);
		}
	}
	showChild() {
		this.setState({
			child: true,
		})
	}
	componentWillUpdate(nextProps, nextState) {
		if(nextState.child == true && this.state.child == false) {
			const pager = { page : this.state.page, perPage: this.state.perPage};
			this.props.getUserList(pager);
		}
	}
	shouldComponentUpdate(nextProps, nextState) {
		if(nextProps.list !== this.props.list
			|| nextProps.detail !== this.props.detail
			|| nextState.child == true) {
			return true;
		} else {
			return false;
		}
	}
	initializePagination() {
		let total = 1;
		if (this.props.list && this.props.list.fetch == true) {
			total = this.props.list.result.data.total;
		}
		const self = this;
		return {
			total: total,
			showSizeChanger: true,
			onShowSizeChange(current, pageSize) {
				const pager = { page : current, perPage: pageSize};
				self.setState(pager);
				self.props.getUserList(pager);
				// 执行函数获取对应的 page 数据,传递的参数是当前页码和需要的数据条数
				console.log('Current: ', current, '; PageSize: ', pageSize);
			},
			onChange(current) {
				console.log('Current: ', current);
				const pager = { page : current, perPage: self.state.perPage};
				self.setState(pager);
				self.props.getUserList(pager);
				// 执行函数获取对应的 page 数据,传递的参数是当前页码
			},
		}
	}
	render() {
		const { list, detail, params: {id} } = this.props;
		const pagination = this.initializePagination();
		let loading = true;
		let data = '';
		let dataSource = [];
		const self = this;
		if(id) {
			if(list){
				if(list.fetch == true){
					data = list.result.data.list;
					dataSource = data.map(function (item, key) {
						return (
						{
							key: item.id,
							index: item.id,
							user: item.name,
							contact: item.contact,
							mobile: item.mobile,
							address: item.address,
							number: item.deviceTotal ? item.deviceTotal : 0,
							action: self.showChild,
							showAction: false,
						}
						)
					})
				}
				loading = false;
			}
		} else {
			if(detail) {
				if(detail.fetch == true) {
					data = detail.result.data;
					dataSource = [{
						key: data.id,
						index: data.id,
						user: data.name,
						contact: data.contact,
						mobile: data.mobile,
						address: data.address,
						number: data.deviceTotal ? data.deviceTotal : 0,
						action: self.showChild,
						showAction: true,
					}
					];
				}
				loading = false;
			}
		}
		return (
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
									<Link to='/user/edit/new'>
										添加新代理商
									</Link>
								</Button>
							</div>
							<Table columns={columns}
								   rowKey={record => record.key}
								   dataSource={dataSource}
								   pagination={pagination}
								   loading={loading ? loading : false}
							/>
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
