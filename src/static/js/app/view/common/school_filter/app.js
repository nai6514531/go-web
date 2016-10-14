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
	}
	componentWillMount() {
		this.props.provinceList();
		// this.props.provinceSchoolList(110000);
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
	}
	showBox() {
		this.refs.box.classList.toggle('box_show');
		this.refs.mask.classList.toggle('box_show');
	}
	render() {
		const province_list = this.props.province_list;
		let province_node = '';
		// console.log('province_list',province_list);
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
		// console.log('province_school',province_school);
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
		// 只做省学校级联,不做button,是否需要 button 由外部决定
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
				<Button type="primary" onClick={this.handleFilter}>筛选</Button>
			</div>
		);
	}
}


SchoolFilter.propTypes = {
	title: React.PropTypes.string,
};

export default connect(mapStateToProps, mapDispatchToProps)(SchoolFilter);
