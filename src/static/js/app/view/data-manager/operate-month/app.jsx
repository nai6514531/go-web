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
        width:40,
        render(text, row, index) {
          if (index == 0) {
            return <span>合计</span>;
          }else{
            return <span>{text}</span>;
          }
        },
      }, {
        title: '月份',
        dataIndex: 'date',
        key: 'date',
        render(text, record, index) {
          if (index >0) {
            return <Link to={"/data/manage/month/" + record.date}>{text}</Link>;
          }
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
      }, {
        title: '钱包余额',
        dataIndex: 'totalWalletValue',
        key: 'totalWalletValue',
        render: (value,record,index) => {
          if(index>0) {
           return Math.round(value)/100 + "元";
          }
         }
      },{
        title: '账单总额',
        dataIndex: 'totalBill',
        key: 'totalBill',
        render: (value,record,index) => {
          if(index>0) {
           return Math.round(value)/100 + "元";
          }
         }
      },{
        title: '未结算账单总额',
        dataIndex: 'totalUnsettledBill',
        key: 'totalUnsettledBill',
        render: (value,record,index) => {
          if(index>0) {
           return Math.round(value)/100 + "元";
          }
         }
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
        title: '微信消费',
        dataIndex: 'totalWechatConsume',
        key: 'totalWechatConsume',
        render: (totalWechatConsume) => {
          return Math.round(totalWechatConsume)/100 + "元";
        }
      },{
        title: '支付宝消费',
        dataIndex: 'totalAlipayConsume',
        key: 'totalAlipayConsume',
        render: (totalAlipayConsume) => {
          return Math.round(totalAlipayConsume)/100 + "元";
        }
      },{
        title: '余额消费',
        dataIndex: 'totalWalletConsume',
        key: 'totalWalletConsume',
        render: (totalWalletConsume) => {
          return Math.round(totalWalletConsume)/100 + "元";
        }
      },{
        title: 'IC卡消费',
        dataIndex: 'totalChipcardConsume',
        key: 'totalChipcardConsume',
        render: (totalChipcardConsume) => {
          return Math.round(totalChipcardConsume)/100 + "元";
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
          const list = data.data||[];
          // const totalNewUser = list.reduce((total,item)=>{return total+item.totalNewUser},0);

          const totalConsume = Math.round(list.reduce((total,item)=>{return total+item.totalConsume},0)*100)/100;
          const totalWechatConsume = Math.round(list.reduce((total,item)=>{return total+item.totalWechatConsume},0)*100)/100;
          const totalAlipayConsume = Math.round(list.reduce((total,item)=>{return total+item.totalAlipayConsume},0)*100)/100;
          const totalWalletConsume = Math.round(list.reduce((total,item)=>{return total+item.totalWalletConsume},0)*100)/100;
          const totalChipcardConsume = Math.round(list.reduce((total,item)=>{return total+item.totalChipcardConsume},0)*100)/100;
          const totalRecharge = Math.round(list.reduce((total,item)=>{return total+item.totalRecharge},0)*100)/100;
          const totalWechatRecharge = Math.round(list.reduce((total,item)=>{return total+item.totalWechatRecharge},0)*100)/100;
          const totalAlipayRecharge = Math.round(list.reduce((total,item)=>{return total+item.totalAlipayRecharge},0)*100)/100;

          const total = {
            "totalRecharge": totalRecharge,
            "totalConsume": totalConsume,
            "totalWechatConsume": totalWechatConsume,
            "totalAlipayConsume": totalAlipayConsume,
            "totalWalletConsume": totalWalletConsume,
            "totalChipcardConsume": totalChipcardConsume,
            "totalWechatRecharge": totalWechatRecharge,
            "totalAlipayRecharge": totalAlipayRecharge,
          };
          let theList = list.map((item, key) => {
            item.key = key+1 ;
            return item;
          });
          theList.unshift(total);
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
      <Table scroll={{ x: 465 }} dataSource={list}
             columns={columns} pagination={false}
             bordered loading={this.state.loading}
      />
    </section>);
  }
});

export default App;
