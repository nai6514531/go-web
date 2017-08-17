import React from 'react';
import Promise from 'bluebird'
import _ from 'underscore';
import moment from 'moment';

import { Button, Radio, Input, Icon, message, Modal, Row, Col, Form, Spin } from 'antd';
const createForm = Form.create;
const FormItem = Form.Item;
const RadioGroup = Radio.Group;
import QRCode from 'qrcode'
import { isProduction } from '../../../library/debug'
const defaultUrl = isProduction ? 'http://m.sodalife.xyz/act/relate-wechat' : 'http://m.sodalife.club/act/relate-wechat';

class Alipay extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      showAccountTip: false,
      showAccountNameTip: false
    }
  }
  render() {
    const cashAccount = this.props.cashAccount
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = this.props.formItemLayout
    return <div>
      <div className="form-wrapper">
        <FormItem
          {...formItemLayout}
          label="支付宝账号">
          {getFieldDecorator('alipayAccount', {
            rules: [
              {required: true,  message: '必填'},
              { max:30, message: '不超过三十个字'},
            ],
            initialValue: cashAccount.type === 1 ? cashAccount.account : '',

          })(
            <div className='input-wrapper'>
              <Input placeholder="需要确认是邮箱还是手机号" />
              <Button className="button-style" type="primary" onClick={() => { this.setState({ showAccountTip: true })}}>查看示例</Button> 
            </div> 
          )}
        </FormItem>       
      </div>
      <div className="form-wrapper">
        <FormItem
          {...formItemLayout}
          label="真实姓名">
          {getFieldDecorator('alipayName', {
            rules: [
              {required: true, message: '必填'},
              {max:30, message: '不超过三十个字'},
            ],
            initialValue: cashAccount.type === 1 ? cashAccount.realName : '',

          })(
            <div className='input-wrapper'>
              <Input placeholder="必须为实名认证过的姓名" />
              <Button type="primary" className="button-style" onClick={() => { this.setState({ showAccountNameTip: true })}}>查看示例</Button>
            </div>
          )}
        </FormItem>  
      </div>
      <Modal title="示例图片"
        footer={null}
        visible={this.state.showAccountTip}
        onCancel={() => { this.setState({ showAccountTip: false })}}
        style={{textAlign:'center'}}>
        <img src={require("../../../../../img/app/account_demo.png")} width="70%"/>
     </Modal>
     <Modal title="示例图片" 
        footer={null}
        visible={this.state.showAccountNameTip}
        onCancel={() => { this.setState({ showAccountNameTip: false })}}
        style={{textAlign:'center'}}>
        <img src={require("../../../../../img/app/name_demo.png")} width="70%"/>
     </Modal>
    </div>
  }
}

class Wechat extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      showIdentification: false,
      qrCodeUrl: ''
    }
  }
  initQRCode(key) {
    const self = this;
    key = key || '';
    const url = defaultUrl + `?key=${key}`;
    QRCode.toDataURL(url, function (err, url) {
      self.setState({qrCodeUrl: url})
    })
  }
  identification() {
    this.setState({ showIdentification: true })
  }
  componentWillUpdate(nextProps, nextState) {
    const self = this;
    if (nextProps.wechat.key !== this.props.wechat.key) {
      self.initQRCode(nextProps.wechat.key)
    }
  }
  componentDidMount() {
    this.initQRCode()
  }
  render() {
    const { wechat, user } = this.props;
    const cashAccount = this.props.cashAccount;
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = this.props.formItemLayout;
    const nickName = wechat.name || user.nickName;
    return <div>
      <div className="form-wrapper">
        <FormItem {...formItemLayout} label="扫码验证身份" >
          <div ref="qrcode" className={this.props.keyLoading ? 'code loading' : 'code' } id="canvas">
            <img src={this.state.qrCodeUrl} width='160' />
            { this.props.keyLoading ? <Spin className='key-loading' /> : null }
          </div> 
          { 
            !!wechat.name || (!wechat.key && cashAccount.type === 2) ? <div className="code-tip">
              <Icon type='check-circle' className='icon success' /> 
              <span>{'关联成功（你将使用昵称为' + nickName || ' ' + '的微信收款。如需更换账号请'} <i className='reset-wechat' onClick={this.props.resetWechatKey}>刷新</i>二维码，用新微信号扫描）</span>
            </div> :
            <div className="code-tip">
              <Icon type='exclamation-circle' className='icon info' />
              <span>请使用你作为收款用途的微信扫描二维码进行关联，申请提现后，
              款项会在规定时间内打入微信账户。</span>
              <p>请确保自己的微信已实名认证<span className='check-wechat' onClick={this.identification.bind(this)}>如何认证?</span></p>
            </div> 
          }
        </FormItem>
      </div>
      <FormItem
        {...formItemLayout}
        label="微信已验证姓名">
        {getFieldDecorator('wechatName', {
          rules: [
            {required: true, message: '必填'},
            {max:30, message: '不超过三十个字'},
          ],
          initialValue: cashAccount.type === 2 ? cashAccount.realName : '',

        })(
          <Input placeholder="如：张三"/>
        )}
      </FormItem>
      <Modal title="如何认证" 
        footer={null}
        visible={this.state.showIdentification}
        onCancel={() => { this.setState({ showIdentification: false })}}
        style={{textAlign:'center'}}>
        <img src={require("../../../../../img/app/name_demo.png")} width="70%"/>
     </Modal>
    </div>
  }
}

export {
  Alipay,
  Wechat
}