import React from 'react';
import _ from 'underscore';

import '../../../../../css/slick/slick.less';
import '../../../../../css/slick/slick-theme.less';
import './app.less';

import Detail from '../detail/app.jsx';
import Slider from 'react-slick';

import emitter from '../../../library/emitter/emitter.js';
import AppService from '../../../service/app';

const App = React.createClass({
  getInitialState() {
    return ({
      deviceData: {},         //设备数据
      goodsList: [],          //商品信息列表
      isAutoPlay: true,       //slide是否自动播放
      initialSlide: 0         //初始第几张slide
    })
  },
  componentWillMount(){
    let self = this;
    this.eventOn();
    this.ininAjax();
  },
  eventOn() {
    let self = this;
    emitter.on("change_slick_isAutoPlay", (data) => {
      console.log(data)
      this.setState({
        isAutoPlay: data.isAutoPlay,
        initialSlide: self.state.initialSlide
      })
    })
  },
  ininAjax() {
    let self = this;
    AppService.getDevice().then((res) => {
      self.setState({
        deviceData: res.data
      })
    })
    AppService.getGoodsBasic().then((res) => {
      self.setState({
        goodsList: res.data
      })
    })
  },
  showDetail(index) {
    let self = this;
    emitter.emit("change_detail_status", {
      detailStatus: "show",
      detailData: self.state.goodsList[index]
    });

    this.setState({
      isAutoPlay: false,
      initialSlide: index
    })
  },
  render() {
    let self = this;
    let goodsList = this.state.goodsList || [];
    let deviceData = this.state.deviceData;
    let deviceName = deviceData.hall?deviceData.hall.name:"";
    let goodsDiv = goodsList.map(function(object, i){
      return (
        <div key={i} onClick={_.bind(self.showDetail, self, i)}>
          <div className="slick_body">
            <div className="lf">
              <img src={object.cover} />
            </div>
            <div className="rg">
              <p className="p1">{object.name}</p>
              <p className="p2">{object.description}</p>
              <p className="p3">￥{object.selling_price}</p>
              <p className="p4">￥{object.original_price}</p>
              <p className="btn">立即购买</p>
            </div>
          </div>
        </div>
      )
    });
    let isAutoPlay = this.state.isAutoPlay;
    let initialSlide = this.state.initialSlide;
    let settings = {
      className: 'center',
      centerMode: true,
      infinite: true,
      speed: 500,
      centerPadding: '7.5%',
      slidesToShow: 1,
      autoplay: isAutoPlay,
      autoplaySpeed: 4000,
      initialSlide: initialSlide,
      dots: true
    };
    let sliderDiv = goodsList.length === 0 ? '' :
    (
      <Slider key={+new Date()} ref='slider' {...settings}>
        {goodsDiv}
      </Slider>
    )

    return (
      <div className="home">
        <div className="slick_time">
          <p>59秒后停止下单</p>
        </div>
        {sliderDiv}
        <div className="slick_foot">
          <div className="msg">{deviceName}{deviceData.row_name}{deviceData.column_name}</div>
          <div className="tip">1个订单正在配送中</div>
        </div>
      </div>
    );
  }
});

export default App;
