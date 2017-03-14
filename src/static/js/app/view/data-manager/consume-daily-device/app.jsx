import React from "react";
import {Button, Table, Icon, Popconfirm,Breadcrumb, message} from "antd";
import DailyBillDetailService from "../../../service/daily_bill_detail";
import StatisConsumeService from "../../../service/statis_consume";
import { Link } from 'react-router';
var _ = require('lodash');
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
      },{
        title: '编号/楼道信息',
        dataIndex: 'serialNumber',
        key: 'serialNumber',
        width:100,
        render: (serialNumber,record)=>{
          if(record.amount>0){
            return <div>
              <Link to={record.url}>{serialNumber}</Link>
              {record.address?' / '+record.address:""}
            </div>
          }else{
            return <div>
              {serialNumber}
              {record.address?' / '+record.address:""}
            </div>
          }
        }
      }, {
        title: '运营商名称',
        dataIndex: 'userName',
        key: 'userName',
        width:60,
      }, {
        title: '单脱',
        dataIndex: 'firstPulseAmount',
        key: 'firstPulseAmount',
        width:50,
        render: (firstPulseAmount) => {
          return firstPulseAmount + "次";
        }
      },{
        title: '快洗',
        dataIndex: 'secondPulseAmount',
        key: 'secondPulseAmount',
        width:50,
        render: (secondPulseAmount) => {
          return secondPulseAmount + "次";
        }
      },{
        title: '标准洗',
        dataIndex: 'thirdPulseAmount',
        key: 'thirdPulseAmount',
        width:50,
        render: (thirdPulseAmount) => {
          return thirdPulseAmount + "次"
        }
      },{
        title: '大物洗',
        dataIndex: 'fourthPulseAmount',
        key: 'fourthPulseAmount',
        width:50,
        render: (fourthPulseAmount) => {
          return fourthPulseAmount + "次"
        }
      }, {
        title: '金额',
        dataIndex: 'amount',
        key: 'amount',
        width:80,
        render: (amount) => {
          return Math.round(amount*100)/100 + "元";
        }
      }],
      loading: false
    };
  },
  componentWillMount() {
    const { date } = this.props.params;
    const pager = { page : this.state.page, perPage: this.state.perPage};
    this.list(USER.id,date,'', pager);
  },
  rowClassName(record, index) {
    return this.rowColor[record.key];
  },
  list(userId, billAt, serialNumbr, pager) {
    var self = this;
    this.setState({
      loading: true,
    });
    const {id} = this.props.params;
    const baseUrl = "/data/consume/month/"+id+"/"+billAt+"/";
    StatisConsumeService.dateList(billAt, pager)
      .then((data) => {
        self.setState({
          loading: false,
        });
        if (data && data.status == '00') {
          let rowColor = {};
          let _list=data.data.map((item,key) => {
            item.url = baseUrl+item.serialNumber;
            item.key = key + 1;
            rowColor[item.key] = key%2==0?'white':'gray';
            self.rowColor = rowColor;
            return item;
          })
          this.setState({
            total: data.data.total || 0,
            list: _list
          });
        } else {
          message.info(data.msg);
        }
      });
  },

  initializePagination() {
    const {date} = this.props.params;
    const self = this;
    return {
      total: self.state.total,
      showSizeChanger: true,
      size:'small',
      onShowSizeChange(current, pageSize) {
        const pager = { page : current, perPage: pageSize};
        self.setState(pager);
        self.list(USER.id,date,'', pager);
      },
      onChange(current) {
        const pager = { page : current, perPage: self.state.perPage};
        self.setState(pager);
        self.list(USER.id,date,'',pager);
      },
    }
  },
  render() {
    const {list, total, columns} = this.state;
    const { id, date } = this.props.params;
    const pagination = this.initializePagination();
    pagination.current = this.state.page;
    return (<section className="view-consume-daily-device">
      <header>
        <Breadcrumb>
          <Breadcrumb.Item><Link to="/data/consume">消费统计</Link></Breadcrumb.Item>
          <Breadcrumb.Item><Link to={"/data/consume/month/"+id}>{id}</Link></Breadcrumb.Item>
          <Breadcrumb.Item>{date}</Breadcrumb.Item>
        </Breadcrumb>
      </header>
      <Table scroll={{ x: 500 }} dataSource={list}
             columns={columns} pagination={pagination}
             bordered loading={this.state.loading}
             rowClassName={this.rowClassName}
      />
    </section>);
  }
});

export default App;
