import React from 'react';
import { Table, Button, Breadcrumb, Popconfirm, message,Modal,Steps,Input,Icon} from 'antd';
import { Link } from 'react-router';
const Step = Steps.Step;
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as DeviceActions from '../../../actions/device';
import * as UserActions from '../../../actions/user';
import UserService from "../../../service/user";
import DeviceService from "../../../service/device";
import './app.less';
import moment from 'moment';

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

const columns = [{
  title: '序号',
  dataIndex: 'id',
  key: 'id',
  width:50,
}, {
  title: '编号/楼道信息',
  dataIndex: 'serialNumber',
  key: 'serialNumber',
  width:120,
  render: (serialNumber,record) => {
    return <span>{serialNumber}{record.address?' / '+record.address:''}</span>;
  }
},
//   {
//   title: '楼道信息',
//   dataIndex: 'address',
//   key: 'address',
// },
  {
    title: '所属运营商',
    dataIndex: 'userName',
    key: 'userName',
    width:60,
  },{
  title: '关联设备类型',
  dataIndex: 'referenceDevice',
  key: 'referenceDevice',
    width:40,
}, {
    title: '添加时间',
    dataIndex: 'assignedAt',
    key: 'assignedAt',
    width:100,
    render: (assignedAt) => {
      return assignedAt?moment(assignedAt).format('YYYY-MM-DD HH:mm:ss'):''
    }
  }, {
    title: '是否为返厂设备',
    dataIndex: 'hasRetrofited',
    key: 'hasRetrofited',
    width:20,
    render: (hasRetrofited) => {
      // 这里如果是普通运营商则不需要展示
      return hasRetrofited?'是':'否';
    }
  }, {
  title: '状态',
  dataIndex: 'status',
  key: 'status',
    width:20,
}, {
  title: '单脱',
  dataIndex: 'firstPulsePrice',
  key: 'firstPulsePrice',
    width:50,
    render: (firstPulsePrice) => {
      return firstPulsePrice/100;
    }
}, {
  title: '快洗',
  dataIndex: 'secondPulsePrice',
  key: 'secondPulsePrice',
    width:50,
    render: (secondPulsePrice) => {
      return secondPulsePrice/100;
    }
}, {
  title: '标准洗',
  dataIndex: 'thirdPulsePrice',
  key: 'thirdPulsePrice',
    width:50,
    render: (thirdPulsePrice) => {
      return thirdPulsePrice/100;
    }
}, {
  title: '大物洗',
  dataIndex: 'fourthPulsePrice',
  key: 'fourthPulsePrice',
    width:50,
    render: (fourthPulsePrice) => {
      return fourthPulsePrice/100;
    }
}, {
  title: '操作',
  dataIndex: 'action',
  key: 'action',
  width: 150,
  // fixed: 'right',
  render: (text, record) => (
    <span>
      <Link to={"/device/edit/" + record.id}>修改</Link>
      <span className="ant-divider" />
      {USER.role.id == 5 && USER.id == record.userId?
          <Popconfirm title="确认删除吗?" onConfirm={record.remove.bind(this, record.id)}>
            <a href="#">删除</a>
          </Popconfirm>
        :
        <Popconfirm title="你确认要删除并锁定该设备吗？" onConfirm={record.remove.bind(this, record.id)}>
          <a href="#">删除</a>
        </Popconfirm>
      }

      <span className="ant-divider" />
      {record.statusCode == 9 ?
        <Popconfirm title="确认启用吗?" onConfirm={record.changeStatus.bind(this, record.id, true)}>
          <a href="#">启用</a>
        </Popconfirm>
        :
        <Popconfirm title="确认锁定吗?" onConfirm={record.changeStatus.bind(this, record.id, false)}>
          <a href="#">锁定</a>
        </Popconfirm>
      }
    </span>
  ),
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
      current: 0,
      userAccount:'',
      userInfo:{
        account:'',
        mobile:'',
        name:'',
        contact:'',
      },// 获取的用户信息
      bindResult:'',//绑定结果反馈
      selectList:[],
      selectedRowKeys:[],
    };
    this.remove = this.remove.bind(this);
    this.changeStatus = this.changeStatus.bind(this);

  }
  componentWillMount() {
    const pager = { page: this.state.page, perPage: this.state.perPage };
    // 拉取设备详情
    this.props.getDeviceList(pager);
    this.loading = true;
  }
  componentWillReceiveProps(nextProps) {
    const self = this;
    // 成功才拉取,失败就提示
    const pager = { page : this.state.page, perPage: this.state.perPage};
    if(this.theStatus !== -1) {
      const status = nextProps.status;
      if(status && self.theStatus !== -1 && self.theStatus !== undefined){
        if(status.fetch == true){
          this.props.getDeviceList(pager);
          message.success('操作成功!',3);
        } else {
          message.error('操作失败!',3);
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
          self.loading = true;
          message.success('重置设备归属人成功!',3);
        } else {
          message.error(resultReset.result.msg,3);
        }
        self.removeDevice = -1;
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
      onShowSizeChange(current, pageSize) {
        const pager = { page : current, perPage: pageSize};
        self.setState(pager);
        self.loading = true;
        self.props.getDeviceList(pager);
      },
      onChange(current) {
        const pager = { page : current, perPage: self.state.perPage};
        self.setState(pager);
        self.loading = true;
        self.props.getDeviceList(pager);
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
    if(this.state.selectList.length > 0) {
      this.showModal();
    } else {
      message.info('请至少选择一个设备',3);
    }
  }
  showModal() {
    this.setState({
      visible: true,
    });
  }
  handleOk() {
    console.log('Clicked OK');
    this.setState({
      visible: false,
    });
  }
  handleCancel(e) {
    console.log(e);
    this.setState({
      visible: false,
      userAccount:'',
      current:0,
    });
  }
  detail(account) {
    var self = this;
    UserService.detailByAccount(account)
      .then((data) => {
        // const userInfo = `${data.name}| ${data.contact}|${data.mobile}`;
        const current = this.state.current + 1;
        this.setState({
          current,
          userInfo:data.data
        });
        message.success(data.msg,3);
      },(error)=>{
        message.error(error.msg,3);
      })
  }
  deviceAssign(data) {
    var self = this;
    DeviceService.deviceAssign(data)
      .then((data) => {
        const current = this.state.current + 1;
        this.setState({
          current,
          bindResult:'绑定成功'
        });
        message.success(data.msg,3);
      },(error)=>{
        message.error(error.msg,3);
      })
  }
  next() {
    if(this.state.current == 0) {
      // 第一步,提交账号信息,确认是否存在该用户
      console.log('提交账号信息,检查是否存在');
      // 回调时调用
      if(this.state.userAccount) {
        const account = this.state.userAccount.replace(/[\r\n\s]/g,"");
        this.detail(account);
      } else {
        message.info('请填写账号信息',3);
      }
    } else if(this.state.current == 1) {
      // 第二步,如果账号信息存在,则提交账号信息和设备编号,否则不能进入到下一步
      const serialNumbers = this.state.selectList.join(",");
      const { account }= this.state.userInfo;
      console.log(this.state.userInfo);
      const data = {
        userAccount: account,
        serialNumbers: serialNumbers
      }
      this.deviceAssign(data);
    }

  }
  prev() {
    const current = this.state.current - 1;
    this.setState({ current });
  }
  getUserAccount(e) {
    this.setState({userAccount:e.target.value})
  }
  comAllocate() {
    // 完成绑定,也有可能绑定失败,关闭 modal,重置提交栏
    this.handleCancel();
  }
  render() {
    const self = this;
    const { current } = this.state;
    this.pagination = this.initializePagination();
    // 勾选项,需要限制只能勾选自己的设备
    const selectedRowKeys = this.state.selectedRowKeys;
    const rowSelection = {
      selectedRowKeys: selectedRowKeys,
      onChange: (selectedRowKeys, selectedRows) => {
        // const selectList = selectedRows.filter(function (item,key) {
        //   return item.hasAssigned == 0;
        // }).map(function (item,key) {
        //   return item.serialNumber;
        // });
        let newSelectedRows = [];
        let newSelectedRowKeys = [];
        for(var i=0; i<selectedRows.length; i++){
          let hasAssigned = selectedRows[i].hasAssigned;
          if(!hasAssigned){
            newSelectedRows.push(selectedRows[i]);
            newSelectedRowKeys.push(selectedRows[i].id);
          }
        }
        this.setState({
          selectList:newSelectedRows,
          selectedRowKeys:newSelectedRowKeys,
        });
        // console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
      },
      onSelect: (record, selected, selectedRows) => {
        // console.log(record, selected, selectedRows);
      },
      onSelectAll: (selected, selectedRows, changeRows) => {
        // console.log(selected, selectedRows, changeRows);
      },
    };
    
    const list = this.props.list;
    let dataSource = [];
    if(list) {
      if(list.fetch == true){
        const data = list.result.data.list;
        self.dataLen = data.length;
        dataSource = data.map(function (item, key) {
          let referenceDevice = '';
          switch (item.referenceDeviceId){
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
              referenceDevice = '洗衣机';
          }
          let status = '';
          switch (item.status) {
            case 0:
              status = '启用';
              break;
            case 9:
              status = '锁定';
              break;
            default:
              status = '启用';
          }
          item.key = item.id;
          item.referenceDevice = referenceDevice;
          item.statusCode = item.status;
          item.status = status;
          item.remove = self.remove;
          item.changeStatus = self.changeStatus;
          return item;
        })
      }
    }
    let show = '';
    const userInfo = this.state.userInfo;
    // console.log(userInfo);
    if (this.state.current == 0){
      show = <div>
        <p className="device-tips">您已选择{this.state.selectList.length}个设备进行分配,请输入被分配运营商的登陆账号</p>
        <Input type="text" style={{width:200}} value={this.state.userAccount}  onChange={this.getUserAccount.bind(this)}/>
      </div>
    } else if(this.state.current == 1){
      show = <div>你将把设备分配给：{userInfo.name}|{userInfo.contact}|{userInfo.mobile}，是否继续？</div>
    } else if(this.state.current == 2){
      show = <p><Icon type="check-circle" />{this.state.bindResult}</p>
    };
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
        </div>
        <article>
          <Table
            scroll={{ x: 760 }}
            columns={columns}
            dataSource={dataSource}
            pagination={this.pagination}
            loading={this.loading}
            onChange={this.handleTableChange}
            rowSelection={rowSelection}
            bordered
            />
          <Modal title="批量分配" visible={this.state.visible}
                 wrapClassName="allocateModal"
                 onOk={this.handleOk.bind(this)} onCancel={this.handleCancel.bind(this)}
          >
            <Steps current={current}>
              {steps.map(item => <Step key={item.title} title={item.title} />)}
            </Steps>
            <div className="steps-content">
              {show}
            </div>
            <div className="steps-action">
              {this.state.current < steps.length - 1 &&
                <Button type="primary" onClick={() => this.next()}>下一步</Button>
              }
              {this.state.current === steps.length - 1 &&
                <Button type="primary" onClick={this.comAllocate.bind(this)}>完成</Button>
              }
              {this.state.current == 1 &&
                <Button style={{ marginLeft: 8 }} type="ghost" onClick={() => this.prev()}>
                  上一步
                </Button>
              }
            </div>
          </Modal>
        </article>
      </section>
    );
  }
}


DeviceList.propTypes = {
  handleTableChange: React.PropTypes.func,
};

export default connect(mapStateToProps, mapDispatchToProps)(DeviceList);
