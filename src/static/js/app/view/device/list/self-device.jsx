import React from 'react';
import { Table, Button, Breadcrumb, Popconfirm, message,Modal,Steps,Input,Icon,Col,Row,Tabs} from 'antd';
import { Link, hashHistory } from 'react-router';
const Step = Steps.Step;
const TabPane = Tabs.TabPane;
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as DeviceActions from '../../../actions/device';
import * as UserActions from '../../../actions/user';
import UserService from "../../../service/user";
import DeviceService from "../../../service/device";

import './app.less';
import _ from 'lodash';
import moment from 'moment';
import AllocateModal from './allocate-modal.jsx';
const InputGroup = Input.Group;
import DeviceList from './app.jsx';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      pagination: {},
      loading: false,
      pager: {},
      page: 1,
      perPage: 10,
      changeState: 0,
      visible: false,
      resetCurrent: false,
      userAccount:'',
      userInfo:{
        account:'',
        mobile:'',
        name:'',
        contact:'',
      },// 获取的用户信息
      bindResult:'',//绑定结果反馈
      selectedRowKeys:[],
      selected: true,
      rowColor:{},
      serialNumber:'',
      userQuery:'',
      userId:'',
      schoolId:'',
      lockButton: false,
      // 请求自己的设备
      isAssigned: '0',
      tabs:[{title:'我的设备', url:'/device'},
        {title:'已分配设备', url:'/device/child'}],
      defaultTab: '/device',
    };
    this.getNowQuery = this.getNowQuery.bind(this);
  }
  componentWillMount() {}
  componentWillReceiveProps(nextProps) {}
  getNowQuery() {
    const pager = {
      page: this.state.page,
      perPage: this.state.perPage,
      serialNumber: this.state.serialNumber,
      userQuery: this.state.userQuery,
      userId: this.state.userId,
      schoolId: this.state.schoolId,
    }
    return pager;
  }
  replaceLocation(location) {
    hashHistory.replace(location);
  }
  render() {
    return (
      <DeviceList location={this.props.location}
                  replaceLocation={this.replaceLocation.bind(this)}
                  tabs={this.state.tabs}
                  defaultTab={this.state.defaultTab}
                  isAssigned={this.state.isAssigned}
      />
    );
  }
}


App.propTypes = {};

export default App;
