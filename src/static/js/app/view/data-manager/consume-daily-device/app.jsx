import React from "react";
import {Button, Table, Icon, Popconfirm,Breadcrumb, message} from "antd";
import StatisConsumeService from "../../../service/statis_consume";
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
      },{
        title: '编号/楼道信息',
        dataIndex: 'serialNumber',
        key: 'serialNumber',
        render: (serialNumber,record)=>{
          return
          <span>
            <Link to={record.url}>{serialNumber}</Link>
            {record.address?' / '+record.address:""}
          </span>
        }
      }, {
        title: '运营商名称',
        dataIndex: 'name',
        key: 'name',
      }, {
        title: '单脱',
        dataIndex: 'firstPulseAmount',
        key: 'firstPulseAmount',
        render: (firstPulseAmount) => {
          return firstPulseAmount + "次";
        }
      },{
        title: '快洗',
        dataIndex: 'secondPulseAmount',
        key: 'secondPulseAmount',
        render: (secondPulseAmount) => {
          return secondPulseAmount + "次";
        }
      },{
        title: '标准洗',
        dataIndex: 'thirdPulseAmount',
        key: 'thirdPulseAmount',
        render: (thirdPulseAmount) => {
          return thirdPulseAmount + "次"
        }
      },{
        title: '大物洗',
        dataIndex: 'fourthPulseAmount',
        key: 'fourthPulseAmount',
        render: (fourthPulseAmount) => {
          return fourthPulseAmount + "次"
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
    const date = this.props.params.id;
    const pager = { page : this.state.page, perPage: this.state.perPage};
    this.list(date, pager);
  },
  list(id, pager) {
    var self = this;
    this.setState({
      loading: true,
    });
    const { date } = this.props.params;
    const baseUrl = "/data/consume/month/"+date.substr(0,7)+"/"+date+"/";
    StatisConsumeService.deviceList(id, pager)
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
              item.url = baseUrl+item.serialNumber;
              return item;
            })
          });
        } else {
          message.info(data.msg);
        }
      })
  },
  initializePagination() {
    const {id} = this.props.params;
    const self = this;
    return {
      total: self.state.total,
      showSizeChanger: true,
      size:'small',
      onShowSizeChange(current, pageSize) {
        const pager = { page : current, perPage: pageSize};
        self.setState(pager);
        self.list(id, pager);
      },
      onChange(current) {
        const pager = { page : current, perPage: self.state.perPage};
        self.setState(pager);
        self.list(id, pager);
      },
    }
  },
  render() {
    const {list, total, columns} = this.state;
    const { id, date } = this.props.params;
    return (<section className="view-consume-daily-device">
      <header>
        <Breadcrumb>
          <Breadcrumb.Item><Link to="/data/consume">消费统计</Link></Breadcrumb.Item>
          <Breadcrumb.Item><Link to={"/data/consume/month/"+id}>{id}</Link></Breadcrumb.Item>
          <Breadcrumb.Item>{date}</Breadcrumb.Item>
        </Breadcrumb>
      </header>
      <Table scroll={{ x: 980 }} dataSource={list} columns={columns} pagination={false} bordered loading={this.state.loading}/>
    </section>);
  }
});

export default App;
