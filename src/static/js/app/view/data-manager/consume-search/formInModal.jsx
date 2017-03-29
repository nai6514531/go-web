/**
 * Created by lilykwan on 2017/3/25.
 */
import React from "react";
import {Button, Form, Modal, Input, message} from "antd";
import DeviceService from '../../../service/device'

const FormItem = Form.Item;

class FormInModalI extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false
    };
    //this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit = (e) => {
    e.preventDefault();
    this.setState({loading: true});
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        let data = this.props.form.getFieldsValue();
        if (data.hasOwnProperty('step'))data.step = parseInt(data.step);
        DeviceService.setDeviceStep(data).then(
          (data)=> {
            this.setState({loading: false});
            this.props.onSuccess();
            return message.success(data.msg);
          },
          (data)=> {
            this.setState({loading: false});
            return message.error(data.msg)
          });
      } else {
        this.setState({loading: false});
      }
    });
  };

  render() {
    const {form, visible, onCancel} = this.props;
    const {getFieldDecorator} = form;
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
      <div>
        <Modal
          visible={visible}
          onCancel={onCancel}
          footer={null}
        >
          <Form layout="horizontal" style={{padding:24}} onSubmit={this.handleSubmit}>
            <FormItem
              {...formItemLayout}
              label="模块编号"
            >
              {getFieldDecorator('serialNumber', {
                rules: [{
                  required: true, message: '模块编号不可为空'
                }]
              })(
                <Input type="text" placeholder="请输入模块编号"/>
              )}
            </FormItem>
            <FormItem
              {...formItemLayout}
              label="密码计数"
            >
              {getFieldDecorator('step', {
                rules: [{
                  required: true, message: '密码计数不可为空'
                }]
              })(
                <Input type="text" placeholder="请输入密码计数"/>
              )}
            </FormItem>
            <FormItem {...tailFormItemLayout}>
              <Button type="primary" htmlType="submit" loading={this.state.loading}
                      size="large">
                确认重置
              </Button>
            </FormItem>
          </Form>
        </Modal>
      </div>
    )
  }
}

export var FormInModal = Form.create({})(FormInModalI);
