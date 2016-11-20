import React from "react";
import {Button, Table, Icon, Popconfirm,Breadcrumb, message} from "antd";
// import "./app.less";
import StatisDeviceService from "../../../service/statis_device";
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
      page: 1,
      perPage: 10,
      list:[],
      total: 0,
      columns: [{
        title: 'ID',
        dataIndex: 'key',
        key: 'key',
      }, {
        title: '月份',
        dataIndex: 'date',
        key: 'date',
        render(text, record, index) {
            return <Link to={"/data/device/month/" + record.date + "/" + record.serialNumber}>{text}</Link>;
        },
      }, {
        title: '编号',
        dataIndex: 'serialNumber',
        key: 'serialNumber',
      }, {
        title: '单脱',
        dataIndex: 'firstPulseAmount',
        key: 'firstPulseAmount',
      },{
        title: '快洗',
        dataIndex: 'secondPulseAmount',
        key: 'secondPulseAmount',
      },{
        title: '标准洗',
        dataIndex: 'thirdPulseAmount',
        key: 'thirdPulseAmount',
      },{
        title: '大物洗',
        dataIndex: 'fourthPulseAmount',
        key: 'fourthPulseAmount',
      }, {
        title: '金额',
        dataIndex: 'amount',
        key: 'amount',
        render: (amount) => {
          return amount / 100 + "元";
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
    StatisDeviceService.list()
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
  render() {
    const {list, total, columns} = this.state;
    return (<section className="view-statis-device-month">
      <header>
        <Breadcrumb>
          <Breadcrumb.Item>模块统计</Breadcrumb.Item>
        </Breadcrumb>
      </header>
      <Table scroll={{ x: 980 }} dataSource={list} columns={columns} pagination={false} bordered loading={this.state.loading}/>
    </section>);
  }
});

export default App;
