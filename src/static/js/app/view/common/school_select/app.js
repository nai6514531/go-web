import React from 'react';
import './app.less';
import { Cascader, Button } from 'antd';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as UserActions from '../../../actions/user';
import * as regionActions from '../../../actions/region';


function mapStateToProps(state) {
	const { region: { provinceList, provinceSchool, cityList } }= state;
	return { provinceList, provinceSchool, cityList };
}

function mapDispatchToProps(dispatch) {
	const {
		getSchoolDevice,
	} = bindActionCreators(UserActions, dispatch);
	const {
		getProvinceList,
		getProvinceSchoolList,
		getCityList,
	} = bindActionCreators(regionActions, dispatch);
	return {
		getSchoolDevice,
		getProvinceList,
		getProvinceSchoolList,
		getCityList,
	};
}
const user_data = JSON.parse(document.getElementById('main').dataset.user);

class SchoolSelect extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			provinceId: '',
			provinceName: '',
			schoolId: '',
			schoolName: '',
		};
		this.handleFilter = this.handleFilter.bind(this);
	}
	handleFilter() {
		const id = user_data.user.id;
		this.props.getSchoolDevice(id, this.state.schoolId);
		// <Button type="primary" onClick={this.handleFilter}>筛选</Button>
	}
	componentWillMount() {
		this.props.getProvinceList();
	}
	selectProvince(provinceId, provinceName) {
		this.props.getProvinceSchoolList(provinceId);
		this.setState({
			provinceId: provinceId,
			provinceName: provinceName,
		});
	}
	selectSchool(schoolId, schoolName) {
		this.setState({
			schoolId: schoolId,
			schoolName: schoolName,
		});
		this.refs.box.classList.toggle('box-show');
		this.refs.mask.classList.toggle('box-show');
		this.props.handleSelect(this.state.provinceId, schoolId);
	}
	showBox() {
		this.refs.box.classList.toggle('box-show');
		this.refs.mask.classList.toggle('box-show');
	}
	render() {
		const provinceList = this.props.provinceList;
		let provinceNode = '';
		const that = this;
		if(provinceList) {
			if(provinceList.fetch == true){
				provinceNode = provinceList.result.data.map(function(item, key){
					return (
						<Button key={key} onClick={that.selectProvince.bind(that,item.id,item.name)}>{item.name}</Button>
					)
				})
			}
		}
		const provinceSchool = this.props.provinceSchool;
		let schoolNode = '';
		if(provinceSchool) {
			if(provinceSchool.fetch == true){
				schoolNode = provinceSchool.result.data.map(function(item, key){
					return (
						<span key={key} onClick={that.selectSchool.bind(that,item.id,item.name)}>{item.name}</span>
					)
				})
			}
		}
		return (
			<div className="filter">
				<div  ref="mask" className="mask box-show"></div>
				<div ref="box" className="box box-show" >
					<div className="province">
						{provinceNode}
					</div>
					<div className="school">
						{schoolNode ? schoolNode : '请先选择省份'}
					</div>
				</div>
				<div onClick = {this.showBox.bind(this)} className="show">
					{this.state.province_id ?
						<div>
							<span>{this.state.provinceName}</span>
							<span>{this.state.schoolName}</span>
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
