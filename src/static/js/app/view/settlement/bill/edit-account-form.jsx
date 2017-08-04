import React from 'react';
import Promise from 'bluebird'
import _ from 'underscore';
import moment from 'moment';

import { Button, Radio, Input, Icon, message, Modal, Row, Col, Form } from 'antd';
const createForm = Form.create;
const FormItem = Form.Item;
const RadioGroup = Radio.Group;
import QRCode from '../../../library/qrcode'
import UserService from '../../../service/user';

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
            initialValue: cashAccount.account,

          })(
          <Input placeholder="需要确认是邮箱还是手机号"/>
          )}
        </FormItem>
        <Button className="button-style" type="primary" onClick={() => { this.setState({ showAccountTip: true })}}>查看示例</Button> 
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
            <Input placeholder="必须为实名认证过的姓名"/>
          )}
        </FormItem>
        <Button type="primary" className="button-style" onClick={() => { this.setState({ showAccountNameTip: true })}}>查看示例</Button>
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
      showIdentification: false
    }
  }
  initQRCode() {
    const self = this;
    const key = self.props.wechat.key || '';
    const url = `http://m.sodalife.xyz/act/#/relate-wechat?key=${key}`;
    setTimeout(()=> {
      new QRCode(self.refs.qrcode, {
        text: url,
        width: 120,
        height: 120,
        colorDark : '#fff',
        colorLight : '#000',
        correctLevel : QRCode.CorrectLevel.H
      });
    }, 0)
  }
  identification() {
    this.setState({ showIdentification: true })
  }
  render() {
    const wechat = this.props.wechat;
    const cashAccount = this.props.cashAccount;
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = this.props.formItemLayout;
    this.initQRCode()
    return <div>
      <div className="form-wrapper">
        <FormItem {...formItemLayout} label="扫码验证身份" >
          <div ref="qrcode" className="code"></div> 
        </FormItem>
        { 
          !!wechat.name ? <div className="code-tip">
            <Icon type='heck-circle' className='icon success' />
            <span>{'关联成功（你将使用昵称为' + wechat.name + '的微信收款。如需更换账号请'} <i className='reset-wechat' onClick={this.props.resetWechatAccount}>刷新</i>二维码，用新微信号扫描）}</span>
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
			type: ''
		}
    this.handleSubmit = this.handleSubmit.bind(this);

	}
	handleSubmit() {
		const self = this;
		this.props.form.validateFields((errors, values) => {
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
      } else {
        cashAccount = {
          "type": type
        }
      }
	    UserService.edit(window.USER.id, {cashAccount: cashAccount}).then((data) => {
	    	console.log(data)
	    	self.props.handleCashModal(data);
			})
    });
	}
  changePayTye(type) {
    const self = this;
    type = type;
    const wechat = this.state.wechat;
    this.setState({type: type});

    // 选择微信支付账户 且用户默认不是微信支付
    if (type === 2 && !!wechat.key) {
      // 获取随机key
      return self.resetWechatKey()
    }
    // 默认微信支付账户，渲染二维码
    // if (type === 2 && this.props.cashAccount.type) {
    //   // self.initQRCode()
    // }
  }
  initQRCode(key) {
    const self = this;
    key = key || '';
    const url = `http://m.sodalife.xyz/act/#/relate-wechat?key=${key}`;
    setTimeout(()=> {
      new QRCode(self.refs.qrcode, {
        text: url,
        width: 120,
        height: 120,
        colorDark : '#fff',
        colorLight : '#000',
        correctLevel : QRCode.CorrectLevel.H
      });
    }, 0)
  }
  resetWechatKey() {
    const self = this;
    self.setState({keyLoading: true})
    WechatService.create().then((res) => {
      if (res.status !== 0) {
        return new Promise.reject()
      }
      const key = res.data.key
      // 根据key生成二维码
      self.initQRCode(key)
      self.setState({wechat: {name: '', key: key || ''}, keyLoading: false})
      self.checkWechatKey()
    }).catch(() => {
      self.setState({keyLoading: true})
    })
  }
  checkWechatKey() {
    const self = this;
    const key = self.state.wechat.key;
    self.timer = null;
    self.timer = setInterval(() => {
      WechatService.getKeyDetail(key).then((res) => {
        const status = res.status;
        if (status !== 0) {
          return new Promise.reject()
        }
        if (status === 0) {
          clearInterval(self.timer);
          self.timer = null;
          self.setState({wechat: {...self.state.wechat, name: res.data.nickName}})
        }
      }).catch(() => {
      })
    }, 1000)
  }
  updateUserAccount({ ...options }) {
    const cashAccount = _.extend(this.props.cashAccount, {realName: options.realName, account: options.account || '', nickName: options.nickName || ''})
    let user = _.extend(this.props.user, {key: this.state.key})
    user.cashAccount = cashAccount
  }
  componentDidMount() {
  }
	render() {
		const { getFieldDecorator } = this.props.form;
    const cashAccount = this.props.cashAccount
    const type = this.state.type || cashAccount.type  

		const formItemLayout = {
      labelCol: {
        span: 5
      },
      wrapperCol: {
        span: 8
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
      { type === 1 ? <Alipay form={this.props.form} cashAccount={cashAccount} formItemLayout={formItemLayout} /> :
       <Wechat cashAccount={cashAccount} formItemLayout={formItemLayout} form={this.props.form} resetWechatKey={this.resetWechatKey} wechat={this.state.wechat} />}
      <div className="footer-btn">
	      <FormItem>
	        <Button type="ghost" onClick={() => { this.props.handleCashModal}}>取消</Button>
	        <Button type="primary" htmlType="submit">保存</Button>
	      </FormItem>
	     </div>
    </Form>);
	}
};

AmountForm = createForm()(AmountForm);

export default AmountForm;
