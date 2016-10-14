import React from 'react';
import './../school_device/app.less';
import { Table, Breadcrumb } from 'antd';
import SchoolFilter from '../../common/school_filter/app'
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
	render: (text, record) => <Link to={"/user/device/school/" + record.id}>查看模块</Link>,
}];


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
		const id = user_data.user.id;
		this.props.userSchool(id);
	}
	render() {
		const school = this.props.school;
		let dataSource = [];
		if(school){
			if(school.fetch == true){
        		const data = school.result.data;
				dataSource = data.map(function (item,key) {
					console.log(item);
					return {
						key: item.id,
						index: key,
						school: item.name,
						number: '1234',
					}
				})
			}
		}
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
								<div>
									<SchoolFilter/>
									<Table columns={columns}
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
