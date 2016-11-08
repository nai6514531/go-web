import React from "react";
import {Collapse, Breadcrumb, Spin} from 'antd';
const Panel = Collapse.Panel;
import "./app.less";
const _ = require('lodash');
var Highcharts = require('highcharts');
var Highstock = require('highcharts/highstock');
import StatService from "../../service/stat";
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
  renderRechargeChart(){
    var self = this;
    StatService.recharge()
      .then((data) => {
        if (data && data.status == 0) {
          const categories = [];
          const _data = [];
          _.each(data.data || [], function (v) {
            categories.push(v.month);
            _data.push(v.count);
          });
          self.renderBarChart('recharge', categories, _data);
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
          const categories = [];
          const _data = [];
          _.each(data.data || [], function (v) {
            categories.push(v.month);
            _data.push(v.count);
          });
          self.renderBarChart('consume', categories, _data);
        } else {
          alert(data.msg);
        }
      });
  },
  renderUserChart(){
    var self = this;
    StatService.signInUser()
      .then((data) => {
        if (data && data.status == 0) {
          const _data = [];
          _.each(data.data || [], function (v) {
            _data.push([new Date(v.date).getTime(), v.count])
          });
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
                valueDecimals: 2
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
          alert(data.msg);
        }
      });

  },
  renderDailBillChart(){
    StatService.dailyBill()
      .then((data) => {
        if (data && data.status == 0) {
          const categories = [];
          const bill = data.data.bill || [];
          const weChatBill = data.data.weChatBill || [];
          const aliPayBill = data.data.aliPayBill || [];
          const billData = [];
          const weChatData = [];
          const aliPayData = [];
          _.each(bill || [], function (v) {
            categories.push(v.date);
            billData.push(v.count);
          });
          _.each(weChatBill || [], function (v) {
            weChatData.push(v.count);
          });
          _.each(aliPayBill || [], function (v) {
            aliPayData.push(v.count);
          });
          Highcharts.chart('daily-bill', {
            chart: {
              type: 'bar'
            },
            title: {
              text: ''
            },
            xAxis: {
              categories: categories
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
              data: billData
            }, {
              name: '微信充值总金额',
              visible: false,
              data: weChatData
            }, {
              name: '支付宝充值总金额',
              visible: false,
              data: aliPayData
            }]
          });
        } else {
          alert(data.msg);
        }
      });
  },
  componentDidMount(){
    this.renderDailBillChart()
  },
  onChange(key){
    if (_.indexOf(this.chartKey, key) >= 0) {
      return false;
    }
    this.chartKey.push(key);
    if (key == 2) {
      this.renderRechargeChart()
    } else if (key == 3) {
      this.renderConsumeChart()
    } else if (key == 4) {
      this.renderUserChart()
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
      <Collapse accordion defaultActiveKey="1" onChange={this.onChange}>
        <Panel header={'每日账单'} key="1">
          <div id="daily-bill" className="spin-loading">
            <Spin tip="正在计算中，请稍后...">
            </Spin>
          </div>
        </Panel>
        <Panel header={'独立充值'} key="2">
          <div id="recharge" className="spin-loading">
            <Spin tip="正在计算中，请稍后...">
            </Spin>
          </div>
        </Panel>
        <Panel header={'独立消费'} key="3">
          <div id="consume" className="spin-loading">
            <Spin tip="正在计算中，请稍后...">
            </Spin>
          </div>
        </Panel>
        <Panel header={'注册用户'} key="4">
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
