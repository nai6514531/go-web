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
}, {
  title: '运营商名称',
  dataIndex: 'name',
  key: 'name',
  className: 'table-col',
}, {
  title: '联系人',
  dataIndex: 'contact',
  key: 'contact',
  className: 'table-col',
}, {
  title: '登录账号',
  dataIndex: 'account',
  key: 'account',
}, {
  title: '地址',
  dataIndex: 'address',
  key: 'address',
  className: 'table-col',
}, {
  title: '模块数量',
  dataIndex: 'deviceTotal',
  key: 'deviceTotal',
  render: (deviceTotal) => {
    return deviceTotal || '0';
  }
}, {
  title: '操作',
  dataIndex: 'action',
  key: 'action',
  width: 100,
  fixed: 'right',
  render: (text, record) => (
    <div>
      <p><Link to={'/user/edit/' + record.id}>修改</Link></p>
      {record.showAction?
        <p><Link to={'/user/' + record.id}>下级运营商</Link></p>
      :''}
      {USER.role.id == 1 ? "" :
        <p><Link to={'/user/'+record.id+'/device/list'}>设备管理</Link></p>
      }
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
    return (
      <section className="view-user-list">
        <header>
            <Breadcrumb>
              <Breadcrumb.Item>运营商管理</Breadcrumb.Item>
            </Breadcrumb>
        </header>
        <article>
          <Table
            scroll={{ x: 980 }}
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
