import React from "react";
import {Collapse, Breadcrumb, Spin} from 'antd';
import keymirror from 'keymirror';
import StatService from "../../service/stat";
import "./app.less";

const _ = require('lodash');
const Highcharts = require('highcharts');
const Highstock = require('highcharts/highstock');
const moment = require('moment');
const Panel = Collapse.Panel;

const PANEL_KEY = keymirror({
  DAILY_BILL: null,
  DAILY_PAY: null,
  RECHARGE: null,
  CONSUME: null,
  USER: null,
})

const App = React.createClass({
  chartKey: [],
  getInitialState() {
    return {
      loading: false,
    };
  },
  renderBarChart(id, categories, _data){
    Highcharts.chart(id, {
      chart: {
        type: 'bar'
      },
      title: {
        text: ''
      },
      xAxis: {
        categories: categories,
        title: {
          text: ''
        }
      },
      yAxis: {
        min: 0,
        title: {
          text: '',
          align: 'high'
        },
        labels: {
          overflow: 'justify'
        }
      },
      tooltip: {
        valueSuffix: ' 位'
      },
      plotOptions: {
        bar: {
          dataLabels: {
            enabled: true
          }
        }
      },
      legend: {
        layout: 'vertical',
        align: 'right',
        verticalAlign: 'top',
        x: -40,
        y: 80,
        floating: true,
        borderWidth: 1,
        backgroundColor: ((Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF'),
        shadow: true
      },
      credits: {
        enabled: false
      },
      series: [{
        name: '用户数',
        data: _data
      }]
    });
  },
  renderDailyPayChart(){
    StatService.dailyPay()
      .then((body) => {
        if (body && body.status == 0) {
          const data = body.data || {};
          const dates = _.chain([_.map(data.alipay, 'date'), _.map(data.bank, 'date')]).flatten().uniq().value();
          const alipay = _.map(dates, (date) => {
            const item = _.find(data.alipay || [], { date }) || {};
            return item.amount || 0;
          });
          const bank = _.map(dates, (date) => {
            const item = _.find(data.bank || [], { date }) || {};
            return item.amount || 0;
          });
          Highcharts.chart('daily-pay', {
            chart: {
              type: 'bar'
            },
            title: {
              text: ''
            },
            xAxis: {
              categories: dates
            },
            yAxis: {
              min: 0,
              title: {
                text: ''
              }
            },
            legend: {
              reversed: false
            },
            plotOptions: {
              bar: {
                dataLabels: {
                  enabled: true
                },
                enableMouseTracking: false
              },
              series: {
                stacking: 'normal'
              }
            },
            series: [{
              name: '银行卡结账总金额',
              data: bank
            }, {
              name: '支付宝结账总金额',
              data: alipay
            }]
          });
        } else {
          alert(body.msg);
        }
      });
  },
  renderDailyBillChart(){
    StatService.dailyBill()
      .then((body) => {
        if (body && body.status == 0) {
          const data = body.data || {};
          const dates = _.chain([_.map(data.all, 'date'), _.map(data.alipay, 'date'), _.map(data.wechat, 'date')]).flatten().uniq().value();
          const all = _.map(dates, (date) => {
            const item = _.find(data.all || [], { date }) || {};
            return item.amount || 0;
          });
          const alipay = _.map(dates, (date) => {
            const item = _.find(data.alipay || [], { date }) || {};
            return item.amount || 0;
          });
          const wechat = _.map(dates, (date) => {
            const item = _.find(data.wechat || [], { date }) || {};
            return item.amount || 0;
          });
          Highcharts.chart('daily-bill', {
            chart: {
              type: 'bar'
            },
            title: {
              text: ''
            },
            xAxis: {
              categories: dates
            },
            yAxis: {
              min: 0,
              title: {
                text: ''
              }
            },
            legend: {
              reversed: false
            },
            plotOptions: {
              bar: {
                dataLabels: {
                  enabled: true
                },
                enableMouseTracking: false
              },
              series: {
                stacking: 'normal'
              }
            },
            series: [{
              name: '每日消费账单总金额',
              data: all
            }, {
              name: '微信充值总金额',
              visible: false,
              data: wechat
            }, {
              name: '支付宝充值总金额',
              visible: false,
              data: alipay
            }]
          });
        } else {
          alert(data.msg);
        }
      });
  },
  renderRechargeChart(){
    var self = this;
    StatService.recharge()
      .then((body) => {
        if (body && body.status == 0) {
          const categories = [];
          const _data = [];
          _.each(body.data || [], function (v) {
            categories.push(v.month);
            _data.push(v.count);
          });
          self.renderBarChart('recharge', categories, _data);
        } else {
          alert(body.msg);
        }
      });
  },
  renderConsumeChart(){
    var self = this;
    StatService.consume()
      .then((body) => {
        if (body && body.status == 0) {
          const categories = [];
          const _data = [];
          _.each(body.data || [], function (v) {
            categories.push(v.month);
            _data.push(v.count);
          });
          self.renderBarChart('consume', categories, _data);
        } else {
          alert(body.msg);
        }
      });
  },
  renderUserChart(){
    var self = this;
    StatService.signInUser()
      .then((body) => {
        if (body && body.status == 0) {
          const _data = [];
          _.each(body.data || [], function (v) {
            _data.push([moment(v.date).toDate().getTime(), v.count])
          });
          console.info(_data)
          Highstock.stockChart('user', {
            chart: {
              height: 400
            },
            title: {
              text: ''
            },
            subtitle: {
              text: ''
            },
            rangeSelector: {
              selected: 1
            },
            series: [{
              name: '新注册用户',
              data: _data,
              type: 'area',
              threshold: null,
              tooltip: {
                valueDecimals: 0
              }
            }],
            responsive: {
              rules: [{
                condition: {
                  maxWidth: 500
                },
                chartOptions: {
                  chart: {
                    height: 300
                  },
                  subtitle: {
                    text: null
                  },
                  navigator: {
                    enabled: false
                  }
                }
              }]
            }
          });
        } else {
          alert(body.msg);
        }
      });

  },
  componentDidMount(){
    this.renderDailyPayChart()
  },
  onChange(key){
    if (~_.indexOf(this.chartKey, key)) {
      return false;
    }
    this.chartKey.push(key);
    if (key == PANEL_KEY.DAILY_PAY) {
      return this.renderDailyPayChart();
    }
    if (key == PANEL_KEY.DAILY_BILL) {
      return this.renderDailyBillChart();
    }
    if (key == PANEL_KEY.RECHARGE) {
      return this.renderRechargeChart();
    }
    if (key == PANEL_KEY.CONSUME) {
      return this.renderConsumeChart();
    }
    if (key == PANEL_KEY.USER) {
      return this.renderUserChart();
    }
  },
  render(){
    const self = this;
    return (<section className="view-stat">
      <header>
        <Breadcrumb>
          <Breadcrumb.Item>数据统计</Breadcrumb.Item>
        </Breadcrumb>
      </header>
      <Collapse accordion defaultActiveKey={ PANEL_KEY.DAILY_PAY } onChange={this.onChange}>
        <Panel header="每日结账" key={PANEL_KEY.DAILY_PAY}>
          <div id="daily-pay" className="spin-loading">
            <Spin tip="正在计算中，请稍后...">
            </Spin>
          </div>
        </Panel>
        <Panel header="每日经营" key={PANEL_KEY.DAILY_BILL}>
          <div id="daily-bill" className="spin-loading">
            <Spin tip="正在计算中，请稍后...">
            </Spin>
          </div>
        </Panel>
        <Panel header="独立充值" key={PANEL_KEY.RECHARGE}>
          <div id="recharge" className="spin-loading">
            <Spin tip="正在计算中，请稍后...">
            </Spin>
          </div>
        </Panel>
        <Panel header="独立消费" key={PANEL_KEY.CONSUME}>
          <div id="consume" className="spin-loading">
            <Spin tip="正在计算中，请稍后...">
            </Spin>
          </div>
        </Panel>
        <Panel header="注册用户" key={PANEL_KEY.USER}>
          <div id="user" className="spin-loading">
            <Spin tip="正在计算中，请稍后...">
            </Spin>
          </div>
        </Panel>
      </Collapse>
    </section>);
  }
});

export default App;
