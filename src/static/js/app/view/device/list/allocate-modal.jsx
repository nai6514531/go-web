import React from 'react';
import { Table, Button, Breadcrumb, Popconfirm, message,Modal,Steps,Input,Icon,Col,Row} from 'antd';
const Step = Steps.Step;
import UserService from "../../../service/user";
import DeviceService from "../../../service/device";
import './app.less';

const steps = [{
  title: '填写运营商账号',
}, {
  title: '验证运营商信息',
}, {
  title: '完成',
}];

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      current: 0,
      userAccount:'',
      userInfo:{
        account:'',
        mobile:'',
        name:'',
        contact:'',
      },// 获取的用户信息
      bindResult:'',//绑定结果反馈
      lockButton: false,

    };
  }
  componentWillReceiveProps(nextProps){
    if(this.props.resetCurrent == false && nextProps.resetCurrent == true) {
      this.setState({current:0});
    }
  }
  detail(account) {
    this.setState({lockButton: true}); // 给 Next Button 加锁
    UserService.detailByAccount(account)
      .then((data) => {
        const current = this.state.current + 1;
        this.setState({
          current,
          userInfo:data.data
        });
        this.setState({lockButton: false});
      },(error)=>{
        message.error(error.msg,3);
        this.setState({lockButton: false});
      })
  }
  deviceAssign(data) {
    this.setState({lockButton: true});
    DeviceService.deviceAssign(data)
      .then((data) => {
        const current = this.state.current + 1;
        this.setState({
          current,
          bindResult:'分配成功'
        });
        // 如果父组件提供了该方法,则使用
        this.setState({lockButton: false});
        message.success(data.msg,3);
        this.props.resetList();
      },(error)=>{
        this.setState({lockButton: false});
        message.error(error.msg,3);
      })
  }
  next() {
    this.props.changeResetCurrent();
    if(this.state.current == 0) {
      // 第一步,提交账号信息,确认是否存在该用户
      if(this.state.userAccount) {
        const account = this.state.userAccount.replace(/[\r\n\s]/g,"");
        this.detail(account);
      } else {
        message.info('请填写账号信息',3);
      }
    } else if(this.state.current == 1) {
      // 第二步,如果账号信息存在,则提交账号信息和设备编号,否则不能进入到下一步
      const serialNumbers = this.props.selectedRowKeys.join(",");
      const { account }= this.state.userInfo;
      const data = {
        userAccount: account,
        serialNumbers: serialNumbers
      }
      this.deviceAssign(data);
    }
  }
  prev() {
    const current = this.state.current - 1;
    this.setState({ current });
  }
  getUserAccount(e) {
    this.setState({userAccount:e.target.value})
  }
  comAllocate() {
    // 完成绑定,也有可能绑定失败,关闭 modal
    // 在点开批量分配按钮后重置提交栏
    console.log(this.props.goBackDirect);
    if(this.props.goBackDirect) {
      // 完成需要直接跳转
      console.log('111'); 
      this.props.setGoBackDirect();
    } else {
      this.props.handleCancel();
    }
    
    
  }
  render() {
    let show = '';
    const userInfo = this.state.userInfo;
    if (this.state.current == 0){
      show = <div>
        <p className="device-tips">您已选择{this.props.selectedRowKeys.length}个设备进行分配,请输入被分配运营商的登录账号</p>
        <Input type="text" style={{width:200}} value={this.state.userAccount}  onChange={this.getUserAccount.bind(this)}/>
      </div>
    } else if(this.state.current == 1){
      show = <div>你将把设备分配给：{userInfo.name}|{userInfo.contact}|{userInfo.mobile}，是否继续？</div>
    } else if(this.state.current == 2){
      show = <p className="result-text"><Icon type="check-circle" /> {this.state.bindResult}</p>
    };
    const lockButton = this.state.lockButton?{disabled:"disabled"}:{};
    return (
          <Modal title="批量分配" visible={this.props.visible}
                 wrapClassName="allocateModal"
                 onCancel={this.props.handleCancel}
          >
            <Steps current={this.state.current}>
              {steps.map(item => <Step key={item.title} title={item.title} />)}
            </Steps>
            <div className="steps-content">
              {show}
            </div>
            <div className="steps-action">
              {this.state.current < steps.length - 1 &&
              <Button type="primary" {...lockButton} onClick={() => this.next()}>下一步</Button>
              }
              {this.state.current === steps.length - 1 &&
              <Button type="primary" onClick={this.comAllocate.bind(this)}>完成</Button>
              }
              {this.state.current == 1 &&
              <Button style={{ marginLeft: 8 }} type="ghost" onClick={() => this.prev()}>
                上一步
              </Button>
              }
            </div>
          </Modal>
    );
  }
}


App.propTypes = {
  handleTableChange: React.PropTypes.func,
};

export default App;
