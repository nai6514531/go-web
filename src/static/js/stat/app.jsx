import React from "react";
import {Card, Tabs} from "antd";
import "./app.less";
import StatService from "../app/service/stat";
const TabPane = Tabs.TabPane;
const App = React.createClass({
	getInitialState() {
		return {};
	},
	componentDidMount() {
		this.renderRechargeChart();
	},
	renderRechargeChart(){
		var self = this;
		StatService.recharge()
			.then((data) => {
				if (data && data.status == 0) {
					var chart = new G2.Chart({
						id: 'c1',
						width: 1200,
						height: 400
					});
					chart.source(data.data);
					chart.interval().position('month*count').color('month');
					chart.render();
					window.rechargeChart = chart;
				} else {
					alert(data.msg);
				}
			});
	},
	renderConsumeChart(){
		var self = this;
		StatService.consume()
			.then((data) => {
				if (data && data.status == 0) {
					var chart = new G2.Chart({
						id: 'c2',
						width: 1200,
						height: 400
					});
					chart.source(data.data);
					chart.interval().position('month*count').color('month');
					chart.render();
					window.consumeChart = chart;
				} else {
					alert(data.msg);
				}
			});
	},
	renderUserChart(){
		StatService.signInUser()
			.then((data) => {
				if (data && data.status == 0) {
					data=data.data;
					var chart = new G2.Chart({
						id: 'c3',
						width: 1200,
						height: 400
					});
					// g-plugin-range 只支持数值类型的数据排序，所以将时间统一转换为时间戳
					for (var i = 0; i < data.length; i++) {
						var item = data[i];
						var time = item.date;
						item.date = new Date(time).getTime();
					}
					chart.source(data, {
						date: {
							type: 'time',
							mask: 'yyyy-mm-dd',
							tickCount: 7,
							alias: '日期',
							nice: false
						},
						count: {
							min: 0,
							ticks: [0, 500, 1000, 1500, 2000, 3000, 5000],
							alias: '注册用户数'
						}
					});
					chart.axis('count', {
						grid: null
					});
					chart.line().position('date*count');
					chart.guide().rect(['min', 0], ['max', 500], {
						fill: '#5AC405',
						fillOpacity: 0.4
					});
					chart.guide().rect(['min', 500], ['max', 1000], {
						fill: '#F9C709',
						fillOpacity: 0.4
					});
					chart.guide().rect(['min', 1000], ['max', 1500], {
						fill: '#FD942C',
						fillOpacity: 0.4
					});
					chart.guide().rect(['min', 1500], ['max', 2000], {
						fill: '#e4440D',
						fillOpacity: 0.4
					});
					chart.guide().rect(['min', 2000], ['max', 3000], {
						fill: '#810043',
						fillOpacity: 0.4
					});
					chart.guide().rect(['min', 3000], ['max', 5000], {
						fill: '#45001B',
						fillOpacity: 0.4
					});
					var range = new G2.Plugin.range({
						id: "range",
						width: '90%',
						height: 26,
						dim: 'date',
						start: new Date('2016-05-01').getTime(),
						end: new Date('2016-10-27').getTime(),
					});
					range.source(data);
					range.link(chart);
					range.render();
					window.userChart = chart;
				} else {
					alert(data.msg);
				}
			});

	},
	tabChange(key){
		var self = this;
		if (key == 2) {
			if (!window.consumeChart) {
				setTimeout(function () {
					self.renderConsumeChart()
				}, 1500)
			}
		} else if (key == 3) {
			if (!window.userChart) {
				setTimeout(function () {
					self.renderUserChart()
				}, 1500)
			}
		}
	},
	render(){
		return (<Tabs defaultActiveKey="1" onChange={this.tabChange} style={{margin: "50px auto", width: 1200}}>
			<TabPane tab="独立充值" key="1">
				<div id="c1"></div>
			</TabPane>
			<TabPane tab="独立消费" key="2">
				<div id="c2"></div>
			</TabPane>
			<TabPane tab="注册用户" key="3">
				<div id="c3">
					<div id="range" style={{margin: "10px auto"}}></div>
				</div>
			</TabPane>
		</Tabs>);
	}
});

export default App;
