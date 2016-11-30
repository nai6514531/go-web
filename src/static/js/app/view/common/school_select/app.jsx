import './app.less';
import React from 'react';
import { Cascader, Button, message } from 'antd';

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

class SchoolSelect extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      provinceId: '',
      provinceName: '',
      schoolId: '',
      schoolName: '',
      defaultProvinceId:'',
      defaultProvinceName:'',
      chooseSchool: false,
      boxHide: 'box-hide',
    };
  }
  componentWillMount() {
    // 这里的 list 可以和父组件公用
    this.props.getProvinceList();
    this.hide = false;
  }
  componentWillReceiveProps(nextProps) {
    // 需要初始化省学校信息
    if(this.props.provinceId == undefined && nextProps.provinceId) {
      this.setState({
        provinceId: nextProps.provinceId,
        defaultProvinceId: nextProps.provinceId,
      });
    }
    if(this.props.provinceName == undefined && nextProps.provinceName) {
      this.setState({
        provinceName: nextProps.provinceName,
        defaultProvinceName: nextProps.provinceName,
      });
    }
    if(this.props.schoolId == undefined) {
      if(nextProps.schoolId){
        this.setState({schoolId: nextProps.schoolId});
      } else if(nextProps.schoolId == 0) {
        this.setState({schoolId: -nextProps.provinceId});
      }
    }
    if(this.props.schoolName == undefined) {
      if(nextProps.schoolName){
        this.setState({schoolName: nextProps.schoolName});
      } else if(nextProps.schoolId == 0) {
        this.setState({schoolName: '其它'});
      }
    }
  }
  selectProvince(provinceId, provinceName, event) {
    this.props.getProvinceSchoolList(provinceId);
    this.setState({
      provinceId: provinceId,
      provinceName: provinceName,
      chooseSchool: true,
    });
    this.hide = false;
  }
  selectSchool(schoolId, schoolName) {
    this.setState({
      schoolId: schoolId,
      schoolName: schoolName,
      defaultProvinceId: this.state.provinceId,
      defaultProvinceName: this.state.provinceName,
    });
    this.hideBox();
    this.props.handleSelect(this.state.provinceId, schoolId);
  }
  showBox() {
    this.setState({boxHide:''});
  }
  hideBox() {
    this.setState({boxHide:'box-hide'});
  }
  showSelectList() {
    if(!this.state.provinceName) {
      this.hide = true;
    }
    if(this.props.provinceId){
      this.props.getProvinceSchoolList(this.props.provinceId);
    }
    this.showBox();
    //console.log(this.state);
  }
  onCancel() {
    this.hideBox();
    this.setState({
      provinceId: this.state.defaultProvinceId,
      provinceName: this.state.defaultProvinceName,
      chooseSchool: false,
    });
  }
  render() {
    const provinceList = this.props.provinceList;
    let provinceNode = '';
    const self = this;
    if(provinceList) {
      if(provinceList.fetch == true){
        provinceNode = provinceList.result.data.filter(function(item, key){
          return item.id !== 820000 && item.id !== 810000 && item.id !== 710000;
        }).map(function (item,key) {
          const buttonStyle = item.id == self.state.provinceId?{type:'primary'}:{};
          return (
            <Button key={key} {...buttonStyle} onClick={self.selectProvince.bind(self,item.id,item.name)}>{item.name}</Button>
          )
        })
      }
    }
    const provinceSchool = this.props.provinceSchool;
    let schoolNode = '';
    if(provinceSchool) {
      if(provinceSchool.fetch == true){
        const list = provinceSchool.result.data;
        schoolNode = list.filter(function(item, key){
          return item.id !== 0 && item.id !== 34093;
        }).map(function(item, key){
          const buttonStyle = item.id == self.state.schoolId?{color:'#2db7f5',border:'1px solid #2db7f5'}:{};
          return (
            <span className="btn-select" style={buttonStyle} key={key} onClick={self.selectSchool.bind(self,item.id,item.name)}>{item.name}</span>
          )
        })
        // 该省ID取反为该市未分类的学校ID,主要是为了在高亮时区分是哪个省的未分类
        const noClassSchoolId = -(self.state.provinceId);
        const buttonStyle = noClassSchoolId == self.state.schoolId?{color:'#2db7f5',border:'1px solid #2db7f5'}:{};
        const noClassSchool = <span className="btn-select" style={buttonStyle} key={-1} onClick={self.selectSchool.bind(self,noClassSchoolId,'其它')}>其它</span>
        schoolNode.push(noClassSchool);
      }
    }
    return (
      <div className="filter">
        <div  ref="mask" className={"mask "+this.state.boxHide} onClick={this.onCancel.bind(this)}></div>
        <div ref="box" className={"box "+this.state.boxHide} >
          <div className="province">
            {provinceNode}
          </div>
          <div className="school">
            {this.hide ? '请先选择省份' :(schoolNode ? schoolNode : '请先选择省份')}
          </div>
        </div>
        <div onClick = {this.showSelectList.bind(this)} className="show">
          {this.state.provinceName ?
            <div>
              {this.state.provinceName}-
              {this.state.schoolName}
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
