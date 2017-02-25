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
        title: '月份',
        dataIndex: 'date',
        key: 'date',
        render: (date) => {
          if(date !== "total") {
            return moment(date).format('YYYY-MM')
          } else {
            return "总计";
          }
        }
      },{
        title: '人数',
        dataIndex: 'count',
        key: 'count',
        render: (amount) => {
          return amount + "人";
        }
      },],
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
    StatService.signInUserMonth()
      .then((data) => {
        self.setState({
          loading: false,
        });
        if (data && data.status == '00') {
          const list = data.data;
          const count = Math.round(list.reduce((total,item)=>{return total+item.count},0));
          const total = {
            "date": "total",
            "count": count,
          };
          let theList = list.map((item, key) => {
            item.key = key;
            return item;
          });
          theList.unshift(total);
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
