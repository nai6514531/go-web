import React from "react";
import {Button,Form,Input, Icon, Popconfirm,Breadcrumb, message} from "antd";
const FormItem = Form.Item;
import './app.less';
import md5 from 'md5';

import  UserService  from "../../app/service/user";

class ResetForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      current: 0,
      passwordDirty: false,
    };
  }
  reset(values) {
    var self = this;
    UserService.reset(values)
      .then((data) => {
        self.props.next();
      },(error)=>{
        message.error(error.msg, 3);
      })
  }
  handlePasswordBlur(e) {
    const value = e.target.value;
    this.setState({ passwordDirty: this.state.passwordDirty || !!value });
  }
  checkPassowrd(rule, value, callback) {
    const form = this.props.form;
    if (value && value !== form.getFieldValue('password')) {
      callback('两次输入的密码不一致，请检查');
    } else {
      callback();
    }
  }
  checkConfirm(rule, value, callback) {
    const form = this.props.form;
    if(value) {
      if(value.length >= 6 && value.length <= 16){
        callback();
      } else {
        callback('请输入6-16位密码');
      }
    } else {
      callback('请输入6-16位密码');
    }
    if (value && this.state.passwordDirty) {
      form.validateFields(['confirm'], { force: true });
    }
    callback();
  }
  prev(e) {
    e.preventDefault();
    this.props.prev();
  }
  handleSubmit(e) {
    e.preventDefault();
    const self = this;
    this.props.form.validateFields((err, values) => {
      if (!err) {
        const data = {
          account: self.props.account || '',
          password: md5(values.password),
          code: self.props.code || '',
        }
        this.reset(data);
      }
    });
  }
  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: { span: 7 },
      wrapperCol: { span: 16 },
    };
    return (
      <Form horizontal onSubmit={this.handleSubmit.bind(this)} className="reset-form">
        <FormItem
          {...formItemLayout}
          label="新密码"
        >
          {getFieldDecorator('password', {
            rules: [{
              required: true, message: '密码不可为空',
            }, {
              validator: this.checkConfirm.bind(this),
            }],
          })(
            <Input size="large" type="password" placeholder="请输入新密码" onBlur={this.handlePasswordBlur.bind(this)} />
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="确认新密码"
        >
          {getFieldDecorator('confirm', {
            rules: [{
              required: true, message: '密码不可为空',
            }, {
              validator: this.checkPassowrd.bind(this),
            }],
          })(
            <Input size="large" type="password" placeholder="请再次输入新密码" />
          )}
        </FormItem>
        <FormItem>
          <Button className="submit" type="primary" htmlType="submit" size="large">确认修改</Button>
          <p className="prev" >
            <a href="#" onClick={this.prev.bind(this)}>返回上一步</a>
          </p>
        </FormItem>
      </Form>
    );
  }
}

const App = Form.create()(ResetForm);

export default App;
