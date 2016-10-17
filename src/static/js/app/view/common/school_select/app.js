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

class SchoolSelect extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			province_id: '',
			province_name: '',
			school_id: '',
			school_name: '',
		};
		this.handleFilter = this.handleFilter.bind(this);
	}
	handleFilter() {
		const id = user_data.user.id;
		this.props.schoolDevice(id, this.state.school_id);
		// <Button type="primary" onClick={this.handleFilter}>筛选</Button>
	}
	componentWillMount() {
		this.props.provinceList();
	}
	selectProvince(province_id, province_name) {
		this.props.provinceSchoolList(province_id);
		this.setState({
			province_id: province_id,
			province_name: province_name,
		});
	}
	selectSchool(school_id, school_name) {
		this.setState({
			school_id: school_id,
			school_name: school_name,
		});
		this.refs.box.classList.toggle('box_show');
		this.refs.mask.classList.toggle('box_show');
		this.props.handleSelect(this.state.province_id, school_id);
	}
	showBox() {
		this.refs.box.classList.toggle('box_show');
		this.refs.mask.classList.toggle('box_show');
	}
	render() {
		const province_list = this.props.province_list;
		let province_node = '';
		const that = this;
		if(province_list) {
			if(province_list.fetch == true){
				province_node = province_list.result.data.map(function(item, key){
					return (
						<Button key={key} onClick={that.selectProvince.bind(that,item.id,item.name)}>{item.name}</Button>
					)
				})
			}
		}
		const province_school = this.props.province_school;
		let school_node = '';
		if(province_school) {
			if(province_school.fetch == true){
				school_node = province_school.result.data.map(function(item, key){
					return (
						<span key={key} onClick={that.selectSchool.bind(that,item.id,item.name)}>{item.name}</span>
					)
				})
			}
		}
		return (
			<div className="filter">
				<div  ref="mask" className="mask box_show"></div>
				<div ref="box" className="box box_show" >
					<div className="province">
						{province_node}
					</div>
					<div className="school">
						{school_node ? school_node : '请先选择省份'}
					</div>
				</div>
				<div onClick = {this.showBox.bind(this)} className="show">
					{this.state.province_id ?
						<div>
							<span>{this.state.province_name}</span>
							<span>{this.state.school_name}</span>
						</div>
						:
						<span>请选择学校</span>
					}
				</div>
			</div>
		);
	}
}


SchoolSelect.propTypes = {
	title: React.PropTypes.string,
};

export default connect(mapStateToProps, mapDispatchToProps)(SchoolSelect);
