import React from "react";
import {Button, Table, Icon, Popconfirm,Breadcrumb, message} from "antd";
// import "./app.less";
import StatisConsumeService from "../../../service/statis_consume";
import { Link } from 'react-router';
const _ = require('lodash');

const App = React.createClass({
  propTypes: {
    id: React.PropTypes.string,
  },
  getInitialState() {
    const self = this;
    return {
      list:[],
      total: 0,
      columns: [{
        title: 'ID',
        dataIndex: 'key',
        key: 'key',
        render(text, row, index) {
          if (index < self.state.total-1) {
            return <span>{text}</span>;
          }
          return {
            children: <span>合计</span>,
            props: {
              colSpan: 3,
            },
          };
        },
      }, {
        title: '月份',
        dataIndex: 'date',
        key: 'date',
        render(text, record, index) {
          if (index < self.state.total-1) {
            return <Link to={"/data/consume/month/" + record.date}>{text}</Link>;
          }
          return {
            props: {
              colSpan: 0,
            },
          };
        },
      }, {
        title: '模块数',
        dataIndex: 'deviceCount',
        key: 'deviceCount',
        render(text, record, index) {
          if (index < self.state.total-1) {
            return <span>{text}</span>;
          }
          return {
            props: {
              colSpan: 0,
            },
          };
        },
      }, {
        title: '单脱',
        dataIndex: 'firstPulseAmount',
        key: 'firstPulseAmount',
        render: (firstPulseAmount) => {
          return firstPulseAmount.toFixed(2) + "元";
        }
      },{
        title: '快洗',
        dataIndex: 'secondPulseAmount',
        key: 'secondPulseAmount',
        render: (secondPulseAmount) => {
          return secondPulseAmount.toFixed(2) + "元";
        }
      },{
        title: '标准洗',
        dataIndex: 'thirdPulseAmount',
        key: 'thirdPulseAmount',
        render: (thirdPulseAmount) => {
          return thirdPulseAmount.toFixed(2) + "元";
        }
      },{
        title: '大物洗',
        dataIndex: 'fourthPulseAmount',
        key: 'fourthPulseAmount',
        render: (fourthPulseAmount) => {
          return fourthPulseAmount.toFixed(2) + "元";
        }
      }, {
        title: '金额',
        dataIndex: 'amount',
        key: 'amount',
        render: (amount) => {
          return amount.toFixed(2) + "元";
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
    StatisConsumeService.list()
      .then((data) => {
        self.setState({
          loading: false,
        });
        console.log(data);
        if (data && data.status == '00') {
          const list = data.data;
          console.log(list);
          const firstPulseAmount = list.reduce((total,item)=>{return total+item.firstPulseAmount},0);
          const secondPulseAmount = list.reduce((total,item)=>{return total+item.secondPulseAmount},0);
          const thirdPulseAmount = list.reduce((total,item)=>{return total+item.thirdPulseAmount},0);
          const fourthPulseAmount = list.reduce((total,item)=>{return total+item.fourthPulseAmount},0);
          const amount = list.reduce((total,item)=>{return total+item.amount},0);
          const total = {
            "firstPulseAmount": firstPulseAmount.toFixed(2),
            "secondPulseAmount": secondPulseAmount.toFixed(2),
            "thirdPulseAmount": thirdPulseAmount.toFixed(2),
            "fourthPulseAmount": fourthPulseAmount.toFixed(2),
            "amount": amount.toFixed(2),
          };
          let theList = list.map((item, key) => {
            item.key = key;
            // item.key = item.id;
            return item;
          });
          theList.push(total);
          this.setState({
            total: theList.length,
            list: theList,
          });
        } else {
          message.info(data.msg);
        }
      })
  },
  render() {
    const {list, total, columns} = this.state;
    return (<section className="view-statis-consume-month">
      <header>
        <Breadcrumb>
          <Breadcrumb.Item>消费统计</Breadcrumb.Item>
        </Breadcrumb>
      </header>
      <Table scroll={{ x: 980 }} dataSource={list} columns={columns} pagination={false} bordered loading={this.state.loading}/>
    </section>);
  }
});

export default App;
