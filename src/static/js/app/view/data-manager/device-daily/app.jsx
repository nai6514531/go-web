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
      perPage:10,
      total: 0,
      list:[],
      columns: [{
        title: 'ID',
        dataIndex: 'key',
        key: 'key',
      },{
        title: '日期',
        dataIndex: 'date',
        key: 'date',
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
          return amount + "元";
        }
      }],
      loading: false
    };
  },
  componentWillMount() {
    const date = this.props.params.id;
    const serialNumber = this.props.params.serial_number;
    const pager = {page:this.state.page, perPage:this.state.perPage};
    this.list(date, serialNumber, pager);
  },
  list(date, serialNumber, pager) {
    var self = this;
    this.setState({
      loading: true,
    });
    StatisDeviceService.dateList(date, serialNumber, pager)
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
  initializePagination() {
    const date = this.props.params.id;
    const serialNumber = this.props.params.serial_number;
    const self = this;
    return {
      total: self.state.total,
      showSizeChanger: true,
      size:'small',
      onShowSizeChange(current, pageSize) {
        const pager = { page : current, perPage: pageSize};
        self.setState(pager);
        self.list(date, serialNumber, pager);
      },
      onChange(current) {
        const pager = { page : current, perPage: self.state.perPage};
        self.setState(pager);
        self.list(date, serialNumber, pager);
      },
    }
  },
  render() {
    const {list, total, columns} = this.state;
    return (<section className="view-statis-device-daily">
      <header>
        <Breadcrumb>
          <Breadcrumb.Item><Link to="/data/device">模块统计</Link></Breadcrumb.Item>
          <Breadcrumb.Item>明细</Breadcrumb.Item>
        </Breadcrumb>
      </header>
      <Table scroll={{ x: 980 }} dataSource={list} columns={columns} pagination={false} bordered loading={this.state.loading}/>
    </section>);
  }
});

export default App;
