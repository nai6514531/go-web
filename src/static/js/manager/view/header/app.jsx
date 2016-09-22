import './app.less';
import React from 'react';
import { Menu, Dropdown, Icon, DatePicker, TimePicker } from 'antd';
import moment from 'moment';
import emitter from '../../library/emitter/emitter.js';

const App = React.createClass({
  getInitialState() {
    return {
      datePickerVal: "",
      timePickerVal: ""
    }
  },
  componentWillMount(){
    const self = this;
    self.setState({
      datePickerVal: moment().format('YYYY-MM-DD'),
      timePickerVal: moment().format('HH:mm')
    });
    this.setIntervalTimePick();

  },
  componentDidMount(){
    const self = this;
    this.changeDatePickVal(null, self.state.datePickerVal);
  },
  setIntervalTimePick() {
    const self = this;
    setInterval(function(){
      self.setState({
        timePickerVal: moment().format('HH:mm')
      });
    }, 1000);
  },
  logout() {
    console.log("logout");
  },
  changeDatePickVal(date, dateString) {
    emitter.emit("change_header_datePickerVal", {
      datePickerVal: dateString
    });
  },
  render() {
    const datePickerVal = this.state.datePickerVal;
    const timePickerVal = this.state.timePickerVal;
  	const menu = (
		  <Menu>
		    <Menu.Item>
		      <a href="javascipt:void(0)" onClick={this.logout}>退出登录</a>
		    </Menu.Item>
		  </Menu>
		);
    return (
      <div className="header">
        <div className="lf">
        	<img src={require('../../../../img/manager/logo_mz.jpg')} />
        	卖座影院售卖系统
        </div>
        <div className="rg">
        	<div className="date">
        		<DatePicker defaultValue={datePickerVal} format="yyyy-MM-dd" onChange={this.changeDatePickVal}/>
            <TimePicker key={+new Date()} defaultValue={timePickerVal} format="HH:mm" disabled />
        	</div>
        	<div className="person">
        		<Dropdown overlay={menu}>
					    <a className="ant-dropdown-link" href="javascipt:void(0)">
					      登录用户001 <Icon type="down" />
					    </a>
					  </Dropdown>
        	</div>
        </div>
      </div>
    );
  }
});

export default App;
