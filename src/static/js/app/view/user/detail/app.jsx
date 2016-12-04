import React from 'react';
// import './app.less';
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
}, {
  title: '联系人',
  dataIndex: 'contact',
  key: 'contact',
  className: 'table-col',
  width:100,
}, {
  title: '登录账号',
  dataIndex: 'account',
  key: 'account',
  width:120,
}, {
  title: '地址',
  dataIndex: 'address',
  key: 'address',
  className: 'table-col',
  width:200,
}, {
  title: '模块数量',
  dataIndex: 'deviceTotal',
  key: 'deviceTotal',
  width:60,
  render: (deviceTotal) => {
    return deviceTotal || '0';
  }
}, {
  title: '操作',
  dataIndex: 'action',
  key: 'action',
  width: 120,
  // fixed: 'right',
  render: (text, record) => (
    <div>
      <p><Link to={'/user/edit/' + record.id}>修改</Link></p>
    </div>
  ),
}];

class AgentTable extends React.Component {
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
    // 原设备管理
    // <Link to={"/user/"+ USER.id +"/device/list"} className="ant-btn ant-btn-primary item">
    //   设备管理
    // </Link>
    return (
      <section className="view-user-detail">
        <header>
            <Breadcrumb>
              <Breadcrumb.Item>运营商管理</Breadcrumb.Item>
            </Breadcrumb>
        </header>
        <div className="toolbar">
          <Link to={"/user/" + USER.id} className="ant-btn ant-btn-primary item">
            下级运营商
          </Link>
          {USER.role.id == 1?"":
            <Link to={"/device"} className="ant-btn ant-btn-primary item">
              设备管理
            </Link>
          }
        </div>
        <article>
          <Table
            scroll={{ x: 700 }}
            columns={columns}
            rowKey={record => record.key}
            dataSource={dataSource}
            pagination={false}
            loading={this.loading ? this.loading : false}
            bordered
          />
        </article>
      </section>
    );
  }
}


AgentTable.propTypes = {
  handleTableChange: React.PropTypes.func,
};

export default connect(mapStateToProps, mapDispatchToProps)(AgentTable);
