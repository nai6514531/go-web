import React from "react";
import { Table, Icon, message} from "antd";
import StatService from "../../service/stat";
import moment from 'moment';

const App = React.createClass({
  propTypes: {},
  getInitialState() {
    const self = this;
    return {
      total: 0,
      list:[],
      columns: [{
        title: '日期',
        dataIndex: 'date',
        key: 'date',
        render: (date) => {
          return date !== "total"?moment(date).format('YYYY-MM-DD'): "平台总计";
        }
      },{
        title: '充值金额',
        dataIndex: 'recharge',
        key: 'recharge',
        render: (amount) => {
          return Math.round(amount*100)/100 + "元";
        }
      }, {
        title: '消费金额',
        dataIndex: 'consumption',
        key: 'consumption',
        render: (amount) => {
          return Math.round(amount*100)/100 + "元";
        }
      }, {
        title: '余额',
        dataIndex: 'balance',
        key: 'balance',
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
    StatService.SevenBill()
      .then((data) => {
        self.setState({
          loading: false,
        });
        if (data && data.status == '00') {
          const list = data.data;
          let theList = list.map((item, key) => {
            item.key = key;
            if(key !== list.length-1) {
              item.balance = item.recharge - item.consumption;
            }
            return item;
          });
          this.setState({
            list: theList,
          });
        } else {
          message.info(data.msg);
        }
      })
  },
  render() {
    const {list, columns} = this.state;
    return (
      <Table scroll={{ x: 980 }}
             dataSource={list}
             columns={columns}
             pagination={false}
             bordered
             loading={this.state.loading}
      />
    );
  }
});

export default App;
