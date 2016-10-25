import React from "react";
import {Card} from "antd";
import "./app.less";
import DailyBillService from "../app/service/daily_bill";
var G2 = require('g2');
const App = React.createClass({
	getInitialState() {
		return {};
	},
	componentDidMount() {
		this.renderRechargeChart()
		this.renderConsumeChart()
	},
	renderRechargeChart(){
		DailyBillService.recharge()
			.then((data) => {
				if (data && data.status == 0) {
					var chart = new G2.Chart({
						id: 'c1',
						width: 800,
						height: 400
					});
					chart.source(data.data);
					chart.interval().position('month*count').color('month');
					chart.render();
				} else {
					alert(data.msg);
				}
			});
	},
	renderConsumeChart(){
		DailyBillService.consume()
			.then((data) => {
				if (data && data.status == 0) {
					var chart = new G2.Chart({
						id: 'c2',
						width: 800,
						height: 400
					});
					chart.source(data.data);
					chart.interval().position('month*count').color('month');
					chart.render();
				} else {
					alert(data.msg);
				}
			});
	},
	render(){
		return (<section className="view-settlement-list">
			<Card title="独立充值" style={{ margin: "20px auto",width:900}}>
				<div id="c1"></div>
			</Card>
			<Card title="独立消费" style={{ margin: "20px auto",width:900}}>
				<div id="c2"></div>
			</Card>
		</section>);
	}
});

export default App;
