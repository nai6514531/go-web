import React from 'react';
import Promise from 'bluebird'
import _ from 'underscore';
import moment from 'moment';
import op from 'object-path';

import { Button, Radio, Input, Icon, message, Modal, Row, Col, Form, Spin } from 'antd';
const createForm = Form.create;
const FormItem = Form.Item;
const RadioGroup = Radio.Group;
import QRCode from 'qrcode'
import UserService from '../../../service/user';
import WechatService from '../../../service/wechat';

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
          <div>
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
          <div>
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
        </FormItem>
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

class AmountForm extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      keyLoading: false,
      wechat: {
        name: '',
        key: '',
      },
      type: '',
    }
    this.handleSubmit = this.handleSubmit.bind(this);
  }
  handleSubmit(e) {
    e.preventDefault()
    const self = this;
    self.props.form.validateFields((errors, values) => {
      if (errors) {
        return;
      }
      let cashAccount = {};
      const type = parseInt(values.type);
      if (type === 1) {
        cashAccount = {
          "type": type,
          "realName": values.alipayName,
          "account": values.alipayAccount
        }
      } 
       // 当前为修改微信账号状态，且未关联微信
      if (!this.state.wechat.name && !!this.state.wechat.key) {
        return message.error('请使用你作为收款用途的微信扫描二维码进行关联')
      }
      if (type === 2) {
        cashAccount = {
          "type": type,
          "realName": values.wechatName
        }
      }
      self.updateUserAccount(cashAccount)  
    });
  }
  changePayTye(type) {
    const self = this;
    const wechat = this.state.wechat;
    clearInterval(self.timer);
    self.timer = null;
    this.setState({type: type, wechat: {name: '', key: ''}});
    // 选择微信支付账户 且用户默认不是微信支付
    if (type === 2 && this.props.cashAccount.type !== 2) {
      // 获取随机key
      return self.resetWechatKey()
    }
  }
  resetWechatKey() {
    const self = this;
    self.setState({keyLoading: true})
    WechatService.create().then((res) => {
      console.log(res)
      if (res.status !== 0) {
        return new Promise.reject()
      }
      const key = res.data.key
      // 根据key生成二维码
      // self.initQRCode(key)
      self.setState({wechat: {name: '', key: key || ''}, keyLoading: false})
      self.checkWechatKey()
    }).catch(() => {
      self.setState({keyLoading: false})
    })
  }
  checkWechatKey() {
    const self = this;
    const key = self.state.wechat.key;
    clearInterval(self.timer);
    self.timer = null;
    self.timer = setInterval(() => {
      WechatService.getKeyDetail(key).then((res) => {
        console.log(res)
        const status = res.status;
        if (status === 1) {
          clearInterval(self.timer);
          self.timer = null;
          return new Promise.reject()
        }
        if (status === 0) {
          clearInterval(self.timer);
          self.timer = null;
          self.setState({wechat: {...self.state.wechat, name: res.data.wechat.name}})
        }
      }).catch((error) => {
        clearInterval(self.timer);
        self.timer = null;
        console.log(error)
      })
    }, 3000)
  }
  updateUserAccount({ ...options }) {
    const self = this
    let cashAccount = _.chain(this.props.cashAccount).clone().extendOwn({realName: options.realName, account: options.account, type: options.type}).value()
    cashAccount = _.pick(cashAccount, 'type', 'realName', 'account')
    // 微信用户 补充key nickName 
    let user = options.type === 2 ? _.chain(this.props.user).clone().extendOwn({key: this.state.wechat.key, nickName: this.state.wechat.name}).value() : this.props.user
    user = _.pick(user, 'name', 'contact', 'mobile', 'telephone', 'address', 'email', 'key')
    user.cashAccount = cashAccount
    UserService.edit(window.USER.id, user).then((res) => {
      console.log(res)
      if (res.status !== 0) {
        return new Promise.reject(new Error(res.msg))
      }
      self.props.handleCashModal('success');
    }, (res) => {
      return new Promise.reject(new Error(res.msg))
    }).catch((err) => {
      message.error(err.message || '更新失败，请重试~')
    })
  }
  handleCashModal(val) {
    clearInterval(this.timer);
    this.timer = null;
    this.props.handleCashModal(val)
  }
  componentWillUnmount () {
    clearInterval(this.timer)
    this.timer = null
  }
  render() {
    const { getFieldDecorator } = this.props.form;
    const cashAccount = this.props.cashAccount
    const user = this.props.user
    const type = this.state.type || cashAccount.type  
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 5 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 8 },
      },
    };

    return (<Form onSubmit={this.handleSubmit}>
      <FormItem {...formItemLayout} label="收款方式">
        {getFieldDecorator('type', {
          rules: [
            {  message: '请选择收款方式' },
          ],
          initialValue: cashAccount.type.toString(),
        })(
          <RadioGroup>
            <Radio value="2" onClick = {this.changePayTye.bind(this, 2)} className="radio-block">
               <span>微信收款(最快T+1结算，收取提现金额的1%作为手续费)</span>
            </Radio>
            <Radio value="1" onClick = {this.changePayTye.bind(this, 1)} className="radio-block">
               <span>支付宝(收款最快T+1结算，200以下每次提现收取2元手续费，</span><br/>
               <span>200元及以上收取提现金额的1%作为手续费)</span>
            </Radio>
          </RadioGroup>
        )}
      </FormItem>
      { type === 1 ? <Alipay form={this.props.form} cashAccount={cashAccount} formItemLayout={formItemLayout} /> : type === 2 ?
       <Wechat cashAccount={cashAccount} formItemLayout={formItemLayout} keyLoading={this.state.keyLoading} user={user}
       form={this.props.form} resetWechatKey={this.resetWechatKey.bind(this)} wechat={this.state.wechat} /> : null} 
      <div className="footer-btn">
        <FormItem>
          <Button type="ghost" onClick={this.handleCashModal.bind(this)}>取消</Button>
          <Button type="primary" htmlType="submit">保存</Button>
        </FormItem>
       </div>
    </Form>);
  }
};

AmountForm = createForm()(AmountForm);

export default AmountForm;
