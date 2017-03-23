import React from "react";
import {Button, Table, Icon, Popconfirm,Breadcrumb, message} from "antd";
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
        title: '序号',
        dataIndex: 'key',
        key: 'key',
        width:40,
      }, {
        title: '日期',
        dataIndex: 'date',
        key: 'date',
        width:80,
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
        title: '用户数',
        dataIndex: 'totalUser',
        key: 'totalUser',
      }, {
        title: '新增用户数',
        dataIndex: 'totalNewUser',
        key: 'totalNewUser',
      },{
        title: '模块总数',
        dataIndex: 'totalDevice',
        key: 'totalDevice',
      }, {
        title: '已售模块数',
        dataIndex: 'totalSoldDevice',
        key: 'totalSoldDevice',
      }, {
        title: '空闲模块',
        dataIndex: 'totalUnusedDevice',
        key: 'totalUnusedDevice',
      }, {
        title: '独立充值用户数',
        dataIndex: 'totalRechargeUser',
        key: 'totalRechargeUser',
      }, {
        title: '独立消费用户数',
        dataIndex: 'totalConsumeUser',
        key: 'totalConsumeUser',
      },{
        title: '充值金额',
        dataIndex: 'totalRecharge',
        key: 'totalRecharge',
        render: (totalRecharge) => {
          return Math.round(totalRecharge)/100 + "元";
        }
      },{
        title: '消费金额',
        dataIndex: 'totalConsume',
        key: 'totalConsume',
        render: (totalConsume) => {
          return Math.round(totalConsume)/100 + "元";
        }
      },{
        title: '微信充值金额',
        dataIndex: 'totalWechatRecharge',
        key: 'totalWechatRecharge',
        render: (totalWechatRecharge) => {
          return Math.round(totalWechatRecharge)/100 + "元";
        }
      },{
        title: '支付宝充值金额',
        dataIndex: 'totalAlipayRecharge',
        key: 'totalAlipayRecharge',
        render: (totalAlipayRecharge) => {
          return Math.round(totalAlipayRecharge)/100 + "元";
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
  rowClassName(record, index) {
    return this.rowColor[record.key];
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
        if (data && data.status == '00') {
          const total = data.data.length;
          let rowColor = {};
          this.setState({
            total: total,
            list: data.data.map((item, key) => {
              item.key = key + 1;
              rowColor[item.key] = key%2==0?'white':'gray';
              self.rowColor = rowColor;
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
      <Table scroll={{ x: 500 }} dataSource={list}
             columns={columns} pagination={false}
             bordered loading={this.state.loading}
             rowClassName={this.rowClassName}
      />
    </section>);
  }
});

export default App;
