import React from 'react';
import '../device_list/app.less';
import { Table, Button, Breadcrumb, Popconfirm, message } from 'antd';
import { Link } from 'react-router';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as DeviceActions from '../../../actions/device';
import * as UserActions from '../../../actions/user';
import * as SchoolActions from '../../../actions/school';

function mapStateToProps(state) {
  const { device: { list, status, resultReset }, user: {schoolDevice}, school:{schoolDetail} } = state;
  return { list, status, resultReset, schoolDevice, schoolDetail };
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
    getSchoolDetail,
  };
}

const columns = [{
  title: 'ID',
  dataIndex: 'key',
  key: 'index',
}, {
  title: '编号',
  dataIndex: 'serialNumber',
  key: 'serialNumber',
}, {
  title: '关联设备类型',
  dataIndex: 'referenceDevice',
  key: 'referenceDevice',
}, {
  title: '状态',
  dataIndex: 'status',
  key: 'status',
}, {
  title: '楼道信息',
  dataIndex: 'address',
  key: 'address',
}, {
  title: '单脱',
  dataIndex: 'firstPulsePrice',
  key: 'firstPulsePrice',
}, {
  title: '快洗',
  dataIndex: 'secondPulsePrice',
  key: 'secondPulsePrice',
}, {
  title: '标准洗',
  dataIndex: 'thirdPulsePrice',
  key: 'thirdPulsePrice',
}, {
  title: '大物洗',
  dataIndex: 'fourthPulsePrice',
  key: 'fourthPulsePrice',
}, {
  title: '操作',
  dataIndex: 'action',
  key: 'action',
  width: 100,
  fixed: 'right',
  render: (text, record) => (
    <div>
      <p><Link to={"/user/device/school/"+record.schoolId+"/edit/" + record.key}>修改</Link></p>
      <Popconfirm title="确认删除吗?" onConfirm={record.remove.bind(this, record.key)}>
        <p><a href="#">删除</a></p>
      </Popconfirm>
      {record.statusCode == 9 ?
        <Popconfirm title="确认启用吗?" onConfirm={record.changeStatus.bind(this, record.key, true)}>
          <p><a href="#">启用</a></p>
        </Popconfirm>
        :
        <Popconfirm title="确认锁定吗?" onConfirm={record.changeStatus.bind(this, record.key, false)}>
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
    };
    this.remove = this.remove.bind(this);
    this.changeStatus = this.changeStatus.bind(this);

  }
  componentDidMount() {
    const schoolId = this.props.params.id;
    const pager = { page: this.state.page, perPage: this.state.perPage };
    this.props.getSchoolDevice(USER.id, schoolId, pager);
    this.loading = true;
    if(schoolId >= 0) {
      this.props.getSchoolDetail(schoolId);
    }
  }
  componentWillReceiveProps(nextProps) {
    const self = this;
    // 成功才拉取,失败就提示
    const schoolId = this.props.params.id;
    const pager = { page : this.state.page, perPage: this.state.perPage};
    if(this.theStatus !== -1 && this.theStatus !== undefined) {
      const status = nextProps.status;
      if(status && self.theStatus !== -1 && self.theStatus !== undefined){
        if(status.fetch == true) {
          this.props.getSchoolDevice(USER.id, schoolId, pager);
          self.loading = true;
          message.success('修改成功!',3);
        } else {
          message.error('修改失败!',3);
          console.log(nextProps.status.result.msg);
        }
        self.theStatus = -1;
      }
    }
    if(this.reset !== -1 && this.reset !== undefined) {
      const reset = nextProps.resultReset;
      if(reset) {
        if(reset.fetch == true) {
          this.props.getSchoolDevice(USER.id, schoolId, pager);
          self.loading = true;
          message.success('删除成功!',3);
        } else {
          message.error('删除失败!',3);
          console.log(nextProps.status.result.msg);
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
    const schoolId = this.props.params.id;
    return {
      total: total,
      showSizeChanger: true,
      size:'small',
      onShowSizeChange(current, pageSize) {
        const pager = { page : current, perPage: pageSize};
        self.setState(pager);
        self.loading = true;
        self.props.getSchoolDevice(USER.id, schoolId, pager);
      },
      onChange(current) {
        const pager = { page : current, perPage: self.state.perPage};
        self.setState(pager);
        self.loading = true;
        self.props.getSchoolDevice(USER.id, schoolId, pager);
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
  render() {
    this.pagination = this.initializePagination();
    const schoolDevice = this.props.schoolDevice;
    const schoolDetail = this.props.schoolDetail;
    let schoolName = '';
    if(schoolDetail && schoolDetail.fetch == true){
      schoolName = schoolDetail.result.data.name;
    }
    const schoolId = this.props.params.id;
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
              status = '启用';
              break;
            case 9:
              status = '锁定';
              break;
            default:
              status = '启用';
          }
          return {
            key: item.id,
            index: key,
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
    return (
      <section className="view-user-list">
        <header>
          <Breadcrumb >
            <Breadcrumb.Item><Link to="/user">运营商管理</Link></Breadcrumb.Item>
            <Breadcrumb.Item><Link to="/user/device/list">设备管理</Link></Breadcrumb.Item>
            <Breadcrumb.Item>{schoolName}</Breadcrumb.Item>
          </Breadcrumb>
        </header>
        <article>
          <Table
            scroll={{ x: 980 }}
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
