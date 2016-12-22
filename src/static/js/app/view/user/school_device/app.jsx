import React from 'react';
import '../../device/school_filter_list/app.less';
import { Table,Input, Button, Breadcrumb, Popconfirm, message } from 'antd';
import { Link } from 'react-router';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as DeviceActions from '../../../actions/device';
import * as UserActions from '../../../actions/user';
import * as SchoolActions from '../../../actions/school';

function mapStateToProps(state) {
  const { device: { list, status, resultReset }, user: {schoolDevice, detail}, school:{schoolDetail} } = state;
  return { list, status, resultReset, schoolDevice, detail, schoolDetail };
}

function mapDispatchToProps(dispatch) {
  const {
    getDeviceList,
    deleteDevice,
    patchDeviceStatus,
    resetDevice,
  } = bindActionCreators(DeviceActions, dispatch);
  const {
    getSchoolDevice,
    getUserDetail
  } = bindActionCreators(UserActions, dispatch);
  const {
    getSchoolDetail,
  } = bindActionCreators(SchoolActions, dispatch);
  return {
    getDeviceList,
    deleteDevice,
    patchDeviceStatus,
    resetDevice,
    getSchoolDevice,
    getUserDetail,
    getSchoolDetail,
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
  title: '关联设备类型',
  dataIndex: 'referenceDevice',
  key: 'referenceDevice',
    width:40,
}, {
  title: '状态',
  dataIndex: 'status',
  key: 'status',
    width:20,
},  {
  title: '单脱',
  dataIndex: 'firstPulsePrice',
  key: 'firstPulsePrice',
    width:50,
}, {
  title: '快洗',
  dataIndex: 'secondPulsePrice',
  key: 'secondPulsePrice',
    width:50,
}, {
  title: '标准洗',
  dataIndex: 'thirdPulsePrice',
  key: 'thirdPulsePrice',
    width:50,
}, {
  title: '大物洗',
  dataIndex: 'fourthPulsePrice',
  key: 'fourthPulsePrice',
    width:50,
}, {
  title: '操作',
  dataIndex: 'action',
  key: 'action',
  width: 60,
  render: (text, record) => (
    <div>
      <p><Link to={"/user/"+record.userId+"/device/school/"+record.schoolId+"/edit/" + record.id}>修改</Link></p>
      <Popconfirm title="确认删除吗?" onConfirm={record.remove.bind(this, record.id)}>
        <p><a href="#">删除</a></p>
      </Popconfirm>
      {record.statusCode == 9 ?
        <Popconfirm title="确认解除占用吗?" onConfirm={record.changeStatus.bind(this, record.id, true)}>
          <p><a href="#">解除占用</a></p>
        </Popconfirm>
        :
        <Popconfirm title="确认锁定吗?" onConfirm={record.changeStatus.bind(this, record.id, false)}>
          <p><a href="#">锁定</a></p>
        </Popconfirm>
      }
    </div>
  ),
}];


class DeviceTable extends React.Component {
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
      searchValue: '',
    };
    this.remove = this.remove.bind(this);
    this.changeStatus = this.changeStatus.bind(this);

  }
  componentDidMount() {
    const {id, schoolId} = this.props.params;
    const pager = { page: this.state.page, perPage: this.state.perPage };

    // this.props.getSchoolDevice(USER.id, schoolId, pager);
    this.props.getSchoolDevice(id, schoolId, pager);
    this.props.getUserDetail(id);
    this.loading = true;
    if(schoolId >= 0) {
      this.props.getSchoolDetail(schoolId);
    }
  }
  componentWillReceiveProps(nextProps) {
    const self = this;
    // 成功才拉取,失败就提示
    const { id, schoolId }= this.props.params;
    const pager = { page : this.state.page, perPage: this.state.perPage};
    if(this.theStatus !== -1 && this.theStatus !== undefined) {
      const status = nextProps.status;
      if(status && self.theStatus !== -1 && self.theStatus !== undefined){
        if(status.fetch == true) {
          // this.props.getSchoolDevice(USER.id, schoolId, pager);
          this.props.getSchoolDevice(id, schoolId, pager);
          self.loading = true;
          message.success('修改成功!',3);
        } else {
          message.error(nextProps.status.result.msg,3);
          // console.log(nextProps.status.result.msg);
        }
        self.theStatus = -1;
      }
    }
    if(this.reset !== -1 && this.reset !== undefined) {
      const reset = nextProps.resultReset;
      if(reset) {
        if(reset.fetch == true) {
          // this.props.getSchoolDevice(USER.id, schoolId, pager);
          this.props.getSchoolDevice(id, schoolId, pager);
          self.loading = true;
          message.success('删除成功!',3);
        } else {
          message.error(nextProps.status.result.msg,3);
          // console.log(nextProps.status.result.msg);
        }
        self.reset = -1;
      }
    }
    if(this.props.schoolDevice !== nextProps.schoolDevice) {
      self.loading = false;
    }

  }
  initializePagination() {
    let total = 1;
    if (this.props.schoolDevice && this.props.schoolDevice.fetch == true) {
      total = this.props.schoolDevice.result.data.total;
    }
    const self = this;
    const {id, schoolId }= this.props.params;
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
        // self.props.getSchoolDevice(USER.id, schoolId, pager);
        self.props.getSchoolDevice(id, schoolId, pager);
      },
      onChange(current) {
        const pager = { page : current, perPage: self.state.perPage};
        self.setState(pager);
        self.loading = true;
        // self.props.getSchoolDevice(USER.id, schoolId, pager);
        self.props.getSchoolDevice(id, schoolId, pager);

      },
    }
  }
  remove(id) {
    this.props.resetDevice(id);
    this.reset = 1;
    const { page } = this.state;
    if(this.dataLen == 1) {
      if(page > 1){
        this.pagination.onChange(page-1);
      }
    }
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
  handleInputChange(e) {
    this.setState({
      searchValue: e.target.value,
    });
  }
  handleSearch() {
    let device = this.state.searchValue;
    const pager = {page: 1, perPage: this.state.perPage};
    this.setState({page:1});
    if(device) {
      const splitted = device.split("\n");
      const numbers = this.removeNull(this.removeDuplicates(splitted));
      device = numbers.join(",");
    }
    const { id,schoolId }  = this.props.params;
    // this.props.getSchoolDevice(USER.id, schoolId, pager, device);
    this.props.getSchoolDevice(id, schoolId, pager, device);
    // this.list(account, pager);
  }
  removeDuplicates(arr) {
    var obj = {};
    var ret_arr = [];
    for (var i = 0; i < arr.length; i++) {
      obj[arr[i]] = true;
    }
    for (var key in obj) {
      ret_arr.push(key);
    }
    return ret_arr;
  }
  removeNull(arr){
    var pattern=new RegExp(/^\s*$/);
    for(var i = 0 ;i<arr.length;i++) {
      if(arr[i] == "" || typeof(arr[i]) == "undefined"
        || pattern.test(arr[i])) {
        arr.splice(i,1);
        i= i-1;
      }
    }
    return arr;
  }
  render() {
    let userName = '';
    if(this.props.detail && this.props.detail.fetch == true) {
      userName = this.props.detail.result.data.name;
    }
    this.pagination = this.initializePagination();
    this.pagination.current = this.state.page;
    const schoolDevice = this.props.schoolDevice;
    const schoolDetail = this.props.schoolDetail;
    let schoolName = '';
    if(schoolDetail && schoolDetail.fetch == true){
      schoolName = schoolDetail.result.data.name;
    }
    const { id, schoolId } = this.props.params;
    const self = this;
    let dataSource = [];
    if(schoolDevice) {
      if(schoolDevice.fetch == true){
        const data = schoolDevice.result.data.list;
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
              status = '空闲';
              break;
            case 9:
              status = '占用';
              break;
            default:
              status = '空闲';
          }
          return {
            id: item.id,
            key: item.id,
            userId: id,
            schoolId: schoolId,
            serialNumber: item.serialNumber,
            referenceDevice: referenceDevice,
            statusCode: item.status,
            status: status,
            address: item.address,
            firstPulsePrice: item.firstPulsePrice/100,
            secondPulsePrice: item.secondPulsePrice/100,
            thirdPulsePrice: item.thirdPulsePrice/100,
            fourthPulsePrice: item.fourthPulsePrice/100,
            remove: self.remove,
            changeStatus: self.changeStatus,
          }
        })
      }
    }
    // 此处设备管理需要用户 ID
    return (
      <section className="view-school-device-list">
        <header>
          {id == USER.id?
            <Breadcrumb >
              <Breadcrumb.Item><Link to="/user">运营商管理</Link></Breadcrumb.Item>
              <Breadcrumb.Item><Link to={"/user/"+id+"/device/list"}>{userName}的设备管理</Link></Breadcrumb.Item>
              <Breadcrumb.Item>{schoolName}</Breadcrumb.Item>
            </Breadcrumb>
            :
            <Breadcrumb >
              <Breadcrumb.Item><Link to="/user">运营商管理</Link></Breadcrumb.Item>
              <Breadcrumb.Item><Link to={"/user/"+USER.id}>下级运营商</Link></Breadcrumb.Item>
              <Breadcrumb.Item><Link to={"/user/"+id+"/device/list"}>{userName}的设备管理</Link></Breadcrumb.Item>
              <Breadcrumb.Item>{schoolName}</Breadcrumb.Item>
            </Breadcrumb>
          }

        </header>
        <div className="toolbar">
          <Input style={{width:160,height:32,verticalAlign:'middle'}}type="textarea" placeholder="请输入设备编号" autosize onChange={this.handleInputChange.bind(this)}/>
          <Button type="primary item" onClick={this.handleSearch.bind(this)}>查询</Button>
        </div>
        <article>
          <Table
            scroll={{ x: 500 }}
            columns={columns}
               dataSource={dataSource}
               pagination={this.pagination}
               loading={this.loading}
               onChange={this.handleTableChange}
               bordered
          />
        </article>
      </section>
    );
  }
}


DeviceTable.propTypes = {
  handleTableChange: React.PropTypes.func,
};

export default connect(mapStateToProps, mapDispatchToProps)(DeviceTable);
