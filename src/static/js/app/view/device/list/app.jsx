import React from 'react';
import { Table, Button, Breadcrumb, Popconfirm, message,Modal,Steps,Input,Icon,Col,Row,Tabs} from 'antd';
import { Link,hashHistory } from 'react-router';
const Step = Steps.Step;
const TabPane = Tabs.TabPane;
import SodaTabs from '../tabs/app.jsx';
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
function mapStateToProps(state) {
  const { device: { list, status, resultRemove,resultReset }, user: {schoolDevice} } = state;
  return { list, status, resultRemove,resultReset, schoolDevice };
}

function mapDispatchToProps(dispatch) {
  const {
    getDeviceList,
    deleteDevice,
    resetDevice,
    patchDeviceStatus,
  } = bindActionCreators(DeviceActions, dispatch);
  const {
    getSchoolDevice,
  } = bindActionCreators(UserActions, dispatch);
  return {
    getDeviceList,
    deleteDevice,
    resetDevice,
    patchDeviceStatus,
    getSchoolDevice,
  };
}
const items = {}
const columns = [{
  title: '序号',
  dataIndex: 'id',
  key: 'id',
  width:20,
},
  {
    title: '运营商',
    dataIndex: 'userName',
    key: 'userName',
    width:20,
    // colSpan:USER.role.id == 5?1:2,
    render: (userName,record) => {
      return <div>{userName}<p>{record.userMobile?'  '+record.userMobile:''}</p></div>;
      // if(USER.role.id == 5) {
      // }
      // return {
      //   children: <div>{userName}<p>{record.userMobile?'  '+record.userMobile:''}</p></div>,
      //   props: {
      //     colSpan: 2,
      //   },
      // };
    }
  },
  {
    title: '编号',
    dataIndex: 'serialNumber',
    key: 'serialNumber',
    width:20,
    render: (serialNumber,record) => {
      return <span>{serialNumber}</span>;
    }
  },
  {
    title: '楼层',
    dataIndex: 'address',
    key: 'address',
    width:20,
  },{
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width:20,
    render: (status) => {
      // 这里如果是普通运营商则不需要展示
      let statusText = '';
      if(status == 0){
        statusText = '空闲';
      } else if(status == 9) {
        statusText = '锁定';
      } else if(status == 601 || status == 602 || status == 603 || status == 604) {
        statusText = '使用中';
      }
      return statusText;
    }
  }, {
    title: '单脱',
    dataIndex: 'firstPulsePrice',
    key: 'firstPulsePrice',
    width:20,
    render: (firstPulsePrice) => {
      return firstPulsePrice/100;
    }
  }, {
    title: '快洗',
    dataIndex: 'secondPulsePrice',
    key: 'secondPulsePrice',
    width:20,
    render: (secondPulsePrice) => {
      return secondPulsePrice/100;
    }
  }, {
    title: '标准洗',
    dataIndex: 'thirdPulsePrice',
    key: 'thirdPulsePrice',
    width:20,
    render: (thirdPulsePrice) => {
      return thirdPulsePrice/100;
    }
  }, {
    title: '大物洗',
    dataIndex: 'fourthPulsePrice',
    key: 'fourthPulsePrice',
    width:20,
    render: (fourthPulsePrice) => {
      return fourthPulsePrice/100;
    }
  },{
  title: '类型',
  dataIndex: 'referenceDeviceId',
  key: 'referenceDeviceId',
    width:20,
    render: (referenceDeviceId,record) => {
      let referenceDevice = '';
      switch (+referenceDeviceId){
        case 1:
          referenceDevice = '洗衣机';
          break;
        case 2:
          referenceDevice = '充电桩';
          break;
        case 3:
          referenceDevice = 'GPRS模块洗衣机';
          break;
        default:
          referenceDevice = '';
      }
      return referenceDevice;
    }
}, {
    title: '更新时间',
    dataIndex: 'assignedAt',
    key: 'assignedAt',
    width:20,
    render: (assignedAt,record) => {
      const time = assignedAt!=''&&assignedAt!='0001-01-01T00:00:00Z'?
        moment(assignedAt).format('YYYY-MM-DD HH:mm:ss'):
        moment(record.createdAt).format('YYYY-MM-DD HH:mm:ss');
      return <span>{time}</span>
    }
  }, {
    title: '返厂设备',
    dataIndex: 'hasRetrofited',
    key: 'hasRetrofited',
    width: 20,
    colSpan:USER.role.id == 5?1:0,
    render: (hasRetrofited,record) => {
      // 这里如果是普通运营商则不需要展示
      if(USER.role.id == 5) {
        return hasRetrofited?<div style={{color:'red'}}>是<p>({record.fromUserName}</p><p>{record.fromUserMobile})</p></div>:<span>否</span>;
      }
      return {
        props: {
          colSpan: 0,
        },
      };
    }
  },
   {
  title: '操作',
  dataIndex: 'action',
  key: 'action',
  width: 40,
  render: (text, record) => {
    let node = '/';
    let action = '/';
    const status = record.statusCode;
    if(status == 9) {
      action = <Popconfirm title="确认取消锁定吗?" onConfirm={record.changeStatus.bind(this, record.id, true)}>
        <a href="#">取消锁定</a>
      </Popconfirm>
    }
    else if (status == 0 || status == 2) {
      action = <Popconfirm title="确认锁定吗?" onConfirm={record.changeStatus.bind(this, record.id, false)}>
        <a href="#">锁定</a>
      </Popconfirm>
    }
    else if (status == 601 || status == 602 || status == 603 
      || status == 604 || status == 605 || status == 606 || status == 607 || status == 608) {
      action = <Popconfirm title="确认取消占用吗?" onConfirm={record.changeStatus.bind(this, record.id, true)}>
        <a href="#">取消占用</a>
      </Popconfirm>
    }
    // if(USER.id == record.userId) {
      node =
        <span>
          <Link to={"/device/edit/" + record.id}>修改</Link>
          <span className="ant-divider" />
            {USER.role.id == 5 && USER.id == record.userId && +record.isAssigned == 0?
              <Popconfirm title="确认删除吗?" onConfirm={record.remove.bind(this, record.id)}>
                <a href="#">删除</a>
              </Popconfirm>
              :""//<Popconfirm title="你确认要删除并锁定该设备吗？" onConfirm={record.reset.bind(this, record.id)}><a href="#">删除</a></Popconfirm>
            }
          <span>
            <span className="ant-divider" />
            {action}
          </span>
        </span>
    // }
    return node;
  },
}];


class DeviceList extends React.Component {
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
      // 此处是 hardCode,根据后续需求再改
      isAssigned: props.isAssigned,
      // tabs:[{title:'我的设备', url:'0'},
      //   {title:'已分配设备', url:'1'}],
      // defaultTab: '0',
      // tabSearch:'?child=0'
    };
    this.remove = this.remove.bind(this);
    this.reset = this.reset.bind(this);
    this.changeStatus = this.changeStatus.bind(this);
    this.getNowQuery = this.getNowQuery.bind(this);
    this.replaceLocation = this.replaceLocation.bind(this);
  }
  componentWillMount() {
    let pager = this.getNowQuery();
    // 拉取设备详情
    this.loading = true;
    // 从列表操作处进入的时候,路由会变化,
    // 因为使用路由只有 userId 和 schoolId,没有 page 和 perPage
    const query = this.props.location.query;
    if(!_.isEmpty(query)) {
      pager.serialNumber = query.serialNumber;
      pager.userQuery = query.userQuery;
      pager.userId = query.userId;
      pager.schoolId = query.schoolId;
      pager.page = +query.page || 1;
      pager.perPage = +query.perPage || 10;
      pager.isAssigned = +query.isAssigned || 0;
      this.setState({
        serialNumber: query.serialNumber,
        userQuery: query.userQuery,
        userId: query.userId,
        schoolId: query.schoolId,
        page: +query.page || 1,
        perPage: +query.perPage || 10,
        isAssigned: +query.isAssigned || 0,
      })
      if(pager.isAssigned) {
        this.setState({defaultTab:'1'});
      }
    }
    this.props.getDeviceList(pager);
    this.setSearchValues(pager);
  }
  componentWillReceiveProps(nextProps) {
    const self = this;
    // 成功才拉取,失败就提示
    const pager = this.getNowQuery();
    if(this.theStatus !== -1) {
      const status = nextProps.status;
      if(status && self.theStatus !== -1 && self.theStatus !== undefined){
        if(status.fetch == true){
          this.props.getDeviceList(pager);
          this.setSearchValues(pager);
          message.success(nextProps.status.result.msg,3);
        } else {
          message.error(nextProps.status.result.msg, 3);
          console.log(nextProps.status.result.msg);
        }
        self.theStatus = -1;
      }
    }
    // 可以替换成普通的请求
    if(this.removeDevice !== -1 && this.removeDevice !== undefined) {
      const remove = nextProps.resultRemove;
      if(remove){
        if(remove.fetch == true){
          this.props.getDeviceList(pager);
          this.setSearchValues(pager);
          self.loading = true;
          message.success('删除成功!',3);
        } else {
          message.error(remove.result.msg,3);
        }
        self.removeDevice = -1;
      }
    }
    if(this.resetDevice !== -1 && this.resetDevice !== undefined) {
      const resultReset = nextProps.resultReset;
      if(resultReset){
        if(resultReset.fetch == true){
          this.props.getDeviceList(pager);
          this.setSearchValues(pager);
          self.loading = true;
          message.success('删除成功!',3);
        } else {
          message.error(resultReset.result.msg,3);
        }
        self.resetDevice = -1;
      }
    }

    if(this.props.list !== nextProps.list) {
      self.loading = false;
    }
  }
  getNowQuery() {
    const pager = {
      page: this.state.page,
      perPage: this.state.perPage,
      serialNumber: this.state.serialNumber,
      userQuery: this.state.userQuery,
      isAssigned: this.state.isAssigned,
    }
    return pager;
  }
  initializePagination() {
    let total = 1;
    if (this.props.list && this.props.list.fetch == true) {
      total = this.props.list.result.data.total;
    }
    const self = this;
    return {
      total: total,
      showSizeChanger: true,
      size:'small',
      showTotal (total) {
        return <span>总计 {total} 条</span>
      },
      defaultPageSize: this.state.perPage,
      onShowSizeChange(current, pageSize) {
        const pager = self.getNowQuery();
        pager.page = +current;
        pager.perPage = +pageSize;
        self.setState(pager);
        self.loading = true;
        self.props.getDeviceList(pager);
        self.setSearchValues(pager);
      },
      onChange(current) {
        const pager = self.getNowQuery();
        pager.page = +current;
        self.setState(pager);
        self.loading = true;
        self.props.getDeviceList(pager);
        self.setSearchValues(pager);
      },
    }
  }
  remove(id) {
    this.props.deleteDevice(id);
    this.removeDevice = 1;
    const { page } = this.state;
    if(this.dataLen == 1) {
      if(page > 1){
        this.pagination.onChange(page-1);
      }
    }
  }
  reset(id) {
    this.props.resetDevice(id);
    this.resetDevice = 1;
  }
  changeStatus(id,start) {
    const self = this;
    // 解除占用和取消锁定都是将设备状态转换为0
    if(start){
      const status = { status: 0 };
      this.props.patchDeviceStatus(id,status);
      self.theStatus = 0;
    }else {
      const status = { status: 9 };
      this.props.patchDeviceStatus(id,status);
      self.theStatus = 9;
    }
  }
  handleAllocate() {
    if(this.state.selectedRowKeys.length > 0) {
      this.setState({
        // 分配完成后,首次打开分配页面,需要重置current
        resetCurrent: true,
      });
      this.showModal();
    } else {
      message.info('请至少选择一个设备',3);
    }
  }
  handleBatchEdit(e) {
    if(this.state.selectedRowKeys.length > 0) {
    } else {
      message.info('你还没有选择要修改的设备',3);
      e.preventDefault();
    }
  }
  changeResetCurrent() {
    this.setState({
      resetCurrent: false,
    });
  }
  showModal() {
    this.setState({
      visible: true,
    });
  }
  handleCancel(e) {
    this.setState({
      visible: false,
    });
  }
  resetHashHistory() {
    this.props.location.query.serialNumber = "";
    this.replaceLocation(this.props.location);
    // hashHistory.replace(this.props.location);
    this.setState({serialNumber:""})
  }
  resetList() {
    const pager = this.getNowQuery();
    this.setState({selectedRowKeys:[]});
    this.props.getDeviceList(pager);
    this.setSearchValues(pager);
  }
  rowClassName(record, index) {
    // 改变表格颜色
    // record.key 是表格行的 key,
    // 而 this.rowColor 是以 record.key 为 key 的对象,此处是取对应的 className
    return this.rowColor[record.key];
  }
  handleSerialNumberChange(e){
    this.setState({
      serialNumber: e.target.value
    })
  }
  handleUserChange(e){
    this.setState({
      userQuery: e.target.value
    })
  }
  handleSearch(){
    const serialNumber = this.state.serialNumber.replace(/[\r\n\s]/g,"");
    let pager = this.getNowQuery();
    pager.page = 1;
    pager.serialNumber = serialNumber;
    pager.userQuery = '';
    this.setState({page:1, userQuery:''});
    if(+this.props.isAssigned) {
      this.refs.searchUserInput.refs.input.value=''
    }
    // 重置 URL 参数
    this.props.location.query.serialNumber = this.state.serialNumber;
    this.props.location.query.userQuery = '';
    this.replaceLocation(this.props.location);
    // hashHistory.replace(this.props.location);
    // 拉取设备详情
    this.props.getDeviceList(pager);
    this.setSearchValues(pager);
    this.loading = true;
  }
  handleUserSearch(){
    const userQuery = this.state.userQuery.replace(/[\r\n\s]/g,"");
    let pager = this.getNowQuery();
    pager.page = 1;
    pager.serialNumber = '';
    pager.userQuery = userQuery;
    this.setState({page:1, serialNumber:''});
    this.refs.searchSerialInput.refs.input.value=''
    // 重置 URL 参数
    this.props.location.query.userQuery = this.state.userQuery;
    this.props.location.query.serialNumber = '';
    // hashHistory.replace(this.props.location);
    this.replaceLocation(this.props.location)
    // 拉取设备详情
    this.props.getDeviceList(pager);
    this.setSearchValues(pager);
    this.loading = true;
  }
  setSearchValues(items) {
    this.props.location.query = items;
    // hashHistory.replace(this.props.location);
    this.replaceLocation(this.props.location);
  }
  replaceLocation(e) {
    this.props.replaceLocation(e);
  }
  render() {
    const query = this.props.location.query;
    // 给 input 设置初始值
    let serialNumber = '';
    let userQuery = '';
    let current = this.state.page;
    let pageSize = this.state.pageSize;
    if(!_.isEmpty(query)) {
      serialNumber = query.serialNumber;
      userQuery = query.userQuery;
      current = +query.page;
      pageSize = +query.pageSize;
    }
    const self = this;
    this.pagination = this.initializePagination();
    this.pagination.current = current;
    // 勾选项,需要限制只能勾选自己的设备
    const selectedRowKeys = this.state.selectedRowKeys;
    const rowSelection = {
      selectedRowKeys,
      onChange: (selectedRowKeys, selectedRows) => {
        this.setState({
          selectedRowKeys:selectedRowKeys,
        });
      },
      onSelect: (record, selected, selectedRows) => {
        // record 当前被操作的行,selected 是否选中当前被操作的行,selectedRows 所有被选中的行
      },
      // getCheckboxProps: record => ({
      //   disabled: record.hasAssigned,
      // }),
    };
    const list = this.props.list;
    let dataSource = [];
    if(list) {
      if(list.fetch == true){
        const data = list.result.data.list;
        self.dataLen = data.length;
        let rowColor = {};
        dataSource = data.map(function (item, key) {
          // 奇数为白,偶数不变
          rowColor[item.serialNumber] = item.hasAssigned?'lock':key%2==0?'white':'gray';
          self.rowColor = rowColor;
          item.key = item.serialNumber;
          item.statusCode = item.status;
          item.remove = self.remove;
          item.reset = self.reset;
          item.changeStatus = self.changeStatus;
          item.isAssigned = self.state.isAssigned;
          return item;
        })
      }
    }
    const serialNumbers = this.state.selectedRowKeys.join(",");
    return (
      <section className="view-device-list">
        <header>
          <Breadcrumb>
            <Breadcrumb.Item>设备管理</Breadcrumb.Item>
          </Breadcrumb>
        </header>
        <div className="toolbar">
         <SodaTabs tabs={this.props.tabs}
                   defaultTab={this.props.defaultTab}
                   replaceLocation={this.replaceLocation.bind(this)}
                   location={this.props.location}
         />
          {+this.props.isAssigned?"":
            <Button onClick={this.handleAllocate.bind(this)} type="primary">批量分配</Button>
          }
          <Link to={"/device/batch-edit?isAssigned="+this.props.isAssigned+"&serialNumbers="+serialNumbers}
                className="ant-btn ant-btn-primary item"
                onClick={this.handleBatchEdit.bind(this)}>批量修改</Link>
          {USER.role.id == 5 && +this.props.isAssigned == 0?
            <Link to="/device/edit" className="ant-btn ant-btn-primary item">
              添加新设备
            </Link>:""
          }
          <div className="search">
            <div className="serial search-input">
              <Input ref="searchSerialInput"
                     onChange={this.handleSerialNumberChange.bind(this)}
                     addonBefore="设备编号:" defaultValue={serialNumber}
                     placeholder="请输入设备编号"
                     onPressEnter={this.handleSearch.bind(this)}
              />
            </div>
            <Button className="item" onClick={this.handleSearch.bind(this)} type="primary">筛选</Button>
            {+this.props.isAssigned ?
              <div className="search-div">
                <div className="user search-input">
                  <Input ref="searchUserInput"
                         onChange={this.handleUserChange.bind(this)}
                         addonBefore="账户或用户名:" defaultValue={userQuery}
                         placeholder="请输入用户账户或用户名"
                         onPressEnter={this.handleUserSearch.bind(this)}
                  />
                </div>
                <Button className="item" onClick={this.handleUserSearch.bind(this)} type="primary">筛选</Button>
              </div>:""
            }
          </div>
        </div>
        <article>
          <Table
            scroll={{ x: 280 }}
            columns={columns}
            dataSource={dataSource}
            pagination={this.pagination}
            loading={this.loading}
            onChange={this.handleTableChange}
            rowSelection={rowSelection}
            rowClassName={this.rowClassName.bind(this)}
            bordered
            />
          <AllocateModal
            visible={this.state.visible}
            selectedRowKeys={this.state.selectedRowKeys}
            showModal={this.showModal.bind(this)}
            handleCancel={this.handleCancel.bind(this)}
            resetList={this.resetList.bind(this)}
            resetCurrent={this.state.resetCurrent}
            changeResetCurrent={this.changeResetCurrent.bind(this)}
          />
        </article>
      </section>
    );
  }
}


DeviceList.propTypes = {
  handleTableChange: React.PropTypes.func,
};

export default connect(mapStateToProps, mapDispatchToProps)(DeviceList);
