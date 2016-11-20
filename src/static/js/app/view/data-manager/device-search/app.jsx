import React from "react";
import {Input,Button, Table, Icon, Popconfirm,Breadcrumb, message} from "antd";
// import "./app.less";
import StatisDeviceService from "../../../service/device_search";
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
        title: '地址',
        dataIndex: 'address',
        key: 'address',
      },{
        title: '洗衣手机号',
        dataIndex: 'account',
        key: 'account',
      },{
        title: '洗衣密码',
        dataIndex: 'token',
        key: 'token',
      },{
        title: '洗衣金额',
        dataIndex: 'amount',
        key: 'amount',
        render: (amount) => {
          return amount + "元";
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
          return moment(time).format('YYYY-MM-DD hh:mm:ss')
        }
      }],
      loading: false
    };
  },
  componentWillMount() {
    const pager = {page: this.state.page, perPage:this.state.perPage};
    // this.list(pager);
  },
  list(serialNumber,pager) {
    var self = this;
    this.setState({
      loading: true,
    });
    StatisDeviceService.list(serialNumber,pager)
      .then((data) => {
        self.setState({
          loading: false,
        });
        console.log(data);
        if (data && data.status == '00') {
          const total = data.data.length;
          this.setState({
            total: total,
            list: data.data.map((item, key) => {
              item.key = key;
              console.log(item);
              return item;
            })
          });
        } else {
          message.info(data.msg);
        }
      })
  },
  handleSearch() {
    const serialNumber = this.state.searchValue;
    const pager = {page: this.state.page, perPage: this.state.perPage}
    if (serialNumber) {
      // 发请求啦
      this.list(serialNumber, pager);
    }
  },
  handleInputChange(e) {
    this.setState({
      searchValue: e.target.value,
    });
  },
  initializePagination() {
    const serialNumber = this.state.searchValue;
    const self = this;
    return {
      total: self.state.total,
      showSizeChanger: true,
      size:'small',
      onShowSizeChange(current, pageSize) {
        const pager = { page : current, perPage: pageSize};
        self.setState(pager);
        self.list(serialNumber,pager);
      },
      onChange(current) {
        const pager = { page : current, perPage: self.state.perPage};
        self.setState(pager);
        self.list(serialNumber,pager);
      },
    }
  },
  render() {
    var self = this;
    const {list, total, columns} = this.state;
    return (
      <section className="view-statis-device-search">
        <header>
          <Breadcrumb>
            <Breadcrumb.Item>模块查询</Breadcrumb.Item>
          </Breadcrumb>
        </header>
        <div className="toolbar">
          <span> 模块编号：</span>
          <Input style={{width:120}} placeholder="请输入模块编号" onChange={this.handleInputChange}/>
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
