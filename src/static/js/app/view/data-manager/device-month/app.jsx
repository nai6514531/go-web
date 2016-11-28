import React from "react";
import {Button, Table, Icon, Popconfirm,Breadcrumb, message} from "antd";
import StatisDeviceService from "../../../service/statis_device";
import { Link } from 'react-router';

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
        title: '序号',
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
        render: (firstPulseAmount) => {
          return Math.round(firstPulseAmount*100)/100 + "次";
        }
      },{
        title: '快洗',
        dataIndex: 'secondPulseAmount',
        key: 'secondPulseAmount',
        render: (secondPulseAmount) => {
          return Math.round(secondPulseAmount*100)/100 + "次";
        }
      },{
        title: '标准洗',
        dataIndex: 'thirdPulseAmount',
        key: 'thirdPulseAmount',
        render: (thirdPulseAmount) => {
          return Math.round(thirdPulseAmount*100)/100 + "次";
        }
      },{
        title: '大物洗',
        dataIndex: 'fourthPulseAmount',
        key: 'fourthPulseAmount',
        render: (fourthPulseAmount) => {
          return Math.round(fourthPulseAmount*100)/100 + "次";
        }
      }, {
        title: '金额',
        dataIndex: 'amount',
        key: 'amount',
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
    StatisDeviceService.list()
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
