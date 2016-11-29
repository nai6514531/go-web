import React from "react";
import {Button,Form,Input, Table, Icon, Popconfirm,Breadcrumb, message} from "antd";
import SettingService from "../../../service/setting";
const FormItem = Form.Item;
import './app.less';

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
        console.log('Received values of form: ', values);
        values.userId = USER.id;
        // this.set(values);
      }
    });
  },
  handlePasswordBlur(e) {
    const value = e.target.value;
    this.setState({ passwordDirty: this.state.passwordDirty || !!value });
  },
  checkPassowrd(rule, value, callback) {
    const form = this.props.form;
    if (value && value !== form.getFieldValue('password')) {
      callback('两次输入的密码不一致');
    } else {
      callback();
    }
  },
  checkConfirm(rule, value, callback) {
    const form = this.props.form;
    var pattern = new RegExp(/^(?=.*[0-9]{1,})(?=.*[a-zA-Z]{1,})([a-zA-Z0-9]{8,})$/);
    if(pattern.test(value) || !value){
      callback();
    } else {
      callback('至少是8位数字和字母组成');
    }
    if (value && this.state.passwordDirty) {
      form.validateFields(['confirm'], { force: true });
    }
    callback();
  },
  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 14 },
    };
    const tailFormItemLayout = {
      wrapperCol: {
        span: 14,
        offset: 6,
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
          label="原密码"
        >
          {getFieldDecorator('oldPassword', {
            rules: [{required: true, message: '请输入原密码',}],
          })(
            <Input type="password" placeholder="请输入原密码"/>
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="新密码"
        >
          {getFieldDecorator('password', {
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
