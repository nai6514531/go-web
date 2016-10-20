import React from 'react';
import './../school_device/app.less';
import { Table, Breadcrumb, Form, Select, Button } from 'antd';
const FormItem = Form.Item;
const Option = Select.Option;
import { Link } from 'react-router';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as UserActions from '../../../actions/user';


function mapStateToProps(state) {
	const { user: { school, schoolDevice, device } } = state;
	return { school, schoolDevice, device };
}

function mapDispatchToProps(dispatch) {
	const {
		getUserSchool,
		getSchoolDevice,
		getUserDevice,
	} = bindActionCreators(UserActions, dispatch);
	return {
		getUserSchool,
		getSchoolDevice,
		getUserDevice,
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
	render: (text, record) => <Link to={"/user/device/school/" + record.key}>查看模块</Link>,
}];


class SchoolTable extends React.Component {
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
		const pager = {page: this.state.page, perPage: this.state.perPage};
		const schoolId = 0;
		this.props.getUserSchool(USER.id, schoolId, pager);
	}
	initializePagination() {
		let total = 1;
		if (this.props.school && this.props.school.fetch == true) {
			total = this.props.school.result.data.total;
		}
		const self = this;
		return {
			total: total,
			showSizeChanger: true,
			onShowSizeChange(current, pageSize) {
				const pager = { page : current, perPage: pageSize};
				self.setState(pager);
				self.props.getUserSchool(USER.id, pager);
				// 执行函数获取对应的 page 数据,传递的参数是当前页码和需要的数据条数
				console.log('Current: ', current, '; PageSize: ', pageSize);
			},
			onChange(current) {
				const pager = { page: current, perPage: self.state.perPage};
				self.setState(pager);
				self.props.getUserSchool(USER.id, pager);
				// 执行函数获取对应的 page 数据,传递的参数是当前页码
				console.log('Current: ', current);
			},
		}
	}
	render() {
		const pagination = this.initializePagination();
		const school = this.props.school;
		let dataSource = [];
		let list = [];
		if(school){
			if(school.fetch == true){
				list = school.result.data;
				dataSource = list.map(function (item,key) {
					console.log(item);
					return {
						key: item.id,
						index: key,
						school: item.name,
						number: item.deviceTotal,
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
									<SchoolFilter 
										schoolList={list}
										getUserSchool={this.props.getUserSchool}
										page={this.state.page}
										perPage={this.state.perPage}
									/>
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
			</div>
		</div>

		);
	}
}
class SchoolFilter extends React.Component {
	constructor(props) {
		super(props);
		this.handleSubmit = this.handleSubmit.bind(this);
	}
	handleSubmit(e) {
		e.preventDefault();
		const schoolId = parseInt(this.props.form.getFieldsValue().school);
		const pager = {page: this.props.page, perPage: this.props.perPage};
		this.props.getUserSchool(USER.id, schoolId, pager);
	}
	render() {
		const schoolList = this.props.schoolList;
		let schoolNode = [];
		if(schoolList){
			schoolNode = schoolList.map(function (item, key) {
				const id = item.id.toString();
				return <Option key={key} value={id}>{item.name}</Option>;
			})
		}
		const { getFieldDecorator } = this.props.form;
		return (
			<div className="school-filter">
				<Form inline onSubmit={this.handleSubmit}>
					<FormItem
						id="select"
						labelCol={{ span: 6 }}
						wrapperCol={{ span: 14 }}
					>
						{getFieldDecorator('school', {
							rules: [
								{ required: true, message: '请选择学校' },
							],
						})(
							<Select id="school" style={{ width: 200 }} >
								{schoolNode}
							</Select>
						)}

					</FormItem>
					<Button type="primary" htmlType="submit">筛选</Button>
				</Form>
			</div>
		);
	}
}
SchoolFilter = Form.create()(SchoolFilter);

SchoolTable.propTypes = {
	handleTableChange: React.PropTypes.func,
};

export default connect(mapStateToProps, mapDispatchToProps)(SchoolTable);