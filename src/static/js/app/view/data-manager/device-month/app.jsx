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
        width:10,
      }, {
        title: '月份',
        dataIndex: 'date',
        key: 'date',
        width:80,
        render(text, record, index) {
            return <Link to={"/data/device/month/" + record.date + "/" + record.serialNumber}>{text}</Link>;
        },
      }, {
        title: '编号/楼道信息',
        dataIndex: 'serialNumber',
        key: 'serialNumber',
        width:110,
        render: (serialNumber,record)=>{
          return <span>{serialNumber} {record.address?' / '+record.address:""}</span>
        }
      }, {
        title: '单脱',
        dataIndex: 'firstPulseAmount',
        key: 'firstPulseAmount',
        width:80,
        render: (firstPulseAmount) => {
          return Math.round(firstPulseAmount*100)/100 + "次";
        }
      },{
        title: '快洗',
        dataIndex: 'secondPulseAmount',
        key: 'secondPulseAmount',
        width:80,
        render: (secondPulseAmount) => {
          return Math.round(secondPulseAmount*100)/100 + "次";
        }
      },{
        title: '标准洗',
        dataIndex: 'thirdPulseAmount',
        key: 'thirdPulseAmount',
        width:80,
        render: (thirdPulseAmount) => {
          return Math.round(thirdPulseAmount*100)/100 + "次";
        }
      },{
        title: '大物洗',
        dataIndex: 'fourthPulseAmount',
        key: 'fourthPulseAmount',
        width:80,
        render: (fourthPulseAmount) => {
          return Math.round(fourthPulseAmount*100)/100 + "次";
        }
      }, {
        title: '金额',
        dataIndex: 'amount',
        key: 'amount',
        width:100,
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
  rowClassName(record, index) {
    return this.rowColor[record.key];
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
        } else if (data && data.status == '01') {
          // nothing to do
        } else {
          message.info(data.msg);
        }
      })
  },
  initializePagination() {
    const self = this;
    return {
      total: self.state.total,
      showSizeChanger: true,
      size:'small',
      onShowSizeChange(current, pageSize) {
        const pager = { page : current, perPage: pageSize};
        self.setState(pager);
        // self.list();
      },
      onChange(current) {
        const pager = { page : current, perPage: self.state.perPage};
        self.setState(pager);
        // self.list();
      },
    }
  },
  render() {
    var self = this;
    const {list, total, columns} = this.state;
    const pagination = this.initializePagination();
    pagination.current = this.state.page;
    return (<section className="view-statis-device-month">
      <header>
        <Breadcrumb>
          <Breadcrumb.Item>模块统计</Breadcrumb.Item>
        </Breadcrumb>
      </header>
      <Table scroll={{ x: 650 }} dataSource={list} 
             columns={columns} pagination={pagination} 
             bordered loading={this.state.loading}
             rowClassName={this.rowClassName}
      />
    </section>);
  }
});

export default App;
