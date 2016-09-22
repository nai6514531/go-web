import './app.less';
import React from 'react';
import {Icon, Table, Button, message} from 'antd';
import moment from 'moment';
import emitter from '../../library/emitter/emitter.js';
import Service from '../../service/index.js';
import _ from 'underscore';

import Printer from './printer.js';

const App = React.createClass({
	getInitialState() {
		return {
			tableList: [],						//厅表格数据
			nowTime: new Date().getTime(),						//当前时间， 每一秒更新一次		
			datePickerVal: ""
		}
	},
	componentWillMount(){
    let self = this;
    emitter.removeListener("change_header_datePickerVal")
    emitter.on("change_header_datePickerVal", (data) => {
    	self.setState({datePickerVal: data.datePickerVal})
    })

    self.initAjax();
  },
  initAjax() {
  	let self = this;
  	Service.getTradeList().then((res) => {
  		if(res.status === "01060300"){
  			let newTableList = self.getNewTableList(res.data); //转化接口数据，转成table需求的数据
  			self.setState({tableList: newTableList})
  		}else{
  			message.info(res.msg);
  		}
  	})
  },
  getNewTableList(hallList) {
  	let self = this;
		let tableList = [];
		let scheduleData = {};  //转化成排期集合
		for(let i=0; i< hallList.length; i++){
			let scheduleId = hallList[i].schedule_id;
			if(!scheduleData[hallList[i].schedule_id]){
				scheduleData[hallList[i].schedule_id] = {};
				scheduleData[hallList[i].schedule_id].list = [];
			}
			scheduleData[hallList[i].schedule_id].list.push(hallList[i]);
		}
		for(let i in scheduleData){  //排期集合里面添加厅集合
			for(let j=0; j<scheduleData[i].list.length; j++){
					let hallId = scheduleData[i].list[j].hall_id;
				if( !scheduleData[i][hallId] ){
					scheduleData[i][hallId] = [];
				}
				scheduleData[i][hallId].push(scheduleData[i].list[j]);
			}
		}
		for(let i in scheduleData){
			for(let j in scheduleData[i]){
				if(j === "list"){ continue; }
				//把scheduleData填进表格数据
				tableList.push({
			    hall: scheduleData[i][j][0].hall.name,
			    date: {
			    	flimName: scheduleData[i][j][0].schedule.name,
			    	show_at: scheduleData[i][j][0].schedule.show_at
			    },
			    ticket: {
			    	orderList: scheduleData[i][j]
			    },
			    order: {
			    	orderList: scheduleData[i][j]
			    },
			    send: {
			    	hallId: "",
			    	sendStatus: false
			    },
			  });
			}
		}

		//console.log(scheduleData)
		return tableList;
  },
  printTicket(orderList) {
  	
  	let tmp = Printer(orderList);
  	console.log(tmp);
  	let newWindow = window.open("printer");
		newWindow.document.write(tmp);
		newWindow.document.close();
		newWindow.print();
		newWindow.close();
  },
  getDifTime(time) {
  	let hours = Math.floor(time/1000/60/60);
  	let minutes = (time - hours*60*60*1000)/1000/60;
  	minutes = Math.floor(minutes)
  	let seconds = (time - hours*60*60*1000 - minutes*60*1000)/1000
  	seconds = Math.floor(seconds)
  	return {
  		hours: hours,
  		minutes: minutes,
  		seconds: seconds
  	}
  },
  goDetail() {
  	let self = this;
  	let datePickerVal = self.state.datePickerVal;
  	window.location.href = "#/detail?scheduleId=33&hallId=2&datePickerVal=" + datePickerVal;
  },
  render() {
  	const self = this;
  	clearInterval(window.indexTimeout);
  	window.indexTimeout = setInterval(()=>{
  		self.setState({nowTime: new Date().getTime()})
		}, 1000)

  	const columns = [{
		  title: '影厅',
		  dataIndex: 'hall'
		}, {
		  title: '放映',
		  dataIndex: 'date',
		  render(data) {
		  	let showTime = parseInt(data.show_at);
		  	let nowTime = self.state.nowTime;
		  	let difTime = showTime*1000 - nowTime;
		  	let newDate = self.getDifTime(difTime);
		  	return (
		  		<div className="td_detail flim_detail">
		  			<p className="p1">{data.flimName}  {moment(showTime).format('HH:mm')}</p>
		  			<p className="p2">距离放映时间还有<span>{newDate.hours + "时" + newDate.minutes + "分" + newDate.seconds + "秒"}</span></p>
		  		</div>
		  	)
		  }
		}, {
		  title: '小票',
		  dataIndex: 'ticket',
		  render(data) {
		  	let printedCount = 0;
		  	let noprintCount = 0;
		  	for(let i=0; i<data.orderList.length; i++){
		  		if(data.orderList[i].status == 1){
		  			noprintCount += 1;
		  		}
		  		if(data.orderList[i].status == 2){
		  			printedCount += 1;
		  		}
		  	}
		  	return (
		  		<div className="td_detail ticket_detail">
		  			<p className="p1">已出小票：{printedCount}</p>
		  			<p className="p2">未出小票：{noprintCount}</p>
		  		</div>
		  	)
		  }
		}, {
		  title: '订单',
		  dataIndex: 'order',
		  render(data) {
		  	let newCount = 0;
		  	for(let i=0; i<data.orderList.length; i++){
		  		if(data.orderList[i].status == 1){
		  			newCount += 1;
		  		}
		  	}
		  	return (
		  		<div className="td_detail ticket_detail">
		  			<p className="p1">{newCount}个新订单</p>
		  			<Button className="" type="primary" onClick={_.bind(self.printTicket, self, data.orderList)}>打印小票</Button>
		  		</div>
		  	)
		  }
		}, {
		  title: '配送',
		  dataIndex: 'send',
		  render(data) {
		  	return (
		  		<div className="td_detail send_detail">
		  			<p className="p1"><a href="javascript:void(0)" onClick={self.goDetail}>查看详情</a></p>
		  			<Button type="primary" disabled={data.sendStatus?"disabled":""}>配送完成</Button>
		  		</div>
		  	)
		  }
		}];
		const tableList = self.state.tableList.length < 1? []:self.state.tableList;

		const pagination = {
		  total: tableList.length,
		  showSizeChanger: true,
		  onShowSizeChange(current, pageSize) {
		    console.log('Current: ', current, '; PageSize: ', pageSize);
		  },
		  onChange(current) {
		    console.log('Current: ', current);
		  },
		};
    return (
      <div className="index">
        <div className="head">主页</div>
        <div className="table">
        	<Table columns={columns} dataSource={tableList} pagination={pagination} />
        </div>
      </div>
    );
  }
});

export default App;
