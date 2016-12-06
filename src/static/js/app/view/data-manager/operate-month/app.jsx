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
        title: '序号',
        dataIndex: 'key',
        key: 'key',
        width:10,
        render(text, row, index) {
          if (index < self.state.total - 1) {
            return <span>{text + 1}</span>;
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
        width:80,
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
        width:70,
      }, {
        title: '空闲模块',
        dataIndex: 'enabledDeviceCount',
        key: 'enabledDeviceCount',
        width:60,
      },{
        title: '新增模块',
        dataIndex: 'increaseDeviceCount',
        key: 'increaseDeviceCount',
        width:60,
      },{
        title: '充值金额',
        dataIndex: 'rechargeAmount',
        key: 'rechargeAmount',
        width:90,
        render: (rechargeAmount) => {
          return Math.round(rechargeAmount*100)/100 + "元";
        }
      },{
        title: '消费金额',
        dataIndex: 'consumeAmount',
        key: 'consumeAmount',
        width:90,
        render: (consumeAmount) => {
          return Math.round(consumeAmount*100)/100 + "元";
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
        if (data && data.status == '00') {
          const list = data.data;
          const increaseUserCount = list.reduce((total,item)=>{return total+item.increaseUserCount},0);
          const enabledDeviceCount = list.reduce((total,item)=>{return total+item.enabledDeviceCount},0);
          const increaseDeviceCount = list.reduce((total,item)=>{return total+item.increaseDeviceCount},0);
          const rechargeAmount = Math.round(list.reduce((total,item)=>{return total+item.rechargeAmount},0)*100)/100;
          const consumeAmount = Math.round(list.reduce((total,item)=>{return total+item.consumeAmount},0)*100)/100;
          const total = {
            "increaseUserCount": increaseUserCount,
            "enabledDeviceCount": enabledDeviceCount,
            "increaseDeviceCount": increaseDeviceCount,
            "rechargeAmount": rechargeAmount,
            "consumeAmount": consumeAmount,
          }
          let theList = list.map((item, key) => {
            item.key = key ;
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
      <Table scroll={{ x: 465 }} dataSource={list} columns={columns} pagination={false} bordered loading={this.state.loading}/>
    </section>);
  }
});

export default App;
