import React from 'react';
import './app.less';
import { Cascader, Button } from 'antd';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as UserActions from '../../../actions/user';
import * as regionActions from '../../../actions/region';


function mapStateToProps(state) {
	const { region: { province_list, province_school, city_list } }= state;
	return { province_list, province_school, city_list };
}

function mapDispatchToProps(dispatch) {
	const {
		schoolDevice,
	} = bindActionCreators(UserActions, dispatch);
	const {
		provinceList,
		provinceSchoolList,
		cityList,
	} = bindActionCreators(regionActions, dispatch);
	return {
		schoolDevice,
		provinceList,
		provinceSchoolList,
		cityList,
	};
}
const user_data = JSON.parse(document.getElementById('main').dataset.user);

class SchoolFilter extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			province: '',
			school: '',
		};
		this.onChange = this.onChange.bind(this);
		this.handleFilter = this.handleFilter.bind(this);
	}
	handleFilter() {
		console.log(this.state.value);
		this.props.schoolDevice();
	}
	onChange(value) {
		this.setState({value: value})
		console.log(this.state.value);
		if(this.state.value.length == 1){
			this.props.provinceSchoolList(this.state.value);
		}
	}
	componentWillMount() {
		this.props.provinceList();
	}
	selectProvince(id, province) {
		this.props.provinceSchoolList(id);
		this.setState({
			province: province,
		});
	}
	selectSchool(school_id, school) {
		const id = user_data.user.id;
		this.props.schoolDevice(id,school_id);
		this.setState({
			school: school,
		});
		this.refs.findNode.classList.toggle('box_show');
	}
	showBox() {
		this.refs.findNode.classList.toggle('box_show');
	}
	render() {
		const province_list = this.props.province_list;
		let province_node = '';
		// console.log('province_list',province_list);
		const that = this;
		if(province_list) {
			if(province_list.fetch == true){
				province_node = province_list.result.data.map(function(item, key){
					// console.log(item);
					return (
						<button key={key} onClick={that.selectProvince.bind(that,item.id,item.name)}>{item.name}</button>
					)
				})
			}
		}
		const province_school = this.props.province_school;
		// console.log('province_school',province_school);
		let school_node = '';
		if(province_school) {
			if(province_school.fetch == true){
				school_node = province_school.result.data.map(function(item, key){
					// console.log(item);
					return (
						<span key={key} onClick={that.selectSchool.bind(that,item.id,item.name)}>{item.name}</span>
					)
				})
			}
		}

		return (
			<div className="filter">
				<div ref='findNode' className="box">
					<div className="province">
						{province_node}
					</div>
					<div className="school">
						{school_node}
					</div>
				</div>
				<div onClick = {this.showBox.bind(this)} className="show">
					{this.state.province}
					{this.state.school}
				</div>
			</div>
		);
	}
}


SchoolFilter.propTypes = {
	title: React.PropTypes.string,
};

export default connect(mapStateToProps, mapDispatchToProps)(SchoolFilter);
