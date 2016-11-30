import React from "react";
import {Button,Form,Input, Icon, Popconfirm,Breadcrumb, message} from "antd";
import SettingService from "../../../service/setting";
const FormItem = Form.Item;
import './app.less';
import md5 from 'md5';


const App = Form.create()(React.createClass({
  propTypes: {
  },
  getInitialState() {
    const self = this;
    return {
      passwordDirty: false,
    };
  },
  set(date) {
    var self = this;
    this.setState({
      loading: true,
    });
    SettingService.changePassword(date)
      .then((data) => {
        self.setState({
          loading: false,
        });
        if (data && data.status == '00') {
          message.success(data.msg,3);
        } else {
          message.error(data.msg,3);
        }
      })
  },
  handleSubmit(e) {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const data = {
          current: md5(values.current),
          newer: md5(values.newer),
        }
        this.set(data);
      }
    });
  },
  handlePasswordBlur(e) {
    const value = e.target.value;
    this.setState({ passwordDirty: this.state.passwordDirty || !!value });
  },
  checkPassowrd(rule, value, callback) {
    const form = this.props.form;
    if (value && value !== form.getFieldValue('newer')) {
      callback('两次输入的密码不一致');
    } else {
      callback();
    }
  },
  checkConfirm(rule, value, callback) {
    const form = this.props.form;
    // var pattern = new RegExp(/^(?=.*[0-9]{1,})(?=.*[a-zA-Z]{1,})([a-zA-Z0-9]{8,})$/);
    if( (value.length >= 6 && value.length <= 16) || !value){
      callback();
    } else {
      callback('位数为6到16位');
    }
    // if(pattern.test(value) || !value){
    //   callback();
    // } else {
    //   callback('至少是8位数字和字母组成');
    // }
    if (value && this.state.passwordDirty) {
      form.validateFields(['confirm'], { force: true });
    }
    callback();
  },
  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: { span: 7 },
      wrapperCol: { span: 12 },
    };
    const tailFormItemLayout = {
      wrapperCol: {
        span: 12,
        offset: 7,
      },
    };
    return (
    <section className="view-set-password">
      <header>
        <Breadcrumb>
          <Breadcrumb.Item>修改密码</Breadcrumb.Item>
        </Breadcrumb>
      </header>
      <Form horizontal onSubmit={this.handleSubmit}>
        <FormItem
          {...formItemLayout}
          label="原始密码"
        >
          {getFieldDecorator('current', {
            rules: [{required: true, message: '请输入原始密码',}],
          })(
            <Input type="password" placeholder="请输入原始密码"/>
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="新密码"
        >
          {getFieldDecorator('newer', {
            rules: [{
              required: true, message: '请输入新密码',
            }, {
              validator: this.checkConfirm,
            }],
          })(
            <Input type="password" placeholder="请输入新密码" onBlur={this.handlePasswordBlur} />
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="确认密码"
        >
          {getFieldDecorator('confirm', {
            rules: [{
              required: true, message: '请确认新密码',
            }, {
              validator: this.checkPassowrd,
            }],
          })(
            <Input type="password" placeholder="请确认新密码" />
          )}
        </FormItem>
        <FormItem {...tailFormItemLayout}>
          <Button type="primary" htmlType="submit" size="large">确认</Button>
        </FormItem>
      </Form>
    </section>
    );
  },
}));

export default App;
