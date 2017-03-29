import React from "react";
import {Button, Form, Input, Modal, Breadcrumb, message, Select} from "antd";
import UserService from "../../../service/user";
import "./app.less";
const FormItem = Form.Item;
const confirm = Modal.confirm;

const App = Form.create()(React.createClass({
  showConfirm(data) {
    confirm({
      title: `账号 ${data.account} 的密码将重置为：${data.password}，是否确认修改？`,
      content: '',
      okText:'确认',
      cancelText:'取消',
      onOk() {
        return UserService.resetPwd(data)
          .then((data)=>{
            message.success(data.msg)},
            (data)=>{message.error(data.msg)}
          );
      },
      onCancel() {
        return false;
      }
    });
  },
  handleSubmit(e) {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        let data = this.props.form.getFieldsValue();
        if(data.hasOwnProperty('type'))data.type = parseInt(data.type);
        this.showConfirm(data);
      }
    });
  },
  checkPassword(rule, value, callback) {
    const form = this.props.form;
    if (value) {
      if (value.length >= 6 && value.length <= 16) {
        callback();
      } else {
        callback('请输入6-16位密码');
      }
    } else {
      callback();
    }
  },
  render() {
    const {getFieldDecorator} = this.props.form;
    const formItemLayout = {
      labelCol: {span: 7},
      wrapperCol: {span: 12},
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
            <Breadcrumb.Item>重置客户密码</Breadcrumb.Item>
          </Breadcrumb>
        </header>
        <Form horizontal onSubmit={this.handleSubmit}>
          <FormItem
            {...formItemLayout}
            label="修改系统"
          >
            {getFieldDecorator('type', {
              rules: [{required: true, message: '请选择重置商家端还是用户端密码',}],
            })(
              <Select placeholder="请选择">
                <Select.Option value="1">重置商家端密码</Select.Option>
                <Select.Option value="2">重置用户端密码</Select.Option>
              </Select>
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="登录账号"
          >
            {getFieldDecorator('account', {
              rules: [{
                required: true, message: '登录账号不可为空'
              }]
            })(
              <Input type="text" placeholder="请输入客户的登录账号"/>
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="重置密码"
          >
            {getFieldDecorator('password', {
              rules: [{
                required: true, message: '密码不可为空'
              }, {
                validator: this.checkPassword
              }],
              initialValue: "123456"
            })(
              <Input type="text" placeholder="请输入6-16位密码"/>
            )}
          </FormItem>
          <FormItem {...tailFormItemLayout}>
            <Button type="primary" htmlType="submit" size="large">确认修改</Button>
          </FormItem>
        </Form>
      </section>
    );
  }
}));

export default App;
