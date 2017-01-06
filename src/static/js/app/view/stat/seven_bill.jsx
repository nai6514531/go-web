import React from "react";
import {Button, Table, Icon, Popconfirm,Breadcrumb, message} from "antd";
import StatService from "../../service/stat";
import { Link } from 'react-router';
import moment from 'moment';

const App = React.createClass({
  propTypes: {},
  getInitialState() {
    const self = this;
    return {
      total: 0,
      list:[],
      columns: [{
        title: '日期',
        dataIndex: 'date',
        key: 'date',
        render: (date) => {
          if(date !== "total") {
            return moment(date).format('YYYY-MM-DD HH:mm:ss')
          } else {
            return "平台总计";
          }
        }
      },{
        title: '充值金额',
        dataIndex: 'recharge',
        key: 'recharge',
        render: (amount) => {
          return Math.round(amount*100)/100 + "元";
        }
      }, {
        title: '消费金额',
        dataIndex: 'consumption',
        key: 'consumption',
        render: (amount) => {
          return Math.round(amount*100)/100 + "元";
        }
      }, {
        title: '余额',
        dataIndex: 'balance',
        key: 'balance',
        render: (amount) => {
          return Math.round(amount*100)/100 + "元";
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
    StatService.SevenBill()
      .then((data) => {
        self.setState({
          loading: false,
        });
        if (data && data.status == '00') {
          const list = data.data;
          const recharge = Math.round(list.reduce((total,item)=>{return total+item.recharge},0)*100)/100;
          const consumption = Math.round(list.reduce((total,item)=>{return total+item.consumption},0)*100)/100;
          const balance = Math.round(list.reduce((total,item)=>{return total+item.balance},0)*100)/100;
          const total = {
            "date": "total",
            "recharge": recharge,
            "consumption": consumption,
            "balance": balance,
          };
          let theList = list.map((item, key) => {
            item.key = key;
            return item;
          });
          theList.push(total);
          this.setState({
            list: theList,
          });
        } else {
          message.info(data.msg);
        }
      })
  },
  render() {
    const {list, columns} = this.state;
    return (
      <Table scroll={{ x: 980 }}
             dataSource={list}
             columns={columns}
             pagination={false}
             bordered
             loading={this.state.loading}
      />
    );
  }
});

export default App;
