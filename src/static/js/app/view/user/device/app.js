import React from 'react';
import './../school_device/app.less';
import { Table, Breadcrumb } from 'antd';
import SchoolFilter from '../../index/school_filter/app'
import { Link } from 'react-router';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as UserActions from '../../../actions/user';


function mapStateToProps(state) {
	const { user: { school, school_device, device } } = state;
	return { school, school_device, device };
}

function mapDispatchToProps(dispatch) {
	const {
		userSchool,
		schoolDevice,
		userDevice,
	} = bindActionCreators(UserActions, dispatch);
	return {
		userSchool,
		schoolDevice,
		userDevice,
	};
}

const columns = [{
	title: '序号',
	dataIndex: 'index',
	key: 'index',
}, {
	title: '学校',
	dataIndex: 'school',
	key: 'school',
}, {
	title: '模块数量',
	dataIndex: 'number',
	key: 'number',
}, {
	title: '操作',
	dataIndex: 'action',
	key: 'action',
	render: () => <Link to="/agent/device/list">查看模块</Link>,
}];

const dataSource = [{
	key: '1',
	index: '1',
	school: '清华大学',
	number: '1234',
}
];
const user_data = JSON.parse(document.getElementById('main').dataset.user);

class SchoolTable extends React.Component {
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
	handleClick(){
		// this.props.userSchool(327);
		// this.props.schoolDevice(327, 1001);
		console.log(this.props);
		this.props.userDevice(327);
	}
	showMe(){
		// console.log(this.props.school);
		// console.log(this.props.school_device);
		console.log(this.props.device);
	}
	render() {
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
						<div className="table">
							<button onClick={this.handleClick.bind(this)}>CLICK ME</button>
							<button onClick={this.showMe.bind(this)}>SHOW ME</button>
								<div>
									<SchoolFilter/>
									<Table columns={columns}
										   rowKey={record => record.key}
										   dataSource={dataSource}
										   pagination={this.state.pagination}
										   loading={this.state.loading}
										   onChange={this.handleTableChange}
									/>
								</div>
						</div>
					</div>
				</div>
			</div>
		</div>

		);
	}
}


SchoolTable.propTypes = {
	handleTableChange: React.PropTypes.func,
};

export default connect(mapStateToProps, mapDispatchToProps)(SchoolTable);
