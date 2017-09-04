import React from 'react';
import './app.less';

const App = React.createClass({
  render() {
    return (<div className="view-home">
      <header>欢迎进入苏打生活管理系统！</header>
      <section>
        <h2>重要操作指引</h2>
        <ul>
          <li>• 2017.8.21起仅支持商家使用微信和支付宝收款，并收取转账手续费，请商家及时修改收款方式，具体操作请见<a href="https://shimo.im/doc/4hlsdAii5XonfT9C?r=2Y7N4" target="_blank">【更改收款方式及申请结算操作流程】</a>；</li>
          <li>• 添加下级运营商，请点击运营商管理→下级运营商→添加新运营商；</li>
          <li>• 修改模块价格/修改服务名称/锁定模块/取消占用，请点击“设备管理”进行操作；</li>
          <li>• 点击“消费查询”，可输入模块编号或者学生手机号查询对应订单；</li>
          <li>• 如需了解更多，请点击使用指南：<a href="https://shimo.im/doc/aL5an77g8RA6dAs4" target="_blank">「苏打生活管理系统操作手册-运营商专用」</a></li>
        </ul>
      </section>
    </div>);
  }
});

export default App;
