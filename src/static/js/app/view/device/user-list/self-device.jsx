import React from 'react';
import { Table, Button,Input, Breadcrumb } from 'antd';
import { Link } from 'react-router';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as UserActions from '../../../actions/user';


function mapStateToProps(state) {
  const { user: { list, detail, detailTotal } } = state;
  return { list, detail, detailTotal };
}

function mapDispatchToProps(dispatch) {
  const {
    getUserList,
    getDetailTotal,
  } = bindActionCreators(UserActions, dispatch);
  return {
    getUserList,
    getDetailTotal,
  };
}

const columns = [{
  title: '用户编号',
  dataIndex: 'id',
  key: 'id',
  width: 50,
}, {
  title: '运营商名称',
  dataIndex: 'name',
  key: 'name',
  width: 100,
  className: 'table-col',
},   {
  title: '模块数量',
  dataIndex: 'deviceTotal',
  key: 'deviceTotal',
  width:60,
  render: (deviceTotal,record) => {
    const node = deviceTotal?<Link to={"/device/user/"+ record.key +"/list"} >
      {deviceTotal}
    </Link>:'0';
    return node;
  }
}, {
  title: '联系人',
  dataIndex: 'contact',
  key: 'contact',
  className: 'table-col',
  width:100,
},{
  title: '登录账号',
  dataIndex: 'account',
  key: 'account',
  width:120,
},{
  title: '操作',
  dataIndex: 'action',
  key: 'action',
  width: 120,
  render(text, record, index) {
    // 用户 ID 为 key
    // 此处需要确认用户 id 应该是路由必填项,
    // 或者在设备列表页设置如果无设备 id,则默认用户自己 id
    const node = USER.role.id == 5?
      <Link to={"/device/list"}>
        设备管理
      </Link>:
      <Link to={"/device/user/"+ record.key +"/list"}>
         设备管理
       </Link>
    return node;

  },
}];

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  componentWillMount() {
    this.loading = true;
    this.props.getDetailTotal(USER.id);
  }
  render() {
    const { detailTotal}  = this.props;
    let dataSource = [];
    const self = this;
    if(detailTotal) {
      if(detailTotal.fetch == true) {
        const data = detailTotal.result.data;
        data.key = data.id;
        data.showAction = true;
        dataSource = [data];
      }
      self.loading = false;
    }
    return (
      <Table
        scroll={{ x: 700 }}
        columns={columns}
        rowKey={record => record.key}
        dataSource={dataSource}
        pagination={false}
        loading={this.loading ? this.loading : false}
        bordered
      />
    );
  }
}


App.propTypes = {
  handleTableChange: React.PropTypes.func,
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
