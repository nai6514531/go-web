import React from "react";
import {Input,Button, Table, Icon, Popconfirm,Breadcrumb, message} from "antd";
// import "./app.less";
import StatisWashService from "../../../service/wash_search";
import RefundService from "../../../service/refund";

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
        title: '序号',
        dataIndex: 'key',
        key: 'key',
      }, {
        title: '运营商',
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
          return Math.round(amount*100)/100 + "元";
        }
      },{
        title: '洗衣类型',
        dataIndex: 'pulseType',
        key: 'pulseType',
        render: (pulseType) => {
          if(pulseType == 601){
            return "单脱";
          } else if (pulseType == 602) {
            return "快洗";
          } else if (pulseType == 603) {
            return "标准洗";
          } else if (pulseType == 604) {
            return "大物洗";
          }
        },
      },{
        title: '下单时间',
        dataIndex: 'time',
        key: 'time',
        render: (time) => {
          return moment(time).format('YYYY-MM-DD HH:mm:ss')
        },
      },{
        title: '操作',
        dataIndex: 'washId',
        key: 'washId',
        width: 100,
        render: (text, record) => (
          <div>
            { USER.role.id == 4 ?
              record.status == 0 ?
              <Popconfirm title="确认退款吗?" onConfirm={self.refund.bind(this, record.account ,text)}>
                <p><a href="#">退款</a></p>
              </Popconfirm>
              :
              <span>已退款</span>
              :'/'
            }

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
        if (data && data.status == '00') {
          const total = data.data.length;
          this.setState({
            total: total,
            list: data.data.map((item, key) => {
              item.key = key + 1;
              return item;
            })
          });
        } else {
          message.info(data.msg);
        }
      })
  },
  refund(account, washId) {
    // 退款操作
    var self = this;
    const pager = {page: this.state.page, perPage: this.state.perPage}
    this.setState({
      loading: true,
    });
    RefundService.refund(account, washId)
      .then((data) => {
        self.setState({
          loading: false,
        });
        console.log(data);
        if (data && data.status == '00') {
          message.success('退款成功',3);
          self.list(account,pager);
        } else {
          message.info(data.msg);
        }
      })
  },
  handleSearch() {
    const account = this.state.searchValue.replace(/[\r\n\s]/g,"");
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
    // const pagination = this.initializePagination();
    // pagination.current = this.state.page;
    return (
      <section className="view-statis-wash-search">
        <header>
          <Breadcrumb>
            <Breadcrumb.Item>洗衣查询</Breadcrumb.Item>
          </Breadcrumb>
        </header>
        <div className="toolbar">
          <span> 手机号：</span>
          <Input style={{width:120}} placeholder="请输入手机号" onChange={this.handleInputChange}/>
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
