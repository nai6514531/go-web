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
        width:10,
      },{
        title: '日期',
        dataIndex: 'date',
        key: 'date',
        width:100,
        render(text, record, index) {
          return <Link to={"/data/consume/month/" + record.date.substr(0,7) + "/" + record.date}>{text}</Link>;
        },
      }, {
        title: '模块数',
        dataIndex: 'deviceCount',
        key: 'deviceCount',
        width:55,
      }, {
        title: '单脱',
        dataIndex: 'firstPulseAmount',
        key: 'firstPulseAmount',
        width:50,
        render: (firstPulseAmount) => {
          return Math.round(firstPulseAmount*100)/100 + "次";
        }
      },{
        title: '快洗',
        dataIndex: 'secondPulseAmount',
        key: 'secondPulseAmount',
        width:50,
        render: (secondPulseAmount) => {
          return Math.round(secondPulseAmount*100)/100 + "次";
        }
      },{
        title: '标准洗',
        dataIndex: 'thirdPulseAmount',
        key: 'thirdPulseAmount',
        width:50,
        render: (thirdPulseAmount) => {
          return Math.round(thirdPulseAmount*100)/100 + "次"
        }
      },{
        title: '大物洗',
        dataIndex: 'fourthPulseAmount',
        key: 'fourthPulseAmount',
        width:50,
        render: (fourthPulseAmount) => {
          return Math.round(fourthPulseAmount*100)/100 + "次"
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
      loading: false,
    };
  },
  componentWillMount() {
    const date = this.props.params.id;
    const pager = { page : this.state.page, perPage: this.state.perPage};
    this.list(date, pager);
  },
  list(date, pager) {
    var self = this;
    this.setState({
      loading: true,
    });
    StatisConsumeService.dateList(date, pager)
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
  initializePagination() {
    const date = this.props.params.id;
    const self = this;
    return {
      total: self.state.total,
      showSizeChanger: true,
      size:'small',
      onShowSizeChange(current, pageSize) {
        const pager = { page : current, perPage: pageSize};
        self.setState(pager);
        // self.list(date, pager);
      },
      onChange(current) {
        const pager = { page : current, perPage: self.state.perPage};
        self.setState(pager);
        // self.list(date, pager);
      },
    }
  },
  render() {
    const {list, total, columns} = this.state;
    const {id} = this.props.params;
    const pagination = this.initializePagination();
    pagination.current = this.state.page;
    return (<section className="view-statis-consume-daily">
      <header>
        <Breadcrumb>
          <Breadcrumb.Item><Link to="/data/consume">消费统计</Link></Breadcrumb.Item>
          <Breadcrumb.Item>{id}</Breadcrumb.Item>
        </Breadcrumb>
      </header>
      <Table scroll={{ x: 450 }} dataSource={list}
             columns={columns} pagination={pagination}
             bordered loading={this.state.loading}
      />
    </section>);
  }
});

export default App;
