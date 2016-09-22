import React from 'react';
import './app.less';
import classNames from 'classnames';
import {Icon, Table, Button, Input, Modal, message, Select} from 'antd';
import emitter from '../../library/emitter/emitter.js';
import Service from '../../service/index.js';

const Option = Select.Option;
const InputGroup = Input.Group;

function handleChange(value) {
  console.log(`selected ${value}`);
}

const SearchInput = React.createClass({
  getInitialState() {
    return {
      value: '',
      focus: false,
    };
  },
  handleInputChange(e) {
    this.setState({
      value: e.target.value,
    });
  },
  handleFocusBlur(e) {
    this.setState({
      focus: e.target === document.activeElement,
    });
  },
  handleSearch() {
    if (this.props.onSearch) {
      this.props.onSearch(this.state.value);
    }
  },
  render() {
    const { style, size, placeholder } = this.props;
    const btnCls = classNames({
      'ant-search-btn': true,
      'ant-search-btn-noempty': !!this.state.value.trim(),
    });
    const searchCls = classNames({
      'ant-search-input': true,
      'ant-search-input-focus': this.state.focus,
    });
    return (
      <div className="ant-search-input-wrapper" style={style}>
        <InputGroup className={searchCls}>
          <Input placeholder={placeholder} value={this.state.value} onChange={this.handleInputChange}
            onFocus={this.handleFocusBlur} onBlur={this.handleFocusBlur} onPressEnter={this.handleSearch}
          />
          <div className="ant-input-group-wrap">
            <Button icon="search" className={btnCls} size={size} onClick={this.handleSearch} />
          </div>
        </InputGroup>
      </div>
    );
  },
});

const App = React.createClass({
	getInitialState() {
    return {
      modalVisible: false,
      tradeList: []
    };
  },
  componentWillMount(){
    const self = this;
    emitter.removeListener("change_header_datePickerVal")
    emitter.on("change_header_datePickerVal", (data) => {
    	//console.log("detail", data);
    })
    clearInterval(window.indexTimeout);
    
    self.initAJax()
  },
  initAJax() {
  	const self = this;
  	const hallId = self.props.location.query.hallId;
  	const scheduleId = self.props.location.query.scheduleId;
  	Service.getDetailTradeList(hallId).then((res) => {
  		if(res.status === "01030200"){
  			self.setState({tradeList: res.data});
  		}else{
  			message.info(res.msg);
  		}
  	})
  },
	setModalVisible(modalVisible) {
    this.setState({ modalVisible });
  },
  selectChange(value) {
  	console.log(value)
  },
  render() {
  	const self = this;
  	const columns = [{
		  title: '订单号',
		  dataIndex: 'trade_no'
		}, {
		  title: '影院座位号',
		  dataIndex: 'device',
		}, {
		  title: '下单时间',
		  dataIndex: 'created_at',
		}, {
		  title: '出货',
		  dataIndex: 'status',
		}, {
		  title: '打印小票',
		  dataIndex: 'printStatus',
		}, {
		  title: '出票时间',
		  dataIndex: 'printTicketTime',
		}, {
		  title: '商品详情',
		  dataIndex: 'goodsDetail',
		}, {
		  title: '数量',
		  dataIndex: 'goodsCount',
		}, {
		  title: '价格',
		  dataIndex: 'goodsPrize',
		}, {
		  title: '配送状态',
		  dataIndex: 'sendStatus',
		}];
		const tradeList = self.state.tradeList;
		let tableData = [];
		for(let i=0; i<tradeList.length; i++){
			tableData.push({
				key: i,
				trade_no: tradeList[i].trade_no,
				device: tradeList[i].device,
				created_at: tradeList[i].created_at,
				status: tradeList[i].status,
				printStatus: "",
				printTicketTime: "--",
				goodsDetail: "--",
				goodsCount: "--",
				goodsPrize: "--",
				sendStatus: "--"
			})
		}
		// 通过 rowSelection 对象表明需要行选择
		const rowSelection = {
		  onChange(selectedRowKeys, selectedRows) {
		    console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
		  },
		  onSelect(record, selected, selectedRows) {
		    console.log(record, selected, selectedRows);
		  },
		  onSelectAll(selected, selectedRows, changeRows) {
		    console.log(selected, selectedRows, changeRows);
		  },
		};

		const pagination = {
		  total: tableData.length,
		  showSizeChanger: true,
		  onShowSizeChange(current, pageSize) {
		    console.log('Current: ', current, '; PageSize: ', pageSize);
		  },
		  onChange(current) {
		    console.log('Current: ', current);
		  },
		};

  	const hallId = this.props.params.hallId;
    return (
      <div className="detail">
        <div className="head">
        	<div className="lf"><a href="#/" style={{color: "#000"}}>主页</a> 〉{hallId}号厅</div>
        	<div className="rg">
        		<SearchInput placeholder="输入订单号或座位号查询"
   				 		onSearch={value => console.log(value)} style={{ width: 200 }} />
   				 	<Select defaultValue="lucy" style={{ width: 120 }} onChange={self.selectChange}>
				      <Option value="jack">Jack</Option>
				      <Option value="lucy">Lucy</Option>
				      <Option value="disabled">Disabled</Option>
				      <Option value="yiminghe">yiminghe</Option>
				    </Select>
				  </div>
        </div>
        <div className="table">
        	<Table rowSelection={rowSelection} columns={columns} dataSource={tableData} pagination={pagination} />
        </div>
        <div className="btn">
        	<Button type="primary" onClick={() => this.setModalVisible(true)}>退款</Button>
	        <Modal
	          title="退款说明"
	          wrapClassName="vertical-center-modal"
	          visible={this.state.modalVisible}
	          onOk={() => this.setModalVisible(false)}
	          onCancel={() => this.setModalVisible(false)}
	        >
	          <p>对话框的内容</p>
	          <p>对话框的内容</p>
	          <p>对话框的内容</p>
	        </Modal>
    			<Button type="primary" disabled>打印小票</Button>
        </div>
      </div>
    );
  }
});

export default App;
