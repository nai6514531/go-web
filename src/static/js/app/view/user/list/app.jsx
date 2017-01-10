import React from 'react';
import './app.less';
import { Table, Button,Input, message } from 'antd';
import { Link, hashHistory } from 'react-router';
const _ = require('lodash');

import UserService from '../../../service/user';
import Toolbar from './subview/toolbar.jsx';
import SodaBreadcrumb from '../../common/breadcrumb/breadcrumb.jsx'
const columns = [{
  title: '用户编号',
  dataIndex: 'id',
  width: 50,
}, {
  title: '运营商名称',
  dataIndex: 'name',
  width: 100,
  className: 'table-col',
}, {
  title: '联系人',
  dataIndex: 'contact',
  width:100,
  className: 'table-col',
}, {
  title: '登录账号',
  dataIndex: 'account',
  width:120,
}, {
  title: '地址',
  dataIndex: 'address',
  width:200,
  className: 'table-col',
}, {
  title: '模块数量',
  dataIndex: 'deviceTotal',
  width:60,
  render: (deviceTotal) => {
    return deviceTotal || '0';
  }
}, {
  title: '操作',
  dataIndex: 'action',
  width: 100,
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
      page: 1,
      perPage: 10,
      total: 1,
      searchValue: '',
      list:[],
      loading: false,
      breadItems : [
      {title:'运营商管理',url:'/user'},
      {title:'下级运营商',url:''}]
    };
    this.list = this.list.bind(this);
  }
  list(pager,searchValue) {
    this.setState({
      loading: true,
    });
    UserService.list(pager,searchValue)
      .then((data) => {
        this.setState({
          loading: false,
          total: data.data.total,
          list: data.data.list
        });
      },(error)=>{
        this.setState({
          loading: false,
        });
        message.error(error.msg,3);
      })
  }
  componentWillMount() {
    const pager = { page : this.state.page, perPage: this.state.perPage};
      // 页面刷新的时候需要按照 URL 参数加载搜索结果,有参则传参
    const query = this.props.location.query;
    if(!_.isEmpty(query)) {
      const user = query.user;
      this.setState({searchValue:user})
      this.list(pager,user);
    } else {
      this.list(pager);
    }
  }
  rowClassName(record, index) {
    return this.rowColor[record.key];
  }
  initializePagination() {
    const self = this;
    const user = this.state.searchValue.replace(/[\r\n\s]/g,"");
    return {
      total: this.state.total,
      showSizeChanger: true,
      size:'small',
      showTotal (total) {
        return <span>总计 {total} 条</span>
      },
      onShowSizeChange(current, pageSize) {
        const pager = { page : current, perPage: pageSize};
        self.setState(pager);
        self.list(pager,user);
      },
      onChange(current) {
        const pager = { page : current, perPage: self.state.perPage};
        self.setState(pager);
        self.list(pager,user);
      },
    }
  }
  handleInputChange(e) {
    this.setState({
      searchValue: e.target.value,
    });
  }
  handleSearch() {
    const user = this.state.searchValue.replace(/[\r\n\s]/g,"");
    const pager = { page: 1, perPage: this.state.perPage};
    this.setState({ page: 1 });
    // 重置 URL 参数
    this.props.location.query.user = user;
    hashHistory.replace(this.props.location);
    // 发 AJAX
    this.list(pager,user);
  }
  render() {
    const query = this.props.location.query;
    let user = '';
    if(!_.isEmpty(query)) {
      user = query.user;
    }
    const pagination = this.initializePagination();
    pagination.current = this.state.page;
    return (
      <section className="view-user-list">
        <header>
          <SodaBreadcrumb items={this.state.breadItems}/>
        </header>
        <Toolbar handleSearch={this.handleSearch.bind(this)}
                 handleInputChange={this.handleInputChange.bind(this)}
                 user={user}
        />
        <article>
          <Table
            scroll={{ x: 980 }}
            className="table"
            columns={columns}
            rowKey={record => record.id}
            dataSource={this.state.list}
            pagination={pagination}
            loading={this.state.loading}
            bordered
            rowClassName={this.rowClassName.bind(this)}
          />
        </article>
      </section>
    );
  }
}

App.propTypes = {};

export default App;
