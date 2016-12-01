import React from "react";
import {Input,Button, Table, Icon, Popconfirm,Breadcrumb, message} from "antd";
// import "./app.less";
import StatisConsumeService from "../../../service/statis_consume";

import moment from 'moment';


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
      searchValue:'',
      list:[],
      total:0,
      columns: [{
        title: '序号',
        dataIndex: 'key',
        key: 'key',
      }, {
        title: '编号/楼道信息',
        dataIndex: 'serialNumber',
        key: 'serialNumber',
        render: (serialNumber,record)=>{
          return <span>{serialNumber} {record.address?' / '+record.address:""}</span>
        }
      }, {
        title: '洗衣金额',
        dataIndex: 'amount',
        key: 'amount',
        render: (amount) => {
          return Math.round(amount*100)/100 + "元";
        }
      },{
        title: '洗衣手机号',
        dataIndex: 'account',
        key: 'account',
      },
      //   {
      //   title: '洗衣密码',
      //   dataIndex: 'token',
      //   key: 'token',
      // },{
      //   title: '洗衣类型',
      //   dataIndex: 'pulseType',
      //   key: 'pulseType',
      //   render: (pulseType) => {
      //     if(pulseType == 601){
      //       return "单脱";
      //     } else if (pulseType == 602) {
      //       return "快洗";
      //     } else if (pulseType == 603) {
      //       return "标准洗";
      //     } else if (pulseType == 604) {
      //       return "大物洗";
      //     }
      //   },
      // },
        {
        title: '下单时间',
        dataIndex: 'time',
        key: 'time',
        render: (time) => {
          return moment(time).format('YYYY-MM-DD HH:mm:ss')
        }
      }],
      loading: false
    };
  },
  componentWillMount() {
    const {id, date, deviceId}= this.props.params;
    const pager = { page : this.state.page, perPage: this.state.perPage};
    this.list(date, deviceId, pager);
  },
  list(id, deviceId, pager) {
    var self = this;
    this.setState({
      loading: true,
    });
    const { date } = this.props.params;
    const baseUrl = "/data/consume/month/"+date.substr(0,7)+"/"+date+"/";
    StatisConsumeService.deviceDetail(id, deviceId, pager)
      .then((data) => {
        self.setState({
          loading: false,
        });
        //console.log(data);
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
    const {id,deviceId} = this.props.params;
    const self = this;
    return {
      total: self.state.total,
      showSizeChanger: true,
      size:'small',
      onShowSizeChange(current, pageSize) {
        const pager = { page : current, perPage: pageSize};
        self.setState(pager);
        self.list(id,deviceId, pager);
      },
      onChange(current) {
        const pager = { page : current, perPage: self.state.perPage};
        self.setState(pager);
        self.list(id,deviceId, pager);
      },
    }
  },
  render() {
    const {list, total, columns} = this.state;
    const {id,date,deviceId} = this.props.params;
    return (<section className="view-consume-daily-device">
      <header>
        <Breadcrumb>
          <Breadcrumb.Item><Link to="/data/consume">消费统计</Link></Breadcrumb.Item>
          <Breadcrumb.Item><Link to={"/data/consume/month/"+id}>{id}</Link></Breadcrumb.Item>
          <Breadcrumb.Item><Link to={"/data/consume/month/"+id+"/"+date}>{date}</Link></Breadcrumb.Item>
          <Breadcrumb.Item>{deviceId}</Breadcrumb.Item>
        </Breadcrumb>
      </header>
      <Table scroll={{ x: 980 }} dataSource={list} columns={columns} pagination={false} bordered loading={this.state.loading}/>
    </section>);
  }
});

export default App;
