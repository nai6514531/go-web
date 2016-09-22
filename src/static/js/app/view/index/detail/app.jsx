import React from 'react';
import _ from 'underscore';
import emitter from '../../../library/emitter/emitter.js';

import './app.less';
import AppService from '../../../service/app';

const App = React.createClass({
  getInitialState() {
    return({
      detailStatus: "hide",         //详情显示状态
      moveStatus: 0,                //详情和微信切换状态
      detailData: '',               //详情数据
      favorNum: 0,                  //喜好默认值
      favorList: [],                //喜好列表
      copies: 1,                    //份数
      copiesList: [1, 2, 3, 4, 5]   //份数数组列表
    })
  },
  componentWillMount(){
    let self = this;
    emitter.on("change_detail_status", function(data){
      self.setState({
        detailStatus: data.detailStatus,
        detailData: data.detailData || '',
        copies: 1,
        moveStatus: 0
      });

      if(data.detailStatus === "show"){
        self.initAjax(data.detailData.id);
      }
    })
    
  },
  initAjax(goodsId) {
    let self = this;
    AppService.getGoodsFavor(goodsId).then((res) => {
      if(res.status === "01040200"){
        self.setState({favorList: res.data});
      }else{
        emitter.emit('change_alert_status', {msg: res.msg})
      }
    })
  },
  close(){
    emitter.emit("change_detail_status", {detailStatus: "hide"});
    emitter.emit('change_slick_isAutoPlay', {isAutoPlay: true});
  },
  changeFavor(index) {
    this.setState({favorNum: index})
  },
  changeCopies(index) {
    this.setState({copies: index});
  },
  turnWechat() {
    this.setState({moveStatus: 1})
  },
  turnList() {
    this.setState({moveStatus: 2})
  },
  render() {
    let self = this;
    let detailStatus = this.state.detailStatus;
    let moveStatus = this.state.moveStatus;
  
    let detailBodyClass;
    if(moveStatus == 1){
      detailBodyClass = "detail_body toWechat";
    }else if(moveStatus == 2){
      detailBodyClass = "detail_body toList";
    }else{
      detailBodyClass = "detail_body";
    }

    let favorNum = this.state.favorNum;
    let favorList = this.state.favorList;
    let favorItemDiv = favorList.map((data, index) => {
      return(
        <div className={index===favorNum?'active':''} key={index} onClick={_.bind(self.changeFavor, self, index)}>{data.name}</div>
      )
    })
    let favorDiv = favorList.length === 0 ? '':
    (
      <div className="choice">
        <h3>喜好</h3>
        <div className="list">
          {favorItemDiv}
        </div>
      </div>
    ) 

    let copies = this.state.copies;
    let copiesList = this.state.copiesList;
    let detailData = this.state.detailData;
    let bodyDiv = detailData === ''? '':
    (
      <div className={detailBodyClass}>
        <div className="flip list">
          <div>
            <div className="head">
              <img src={detailData.cover} />
              <div className="msg">
                <p className="p1">￥{detailData.selling_price}</p>
                <p className="p2">{detailData.name}</p>
                <p className="p3">{detailData.description}</p>
              </div>
            </div>

            {favorDiv}

            <div className="choice acount">
              <h3>数量</h3>
              <div className="list">
                {copiesList.map(function(v, i){
                  return(
                    <div key={v} className={v===copies?'active':''} onClick={_.bind(self.changeCopies, self, v)}>{v}份</div>
                  )
                })}
              </div>
            </div>
            <div className="foot">
              <div className="cost">合计：￥{detailData.selling_price*copies}</div>
              <div className="btn" onClick={this.turnWechat}>立即购买</div>
            </div>
            <div className="closeBtn" onClick={this.close}></div>
          </div>
        </div>
        <div className="flip wechat">
          <div className="body">
            <p className="p1"><img src={require('../../../../../img/app/wechat_logo.jpg')} />微信扫一扫付款</p>
            <p className="p2">￥{detailData.selling_price*copies}</p>
            <img src={require('../../../../../img/app/wechat_code.jpg')} />
            <p className="p3">下单后，配送约3-5分钟</p>
            <p className="p4">现仅支持微信支付</p>
            <div className="btn" onClick={this.close}></div>
          </div>
        </div>
      </div>
    )

    return (
      <div className={detailStatus == 'show'? 'detail' : 'detail hide'}>
        <div className="layer" onClick={this.close}></div>
        <div className={detailStatus == 'show'? 'content animated bounceIn' : 'content hide animated'}>
          {bodyDiv}
        </div>
      </div>
    );
  }
});

export default App;