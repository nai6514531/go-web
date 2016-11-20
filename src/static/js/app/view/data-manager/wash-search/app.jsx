import React from "react";
import {Input,Button, Table, Icon, Popconfirm,Breadcrumb, message} from "antd";
// import "./app.less";
import StatisWashService from "../../../service/wash-search";
import { Link } from 'react-router';
const _ = require('lodash');
import moment from 'moment';


const App = React.createClass({
  propTypes: {
    user_id: React.PropTypes.string,
    bill_at: React.PropTypes.string
  },
  getInitialState() {
    const self = this;
    return {
      page: 1,
      perPage: 10,
      searchValue:'',
      list:[],
      total:0,
      columns: [{
        title: 'ID',
        dataIndex: 'key',
        key: 'key',
      }, {
        title: '代理商',
        dataIndex: 'user',
        key: 'user',
      }, {
        title: '服务电话',
        dataIndex: 'telephone',
        key: 'telephone',
      }, {
        title: '设备编号',
        dataIndex: 'serialNumber',
        key: 'serialNumber',
      },{
        title: '地址',
        dataIndex: 'address',
        key: 'address',
      },{
        title: '洗衣密码',
        dataIndex: 'token',
        key: 'token',
      },{
        title: '洗衣金额',
        dataIndex: 'amount',
        key: 'amount',
        render: (amount) => {
          return amount / 100 + "元";
        }
      },{
        title: '洗衣类型',
        dataIndex: 'pulseType',
        key: 'pulseType',
      },{
        title: '下单时间',
        dataIndex: 'time',
        key: 'time',
        render: (time) => {
          return moment(time).format('YYYY-MM-DD hh:mm:ss')
        },
      },{
        title: '操作',
        dataIndex: 'action',
        key: 'action',
        render: (text, record) => (
          <div>
            <Popconfirm title="确认退款吗?" onConfirm={self.refund.bind(this, record.key)}>
              <p><a href="#">退款</a></p>
            </Popconfirm>
          </div>
        ),
      }],
      loading: false
    };
  },
  componentWillMount() {
    // this.list();
  },
  list(account, pager) {
    var self = this;
    this.setState({
      loading: true,
    });
    StatisWashService.list(account, pager)
      .then((data) => {
        self.setState({
          loading: false,
        });
        console.log(data);
        if (data && data.status == '00') {
          const total = data.data.list.length;
          this.setState({
            total: total,
            list: data.data.list.map((item, key) => {
              item.key = key;
              item.action = 'action';
              console.log(item);
              return item;
            })
          });
        } else {
          message.info(data.msg);
        }
      })
  },
  refund(id) {
    // 退款操作
    console.log(id);
  },
  handleSearch() {
    const account = this.state.searchValue;
    const pager = {page: this.state.page, perPage: this.state.perPage}
    if (account) {
      // 发请求啦
      this.list(account, pager);
    }
  },
  handleInputChange(e) {
    this.setState({
      searchValue: e.target.value,
    });
  },
  initializePagination() {
    const account = this.state.searchValue;
    const self = this;
    return {
      total: self.state.total,
      showSizeChanger: true,
      size:'small',
      onShowSizeChange(current, pageSize) {
        const pager = { page : current, perPage: pageSize};
        self.setState(pager);
        self.list(account,pager);
      },
      onChange(current) {
        const pager = { page : current, perPage: self.state.perPage};
        self.setState(pager);
        self.list(account,pager);
      },
    }
  },
  render() {
    var self = this;
    const {list, total, columns} = this.state;
    return (
      <section className="view-statis-wash-search">
        <header>
          <Breadcrumb>
            <Breadcrumb.Item>模块查询</Breadcrumb.Item>
          </Breadcrumb>
        </header>
        <div className="toolbar">
          <span> 手机号：</span>
          <Input style={{width:100}} placeholder="请输入手机号" onChange={this.handleInputChange}/>
          <Button type="primary item" onClick={this.handleSearch}>查询</Button>
        </div>
        <article>
          <Table scroll={{ x: 980 }} dataSource={list} columns={columns} pagination={false} bordered loading={this.state.loading}/>
        </article>
      </section>
    );
  }
});

export default App;
