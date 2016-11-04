import React from 'react';
import { Table, Button, Breadcrumb, Popconfirm, message} from 'antd';
import { Link } from 'react-router';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as DeviceActions from '../../../actions/device';
import * as UserActions from '../../../actions/user';

function mapStateToProps(state) {
  const { device: { list, status, resultRemove }, user: {schoolDevice} } = state;
  return { list, status, resultRemove, schoolDevice };
}

function mapDispatchToProps(dispatch) {
  const {
    getDeviceList,
    deleteDevice,
    patchDeviceStatus,
  } = bindActionCreators(DeviceActions, dispatch);
  const {
    getSchoolDevice,
  } = bindActionCreators(UserActions, dispatch);
  return {
    getDeviceList,
    deleteDevice,
    patchDeviceStatus,
    getSchoolDevice,
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
  render: (text, record) => (
    <span>
      <Link to={"/device/edit/" + record.key}>修改</Link>
      <span className="ant-divider" />
      <Popconfirm title="确认删除吗?" onConfirm={record.remove.bind(this, record.key)}>
        <a href="#">删除</a>
      </Popconfirm>
      <span className="ant-divider" />
      {record.statusCode == 9 ?
        <Popconfirm title="确认启用吗?" onConfirm={record.changeStatus.bind(this, record.key, true)}>
          <a href="#">启用</a>
        </Popconfirm>
        :
        <Popconfirm title="确认停止吗?" onConfirm={record.changeStatus.bind(this, record.key, false)}>
          <a href="#">停止</a>
        </Popconfirm>
      }
    </span>
  ),
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
    };
    this.remove = this.remove.bind(this);
    this.changeStatus = this.changeStatus.bind(this);

  }
  componentWillMount() {
    const pager = { page: this.state.page, perPage: this.state.perPage };
    this.props.getDeviceList(pager);
    this.loading = true;
  }
  componentWillReceiveProps(nextProps) {
    const self = this;
    // 成功才拉取,失败就提示
    const pager = { page : this.state.page, perPage: this.state.perPage};
    if(this.theStatus !== -1) {
      const status = nextProps.status;
      console.log('status',nextProps.status);
      if(status){
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
    if(this.removeDevice !== -1) {
      const remove = nextProps.resultRemove;
      if(remove){
        if(remove.fetch == true){
          this.props.getDeviceList(pager);
          self.loading = true;
          message.success('删除成功!',3);
        } else {
          message.error('删除失败!',3);
          console.log(nextProps.status.result.msg);
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
    const self = this;
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
              status = '停止';
              break;
            default:
              status = '启用';
          }
          return {
            key: item.id,
            index: key,
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
          <Breadcrumb>
            <Breadcrumb.Item>设备管理</Breadcrumb.Item>
          </Breadcrumb>
        </header>
        <div className="toolbar">
          <Link to="/device/edit" className="ant-btn ant-btn-primary item">
            添加新设备
          </Link>
        </div>
        <article>
          <Table columns={columns}
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


DeviceList.propTypes = {
  handleTableChange: React.PropTypes.func,
};

export default connect(mapStateToProps, mapDispatchToProps)(DeviceList);
