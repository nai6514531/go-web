import React from "react";
import {Button, Table, Icon, Popconfirm,Breadcrumb, message} from "antd";
// import "./app.less";
import StatisOperateService from "../../../service/statis_operate";
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
      page:1,
      perPage:10,
      list:[],
      total:0,
      columns: [{
        title: 'ID',
        dataIndex: 'key',
        key: 'key',
      }, {
        title: '日期',
        dataIndex: 'date',
        key: 'date',
        render(text, record, index) {
          if (index < self.state.total) {
            return moment(text).format('YYYY-MM-DD')
          }
          return {
            props: {
              colSpan: 0,
            },
          };
        },
      }, {
        title: '新增用户数',
        dataIndex: 'increaseUserCount',
        key: 'increaseUserCount',
      }, {
        title: '启用模块',
        dataIndex: 'enabledDeviceCount',
        key: 'enabledDeviceCount',
      },{
        title: '新增模块',
        dataIndex: 'increaseDeviceCount',
        key: 'increaseDeviceCount',
      },{
        title: '充值金额',
        dataIndex: 'rechargeAmount',
        key: 'rechargeAmount',
        render: (recharge_amount) => {
          return recharge_amount / 100 + "元";
        }
      },{
        title: '消费金额',
        dataIndex: 'consumeAmount',
        key: 'consumeAmount',
        render: (consume_amount) => {
          return consume_amount / 100 + "元";
        }
      }],
      loading: false
    };
  },
  componentWillMount() {
    const date = this.props.params.id;
    const pager = {page:this.state.page, perPage:this.state.perPage};
    this.list(date, pager);
  },
  list(date, pager) {
    var self = this;
    this.setState({
      loading: true,
    });
    StatisOperateService.operateList(date, pager)
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
              console.log(item);
              return item;
            })
          });
        } else {
          message.info(data.msg);
        }
      })
  },
  initializePagination() {
    const date = this.props.params.id;
    const self = this;
    return {
      total: self.state.total,
      showSizeChanger: true,
      size:'small',
      onShowSizeChange(current, pageSize) {
        const pager = { page : current, perPage: pageSize};
        self.setState(pager);
        self.list(date, pager);
      },
      onChange(current) {
        const pager = { page : current, perPage: self.state.perPage};
        self.setState(pager);
        self.list(date, pager);
      },
    }
  },

  render() {
    const {list, total, columns} = this.state;
    return (<section className="view-statis-manage-daily">
      <header>
        <Breadcrumb>
          <Breadcrumb.Item><Link to="/data/manage">经营统计</Link></Breadcrumb.Item>
          <Breadcrumb.Item>明细</Breadcrumb.Item>
        </Breadcrumb>
      </header>
      <Table scroll={{ x: 980 }} dataSource={list} columns={columns} pagination={false} bordered loading={this.state.loading}/>
    </section>);
  }
});

export default App;
