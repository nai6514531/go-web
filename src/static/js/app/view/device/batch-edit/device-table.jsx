import React from 'react';
import './app.less';
import { Form, Input, Radio, Select, Cascader, Modal, Breadcrumb, message, Tooltip, Icon, Checkbox,Table} from 'antd';

import DeviceService from "../../../service/device";


class DeviceTable extends React.Component {
  constructor(props) {
    super(props);
    this.getTableList = this.getTableList.bind(this);
    this.state = {
      loading: false,
      columns: [{
        title: '序号',
        dataIndex: 'index',
        key: 'index',
        width: 30,
        render(text, record, index) {
          return <span className="">{text}</span>
        },
      },{
        title: '设备编号',
        dataIndex: 'serialNumber',
        key: 'serialNumber',
        width:100,
        render(text, record, index) {
          return <span className="">{text}</span>
        },
      }, {
        title: '学校',
        dataIndex: 'schoolName',
        key: 'schoolName',
        width:55,
        render(text, record, index) {
          return <span className={record.className.schoolName}>{text}</span>
        },
      },{
        title: '楼层',
        dataIndex: 'address',
        key: 'address',
        width:55,
        render(text, record, index) {
          return <span className={record.className.address}>{text}</span>
        },
      }, {
        title: '服务名称1',
        dataIndex: 'firstPulseName',
        key: 'firstPulseName',
        width:50,
        render(text, record, index) {
          return <span className={record.className.firstPulseName}>{text}</span>
        },
      },
        {
          title: '价格',
          dataIndex: 'firstPulsePrice',
          key: 'firstPulsePrice',
          width:50,
          render(text, record, index) {
            return <span className={record.className.firstPulsePrice}>{Math.round(text*100)/100}元</span>
          },
        },{
          title: '服务名称2',
          dataIndex: 'secondPulseName',
          key: 'secondPulseName',
          width:50,
          render(text, record, index) {
            return <span className={record.className.secondPulseName}>{text}</span>
          },
        }, {
          title: '价格',
          dataIndex: 'secondPulsePrice',
          key: 'secondPulsePrice',
          width:50,
          render(text, record, index) {
            return <span className={record.className.secondPulsePrice}>{Math.round(text*100)/100}元</span>
          },
        },{
          title: '服务名称3',
          dataIndex: 'thirdPulseName',
          key: 'thirdPulseName',
          width:50,
          render(text, record, index) {
            return <span className={record.className.thirdPulseName}>{text}</span>
          },
        },
        {
          title: '价格',
          dataIndex: 'thirdPulsePrice',
          key: 'thirdPulsePrice',
          width:50,
          render(text, record, index) {
            return <span className={record.className.thirdPulsePrice}>{Math.round(text*100)/100}元</span>
          },
        },{
          title: '服务名称4',
          dataIndex: 'fourthPulseName',
          key: 'fourthPulseName',
          width:50,
          render(text, record, index) {
            return <span className={record.className.fourthPulseName}>{text}</span>
          },
        }, {
          title: '价格',
          dataIndex: 'fourthPulsePrice',
          key: 'fourthPulsePrice',
          width:50,
          render(text, record, index) {
            return <span className={record.className.fourthPulsePrice}>{Math.round(text*100)/100}元</span>
          },
        }],
      // 预览数据,以原始数据为基础产生不同变化
      dataSource: [],
      // 原始数据,需要一直保留
      baseDataSource: [],
    }
  }

  componentWillMount() {
    this.getTableList();
  }
  getTableList(){
    const serialNumbers = this.props.serialNumbers;
    const pager = {page:0,perPage:0,serialNumber:serialNumbers,isEqual:1};
    this.list(pager);
  }
  componentWillReceiveProps(nextProps) {
    // 检查是否需要重新渲染 table
    if(!this.props.changeTable && nextProps.changeTable) {
      this.setState({loading: true});
      this.changeDataSource(nextProps.values,nextProps.className);
    }
    if(!this.props.getList && nextProps.getList) {
      // 重新拉数据
      this.getTableList();
    }
  }
  list(pager) {
    var self = this;
    this.setState({
      loading: true,
    });
    DeviceService.list(pager)
      .then((data) => {
        self.setState({
          loading: false,
        });
        if (data && data.status == '00') {
          console.log(data);
          const total = data.data.length;
          this.setState({
            total: total,
            baseDataSource: data.data.map((item, key) => {
              item.index = key + 1;
              item.key = item.serialNumber;
              item.className = this.props.className;
              item.firstPulsePrice = (+item.firstPulsePrice)/100;
              item.secondPulsePrice = (+item.secondPulsePrice)/100;
              item.thirdPulsePrice = (+item.thirdPulsePrice)/100;
              item.fourthPulsePrice = (+item.fourthPulsePrice)/100;
              return item;
            })
          });
          // 重置父组件拉数据的请求
          this.props.hasGetList();
        } else {
          message.info(data.msg);
        }
      })
  }
  changeDataSource(values,className) {
    const baseDataSource = this.state.baseDataSource;
    let newDataSource = [];
    console.log(values);
    for(let i = 0;i < baseDataSource.length;i++) {
      const item = baseDataSource[i];
      newDataSource[i] = {
        index: item.index,
        serialNumber: item.serialNumber,
        schoolName: values.schoolId?values.schoolId.label:item.schoolName,
        address: values.address?values.address:item.address,
        firstPulseName: values.firstPulseName?values.firstPulseName:item.firstPulseName,
        secondPulseName: values.secondPulseName?values.secondPulseName:item.secondPulseName,
        thirdPulseName: values.thirdPulseName?values.thirdPulseName:item.thirdPulseName,
        fourthPulseName: values.fourthPulseName?values.fourthPulseName:item.fourthPulseName,
        firstPulsePrice: values.firstPulsePrice?values.firstPulsePrice/100:item.firstPulsePrice/100,
        secondPulsePrice: values.secondPulsePrice?values.secondPulsePrice/100:item.secondPulsePrice/100,
        thirdPulsePrice: values.thirdPulsePrice?values.thirdPulsePrice/100:item.thirdPulsePrice/100,
        fourthPulsePrice: values.fourthPulsePrice?values.fourthPulsePrice/100:item.fourthPulsePrice/100,
        className: className,
      }
    }
    this.setState({dataSource: newDataSource});
    this.props.hasChangedTable();
    setTimeout(function() { this.setState({loading: false}); }.bind(this), 100);
  }
  render() {
    return (
      <div>
        <Table
          scroll={{ x: 700, y: 300 }}
          dataSource={this.state.dataSource.length==0?this.state.baseDataSource:this.state.dataSource}
          columns={this.state.columns}
          pagination={false}
          bordered
          loading={this.state.loading}/>
      </div>
    );
  }
}

export default DeviceTable;
