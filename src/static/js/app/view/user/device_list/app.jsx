import React from 'react';
import './app.less';
import { Table, Breadcrumb, Form, Select, Button } from 'antd';
const FormItem = Form.Item;
const Option = Select.Option;
import { Link } from 'react-router';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as UserActions from '../../../actions/user';


function mapStateToProps(state) {
	const { user: { school, schoolDevice, device, allSchool } } = state;
	return { school, schoolDevice, device, allSchool };
}

function mapDispatchToProps(dispatch) {
	const {
		getUserSchool,
		getUserDevice,
		getAllSchool,
	} = bindActionCreators(UserActions, dispatch);
	return {
		getUserSchool,
		getUserDevice,
		getAllSchool,
	};
}

const columns = [{
	title: 'ID',
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
			pager: {},
			page: 1,
			perPage: 10,
			schoolList: [],
			schoolId:'',
		};
	}
	componentWillMount() {
		const pager = {page: this.state.page, perPage: this.state.perPage};
		const schoolId = -1;
		this.loading = true;
		this.props.getUserSchool(USER.id, schoolId, pager);
		this.props.getAllSchool(USER.id, schoolId);
	}
	componentWillReceiveProps(nextProps) {
		console.log(nextProps.school);
		if(this.getSchool == 1 && nextProps.school) {
			this.loading = false;
			this.getSchool = 0;
		}
	}
	initializePagination() {
		let total = 1;
		if (this.props.school && this.props.school.fetch == true) {
			total = this.props.school.result.data.total;
		}
		const self = this;
		let schoolId = -1;
		if(this.state.schoolId) {
			schoolId = this.state.schoolId;
		}
		return {
			total: total,
			showSizeChanger: true,
			onShowSizeChange(current, pageSize) {
				const pager = { page : current, perPage: pageSize};
				self.setState(pager);
				self.loading = true;
				self.props.getUserSchool(USER.id, schoolId, pager);
				self.getSchool = 1;
			},
			onChange(current) {
				const pager = { page: current, perPage: self.state.perPage};
				self.setState(pager);
				self.loading = true;
				self.props.getUserSchool(USER.id, schoolId, pager);
				self.getSchool = 1;
			},
		}
	}
	changeSchoolId(schoolId) {
		this.setState({schoolId:schoolId})
	}
	render() {
		const self = this;
		const pagination = this.initializePagination();
		const school = this.props.school;
		let dataSource = [];
		let list = [];
		if(school){
			if(school.fetch == true){
				list = school.result.data;
				dataSource = list.map(function (item,key) {
					return {
						key: item.id,
						index: item.id,
						school: item.name,
						number: item.deviceTotal,
					}
				});
				self.loading = false;
			}
		}
		return (
			<section className="view-user-list">
				<header>
					<Breadcrumb >
						<Breadcrumb.Item><Link to="/user">代理商管理</Link></Breadcrumb.Item>
						<Breadcrumb.Item>设备管理</Breadcrumb.Item>
					</Breadcrumb>
				</header>
				<div className="toolbar">
					<SchoolFilter
						allSchool={this.props.allSchool}
						getUserSchool={this.props.getUserSchool}
						page={this.state.page}
						perPage={this.state.perPage}
						changeSchoolId={this.changeSchoolId.bind(this)}
					/>
					<Link to="/user/device/school/-1/edit" className="ant-btn ant-btn-primary item add-btn">
						添加新设备
					</Link>
				</div>
				<section className="view-content">
					<Table columns={columns}
						   dataSource={dataSource}
						   pagination={pagination}
						   loading={this.loading}
						   onChange={this.handleTableChange}
						   bordered
					/>
				</section>
			</section>
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
		this.props.changeSchoolId(schoolId);
		const pager = {page: this.props.page, perPage: this.props.perPage};
		this.props.getUserSchool(USER.id, schoolId, pager);
	}
	render() {
		const allSchool = this.props.allSchool;
		let schoolNode = [];
		if(allSchool && allSchool.fetch == true){
			const firstNode = <Option key='-1' value="-1">所有学校</Option>;
			const schoolList = allSchool.result.data;
			schoolNode[0] = firstNode;
			for(let i = 0; i < schoolList.length; i++) {
				const id = schoolList[i].id.toString();
				const name = schoolList[i].name;
				const item = <Option style={{textOverflow: 'ellipsis'}} key={id} value={id}>{name}</Option>;
				schoolNode.push(item);
			}
			// schoolNode = schoolList.map(function (item, key) {
			// 	const id = item.id.toString();
			// 	return <Option key={key} value={id}>{item.name}</Option>;
			// })
		}
		const { getFieldDecorator } = this.props.form;
		const schoolFilter = {
			display: 'inline-block',
		};
		return (
			<div className="school-filter" style={schoolFilter}>
				<Form inline onSubmit={this.handleSubmit}
					  className="filter-form"
				>
					<FormItem
						id="select"
						labelCol={{ span: 6 }}
						wrapperCol={{ span: 14 }}
					>
						{getFieldDecorator('school', {
							rules: [
								{ required: true, message: '请选择学校' },
							],
							initialValue: "-1",
						})(
							<Select id="school" style={{width:200}} dropdownClassName="test">
								{schoolNode}
							</Select>
						)}
					</FormItem>
					<Button style={{verticalAlign:"top",height:32}} type="primary" htmlType="submit">筛选</Button>
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
