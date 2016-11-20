import React from "react";
import {Button, Table, Icon, Popconfirm,Breadcrumb, message} from "antd";
import StatisOperateService from "../../../service/statis_operate";
import { Link } from 'react-router';
const _ = require('lodash');

const App = React.createClass({
  propTypes: {
    user_id: React.PropTypes.string,
    bill_at: React.PropTypes.string
  },
  getInitialState() {
    const self = this;
    return {
      list:[],
      total:0,
      columns: [{
        title: 'ID',
        dataIndex: 'key',
        key: 'key',
        render(text, row, index) {
          if (index < self.state.total - 1) {
            return <span>{text}</span>;
          }
          return {
            children: <span>合计</span>,
            props: {
              colSpan: 2,
            },
          };
        },
      }, {
        title: '月份',
        dataIndex: 'date',
        key: 'date',
        render(text, record, index) {
          if (index < self.state.total - 1) {
            return <Link to={"/data/manage/month/" + record.date}>{text}</Link>;
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
        render: (rechargeAmount) => {
          return rechargeAmount + "元";
        }
      },{
        title: '消费金额',
        dataIndex: 'consumeAmount',
        key: 'consumeAmount',
        render: (consumeAmount) => {
          return consumeAmount + "元";
        }
      }],
      loading: false
    };
  },
  componentWillMount() {
    this.list();
  },
  list() {
    var self = this;
    this.setState({
      loading: true,
    });
    StatisOperateService.list()
      .then((data) => {
        self.setState({
          loading: false,
        });
        console.log(data);
        if (data && data.status == '00') {
          const list = data.data;
          const increaseUserCount = list.reduce((total,item)=>{return total+item.increaseUserCount},0);
          const enabledDeviceCount = list.reduce((total,item)=>{return total+item.enabledDeviceCount},0);
          const increaseDeviceCount = list.reduce((total,item)=>{return total+item.increaseDeviceCount},0);
          const rechargeAmount = list.reduce((total,item)=>{return total+item.rechargeAmount},0);
          const consumeAmount = list.reduce((total,item)=>{return total+item.consumeAmount},0);
          const total = {
            "increaseUserCount": increaseUserCount,
            "enabledDeviceCount": enabledDeviceCount,
            "increaseDeviceCount": increaseDeviceCount,
            "rechargeAmount": rechargeAmount,
            "consumeAmount": consumeAmount,
          }
          let theList = list.map((item, key) => {
            item.key = key;
            return item;
          });
          theList.push(total);
          this.setState({
            total: theList.length ,
            list: theList,
          });
        } else {
          message.info(data.msg);
        }
      })
  },
  render() {
    const {list, total, columns} = this.state;
    return (<section className="view-statis-manage-month">
      <header>
        <Breadcrumb>
          <Breadcrumb.Item>经营统计</Breadcrumb.Item>
        </Breadcrumb>
      </header>
      <Table scroll={{ x: 980 }} dataSource={list} columns={columns} pagination={false} bordered loading={this.state.loading}/>
    </section>);
  }
});

export default App;
