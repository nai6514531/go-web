import React from 'react';
import { Spin, Form, Button, Input, Breadcrumb, message, Modal, Row, Col } from 'antd';
import UserService from '../../../service/user';
import SodaBreadcrumb from '../../common/breadcrumb/breadcrumb.jsx';
import './app.less';
const FormItem = Form.Item;
const confirm = Modal.confirm;
class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      btnLoading: false,
      modalVisiable: false,
      pageData: {},
      newKey: 0
    }
    this.breadItems = [
      {
        title:'运营商管理',
        url:'/user'
      },
      {
        title:'IC卡金额转移',
        url:'/user/ic-card/recharge'
      },
      {
        title:'查看IC卡信息',
        url: ''
      }
    ];
    this.handleSubmit = this.handleSubmit.bind(this);
    this.showModal = this.showModal.bind(this);
    this.cancelModal = this.cancelModal.bind(this);
  }
  componentDidMount() {
    this.fetchData();
  }
  fetchData() {
    this.setState({
      loading: true
    })
    UserService.icCardBasicInfo(this.props.params.id)
      .then((result) => {
        let data = result.data;
        let applyProvidersName = "";
        let applyProvidersNameWithAccount = "";
        let applyProvidersList = data.applyProviders;
        data.value = data.value/100;
        applyProvidersList.map((value,index) => {
          let addComma = applyProvidersList.length - 1 == index ? '' : ',';
          applyProvidersName = applyProvidersName + value.account + addComma;
          applyProvidersNameWithAccount = `${applyProvidersNameWithAccount}${value.name}(${value.account})${addComma}`
        });
        data.applyProvidersName = applyProvidersName;
        data.applyProvidersNameWithAccount = applyProvidersNameWithAccount;
        this.setState({
          pageData: data,
          loading: false,
        });
      },(error)=>{
        this.setState({
          loading: false,
        });
        message.error(error.msg);
      })
  }
  handleSubmit(e) {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        values = this.formatParams(values);
        this.showConfirm(values);
      }
    });
  }
  formatParams(params) {
    let data = params.applyProviders.replace(/，/g,",").split(",");
    let formatData = [];
    data.map((value) => {
      (value !== "") && formatData.push(value);
    })
    params.applyProviders = formatData;
    params.id = this.state.pageData.id;
    return params;
  }
  showConfirm(params) {
    let self = this;
    confirm({
      content: '是否确认修改?',
      onOk() {
        self.upDateInfo(params);
      },
      onCancel() {
        // self.disMissModal();
      },
    });
  }
  upDateInfo(params) {
    this.setState({
      btnLoading: true,
    });
    UserService.updateIcCardInfo(params)
      .then((result) => {
        if( result.status == 0 ) {
            this.fetchData();
            this.cancelModal();
        }
        this.setState({
          btnLoading: false
        });
        message.info(result.msg);
      },(error)=>{
        this.setState({
          btnLoading: false,
        });
        message.error(error.msg,3);
      })
  }
  showModal() {
    this.setState({
      modalVisiable: true
    })
  }
  cancelModal() {
    this.setState({
      modalVisiable: false,
      newKey: this.state.newKey+=1
    })
  }
  render() {
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 7 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 14 },
      },
    };
    const { modalVisiable, pageData, newKey, btnLoading } = this.state;
    const { getFieldDecorator } = this.props.form;
    return(
      <section className="view-user-list">
        <header>
          <SodaBreadcrumb items={this.breadItems}/>
        </header>
        <Spin
          tip="加载中..."
          spinning={this.state.loading}>
          <Row type="flex" justify="start" className="item-wrap">
            <Col span={4}>学生登录手机号:</Col>
            <Col span={4}>{pageData.mobile || '-'}</Col>
          </Row>
          <Row type="flex" justify="start" className="item-wrap">
            <Col span={4}>IC卡当前余额:</Col>
            <Col span={4}>{pageData.value || '-'}元</Col>
          </Row>
          <Row type="flex" justify="start" className="item-wrap">
            <Col span={4}>IC卡适用商家:</Col>
            <Col>{pageData.applyProvidersNameWithAccount || '-'}</Col>
          </Row>
          <Row type="flex" justify="start" className="item-wrap">
            <Col span={4}></Col>
            <Col span={4}>
             <Button type="primary" onClick={this.showModal}>
               修改适用商家
             </Button>
            </Col>
          </Row>
          <Modal
            visible={modalVisiable}
            footer={null}
            onCancel={this.cancelModal}
            key={newKey}
            >
            <div style={{
              paddingTop: "30px",
              paddingBottom: "10px",
              paddingLeft: "10px"
            }}>
              <Form onSubmit={this.handleSubmit}>
                <FormItem
                  {...formItemLayout}
                  label="适用商家账号"
                >
                  {getFieldDecorator("applyProviders", {
                    initialValue: pageData.applyProvidersName,
                    rules: [{
                      required: true, message: "账号不可为空",
                    }]
                  })(
                    <Input placeholder="如有多个账号，需用英文逗号隔开"/>
                  )}
                </FormItem>
                <p className="info-text">注意:该学生手机号之前充值对应的适用商家也将更新为此次修改结果！</p>
                <Button
                  type="primary"
                  htmlType="submit"
                  className="modal-button-style"
                  loading={btnLoading}
                  onClick={this.handleSubmit}
                  >
                  修改
                </Button>
              </Form>
            </div>
          </Modal>
        </Spin>
      </section>
    )
  }
}
const WrappedApp = Form.create()(App);
export default WrappedApp;
