import React from 'react';
// import './app.less';
import { Table, Button,Input, Breadcrumb,message } from 'antd';
import { Link } from 'react-router';

import UserService from '../../../service/user';
import SodaBreadcrumb from '../../common/breadcrumb/breadcrumb.jsx'

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
  render: (text, record) => (
    <div>
      <p><Link to={'/user/edit/' + record.id}>修改</Link></p>
    </div>
  ),
}];

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      list: [],
    };
    this.detail = this.detail.bind(this);
  }
  componentWillMount() {
    this.detail(USER.id);
  }
  detail(id) {
      var self = this;
      this.setState({
        loading: true,
      });
      UserService.detail(id)
        .then((data) => {
          self.setState({
            loading: false,
          });
          let list = data.data;
          list.key = data.data.id;
          this.setState({
            list: [list]
          });
        },(error)=>{
          self.setState({
            loading: false,
          });
          message.error(error.msg,3);
        })
  }
  render() {
    const items = [
      {title:'运营商管理',url:''},
    ]
    const dataSource = this.state.list;
    return (
      <section className="view-user-detail">
        <header>
          <SodaBreadcrumb items={items}/>
        </header>
        <div className="toolbar">
          <Link to={"/user/" + USER.id} className="ant-btn ant-btn-primary item">
            下级运营商
          </Link>
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

App.propTypes = {};

export default App;
