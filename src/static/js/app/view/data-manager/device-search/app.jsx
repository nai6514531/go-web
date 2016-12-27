import React from "react";
import {Input,Button, Table, Icon, Popconfirm,Breadcrumb, message} from "antd";
// import "./app.less";
import StatisDeviceService from "../../../service/device_search";
import DeviceService from "../../../service/device";

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
        width:10,
      }, {
        title: '运营商',
        dataIndex: 'user',
        key: 'user',
        width:50
      }, {
        title: '服务电话',
        dataIndex: 'telephone',
        key: 'telephone',
        width:100,
      }, {
        title: '楼道信息',
        dataIndex: 'address',
        key: 'address',
        width:100,
      },{
        title: '洗衣手机号',
        dataIndex: 'account',
        key: 'account',
        width:100,
      },{
        title: '洗衣密码',
        dataIndex: 'token',
        key: 'token',
        width:40,
      },{
        title: '洗衣金额',
        dataIndex: 'amount',
        key: 'amount',
        width:40,
        render: (amount) => {
          return Math.round(amount*100)/100 + "元";
        }
      },{
        title: '洗衣类型',
        dataIndex: 'pulseType',
        key: 'pulseType',
        width:30,
        render: (pulseType) => {
          if(pulseType == 601){
            return "单脱";
          } else if (pulseType == 602) {
            return "快洗";
          } else if (pulseType == 603) {
            return "标准洗";
          } else if (pulseType == 604) {
            return "大物洗";
          }
        },
      },{
        title: '下单时间',
        dataIndex: 'time',
        key: 'time',
        width:90,
        render: (time) => {
          return moment(time).format('YYYY-MM-DD HH:mm:ss')
        }
      }],
      loading: false
    };
  },
  rowClassName(record, index) {
    return this.rowColor[record.key];
  },
  list(serialNumber,pager) {
    var self = this;
    this.setState({
      loading: true,
    });
    StatisDeviceService.list(serialNumber,pager)
      .then((data) => {
        self.setState({
          loading: false,
        });
        if (data && data.status == '00') {
          const total = data.data.total;
          let rowColor = {};
          this.setState({
            total: total,
            list: data.data.list.map((item, key) => {
              item.key = key + 1 + (self.state.page-1)*self.state.perPage;
              rowColor[item.key] = key%2==0?'white':'gray';
              self.rowColor = rowColor;
              return item;
            })
          });
        } else {
          message.info(data.msg);
        }
      })
  },
  status(serialNumber,status) {
    var self = this;
    this.setState({
      loading: true,
    });
    DeviceService.statusBySN(serialNumber,status)
      .then((data) => {
        self.setState({
          loading: false,
        });
        message.success(data.msg,3);
      },(error)=>{
        self.setState({
          loading: false,
        });
        message.error(error.msg,3);
      })
  },
  handleSearch() {
    const serialNumber = this.state.searchValue.replace(/[\r\n\s]/g,"");
    const pager = {page: 1, perPage: this.state.perPage};
    this.setState({pager});
    if (serialNumber) {
      this.list(serialNumber, pager);
    }
  },
  changeStatus() {
    const serialNumber = this.state.searchValue.replace(/[\r\n\s]/g,"");
    if (serialNumber) {
      this.status(serialNumber, {status:0});
    }
  },
  handleInputChange(e) {
    this.setState({
      searchValue: e.target.value,
    });
  },
  initializePagination() {
    const serialNumber = this.state.searchValue;
    const self = this;
    return {
      total: self.state.total,
      showSizeChanger: true,
      size:'small',
      showTotal (total) {
        return <span>总计 {total} 条</span>
      },
      onShowSizeChange(current, pageSize) {
        const pager = { page : current, perPage: pageSize};
        self.setState(pager);
        self.list(serialNumber,pager);
      },
      onChange(current) {
        const pager = { page : current, perPage: self.state.perPage};
        self.setState(pager);
        self.list(serialNumber,pager);
      },
    }
  },
  render() {
    var self = this;
    const {list, total, columns} = this.state;
    const pagination = this.initializePagination();
    pagination.current = this.state.page;
    return (
      <section className="view-statis-device-search">
        <header>
          <Breadcrumb>
            <Breadcrumb.Item>模块查询</Breadcrumb.Item>
          </Breadcrumb>
        </header>
        <div className="toolbar">
          <span> 模块编号：</span>
          <Input style={{width:120}}
                 placeholder="请输入模块编号"
                 onChange={this.handleInputChange}
                 onPressEnter={this.handleSearch}
          />
          <Button type="primary item" onClick={this.handleSearch}>查询</Button>
          {USER.id == 4 || USER.id == 5 || USER.id == 368 || USER.id == 465 || USER.id == 1140 || USER.id == 1631?
            <Button type="primary item" onClick={this.changeStatus}>解除占用</Button>:
          ""
          }
        </div>
        <article>
          <Table scroll={{ x: 580 }} dataSource={list} 
                 columns={columns} pagination={pagination} 
                 bordered loading={this.state.loading}
                 rowClassName={this.rowClassName}
          />
        </article>
      </section>
      );
  }
});

export default App;
