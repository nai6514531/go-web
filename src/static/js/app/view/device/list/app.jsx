import React from 'react';
import { Table, Button, Breadcrumb, Popconfirm, message,Modal,Steps,Input,Icon,Col,Row} from 'antd';
import { Link,hashHistory } from 'react-router';
const Step = Steps.Step;
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
    title: '添加时间',
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
    else if (status == 0) {
      action = <Popconfirm title="确认锁定吗?" onConfirm={record.changeStatus.bind(this, record.id, false)}>
        <a href="#">锁定</a>
      </Popconfirm>
    }
    else if (status == 601 || status == 602 || status == 603 || status == 604) {
      action = <Popconfirm title="确认取消占用吗?" onConfirm={record.changeStatus.bind(this, record.id, true)}>
        <a href="#">取消占用</a>
      </Popconfirm>
    }
    if(USER.id == record.userId) {
      node =
        <span>
          <Link to={"/device/edit/" + record.id}>修改</Link>
          <span className="ant-divider" />
            {USER.role.id == 5 && USER.id == record.userId?
              <Popconfirm title="确认删除吗?" onConfirm={record.remove.bind(this, record.id)}>
                <a href="#">删除</a>
              </Popconfirm>
              :
              <Popconfirm title="你确认要删除并锁定该设备吗？" onConfirm={record.reset.bind(this, record.id)}>
                <a href="#">删除</a>
              </Popconfirm>
            }
          <span>
            <span className="ant-divider" />
            {action}
          </span>
        </span>
    }
    return node;
  },
}];

const steps = [{
  title: '填写运营商账号',
}, {
  title: '验证运营商信息',
}, {
  title: '完成',
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
      lockButton: false,

    };
    this.remove = this.remove.bind(this);
    this.reset = this.reset.bind(this);
    this.changeStatus = this.changeStatus.bind(this);

  }
  componentWillMount() {
    let pager = { page: this.state.page, perPage: this.state.perPage,serialNumber:this.state.serialNumber,userQuery:this.state.userQuery};
    // 拉取设备详情
    this.loading = true;
    const query = this.props.location.query;
    if(!_.isEmpty(query)) {
      const serialNumber = query.serialNumber;
      const userQuery = query.userQuery;
      const page = +query.page || 1;
      const perPage = +query.perPage || 10;
      pager.serialNumber = serialNumber;
      pager.userQuery = userQuery;
      pager.page = page;
      pager.perPage = perPage;
      this.setState({
        serialNumber: serialNumber,
        userQuery: userQuery,
        page: page,
        perPage: perPage,
      })
    }
    this.props.getDeviceList(pager);
    this.setSearchValues(pager);
  }
  componentWillReceiveProps(nextProps) {
    const self = this;
    // 成功才拉取,失败就提示
    const pager = { page : this.state.page, perPage: this.state.perPage,serialNumber:this.state.serialNumber,userQuery:this.state.userQuery};
    if(this.theStatus !== -1) {
      const status = nextProps.status;
      if(status && self.theStatus !== -1 && self.theStatus !== undefined){
        if(status.fetch == true){
          this.props.getDeviceList(pager);
          this.setSearchValues(pager);
          message.success('操作成功!',3);
        } else {
          message.error(nextProps.status.result.msg, 3);
          console.log(nextProps.status.result.msg);
        }
        self.theStatus = -1;
      }
    }
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
          message.success('删除成功',3);
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
        const pager = { page : +current, perPage: +pageSize, serialNumber:self.state.serialNumber,userQuery:self.state.userQuery};
        self.setState(pager);
        self.loading = true;
        self.props.getDeviceList(pager);
        self.setSearchValues(pager);
      },
      onChange(current) {
        const pager = { page : +current, perPage: +self.state.perPage,serialNumber:self.state.serialNumber,userQuery:self.state.userQuery};
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
      // userAccount:'',
    });
  }
  resetHashHistory() {
    this.props.location.query.serialNumber = "";
    hashHistory.replace(this.props.location);
    this.setState({serialNumber:""})
  }
  resetList() {
    const pager = { page: this.state.page, perPage: this.state.perPage,serialNumber:this.state.serialNumber,userQuery:this.state.userQuery};
    this.setState({selectedRowKeys:[]});
    this.props.getDeviceList(pager);
    this.setSearchValues(pager);
  }
  rowClassName(record, index) {
    // 改变表格颜色
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
    const pager = {
      page: 1,
      perPage: this.state.perPage,
      serialNumber:serialNumber,
      userQuery:''
    };
    this.setState({
      page:1,
      userQuery:''
    });
    this.refs.searchUserInput.refs.input.value=''
    // 重置 URL 参数
    this.props.location.query.serialNumber = this.state.serialNumber;
    this.props.location.query.userQuery = '';
    hashHistory.replace(this.props.location);
    // 拉取设备详情
    this.props.getDeviceList(pager);
    this.setSearchValues(pager);
    this.loading = true;
  }
  handleUserSearch(){
    const userQuery = this.state.userQuery.replace(/[\r\n\s]/g,"");
    const pager = {
      page: 1,
      perPage: this.state.perPage,
      userQuery:userQuery,
      serialNumber:''
    };
    this.setState({
      page:1,
      serialNumber:''
    });
    this.refs.searchSerialInput.refs.input.value=''
    // 重置 URL 参数
    this.props.location.query.userQuery = this.state.userQuery;
    this.props.location.query.serialNumber = '';
    hashHistory.replace(this.props.location);
    // 拉取设备详情
    this.props.getDeviceList(pager);
    this.setSearchValues(pager);
    this.loading = true;
  }
  setSearchValues(items) {
    this.props.location.query = items;
    hashHistory.replace(this.props.location);
  }
  render() {
    const query = this.props.location.query;
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
        // console.log('onChange',selectedRows,selectedRowKeys);
      },
      onSelect: (record, selected, selectedRows) => {
        // record 当前被操作的行,selected 是否选中当前被操作的行,selectedRows 所有被选中的行
        // console.log('onSelect',record,selected,selectedRows);
      },
      getCheckboxProps: record => ({
        disabled: record.hasAssigned,
      }),
    };
    const list = this.props.list;
    let dataSource = [];
    if(list) {
      if(list.fetch == true){
        const data = list.result.data.list;
        self.dataLen = data.length;
        let rowColor = {};
        dataSource = data.map(function (item, key) {
          rowColor[item.serialNumber] = item.hasAssigned?'lock':'';
          self.rowColor = rowColor;
          item.key = item.serialNumber;
          item.statusCode = item.status;
          item.remove = self.remove;
          item.reset = self.reset;
          item.changeStatus = self.changeStatus;
          return item;
        })
      }
    }
    return (
      <section className="view-device-list">
        <header>
          <Breadcrumb>
            <Breadcrumb.Item><Link to="/user">运营商管理</Link></Breadcrumb.Item>
            <Breadcrumb.Item>设备管理</Breadcrumb.Item>
          </Breadcrumb>
        </header>
        <div className="toolbar">
          <Button onClick={this.handleAllocate.bind(this)} type="primary">批量分配</Button>
          {USER.role.id == 5 ?
            <Link to="/device/edit" className="ant-btn ant-btn-primary item">
              添加新设备
            </Link>:""
          }
          <div className="search">
            <div className="serial search-input">
              <Input ref="searchSerialInput" onChange={this.handleSerialNumberChange.bind(this)} addonBefore="设备编号:" defaultValue={serialNumber} placeholder="请输入设备编号"/>
            </div>
            <Button className="item" onClick={this.handleSearch.bind(this)} type="primary">筛选</Button>
            <div className="user search-input">
              <Input ref="searchUserInput" onChange={this.handleUserChange.bind(this)} addonBefore="账户或用户名:" defaultValue={userQuery} placeholder="请输入用户账户或用户名"/>
            </div>
            <Button className="item" onClick={this.handleUserSearch.bind(this)} type="primary">筛选</Button>
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
