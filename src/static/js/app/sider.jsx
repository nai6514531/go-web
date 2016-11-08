import React from 'react';
import {Menu, Button, Icon} from 'antd';
import classnames from 'classnames';

import Menus from './menus.jsx'

const Navbar = React.createClass({
  propTypes: {
    forceShow: React.PropTypes.bool,
    onClickClose: React.PropTypes.func,
    onRedirect: React.PropTypes.func
  },
  getDefaultProps() {
    return {
      forceShow: false,
      onClickClose: function () {},
      onRedirect: function () {}
    }
  },
  getInitialState() {
    return {
      current: '',
      icons:[
        {'title':'代理商管理','icon':'user'},
        {'title':'结算管理','icon':'pay-circle-o'},
        {'title':'设备管理','icon':'calculator'},
        {'title':'数据统计','icon':'line-chart'},
      ]
    };
  },
  onClickNav(item) {
    if (/^#|\//.test(item.key)) {
      this.redirect(item.key);
    }
  },
  redirect(url) {
    window.location.href = url;
    this.setState({ current: url })
    this.props.onRedirect();
  },
  render() {
    const { location, forceShow } = this.props;
    const menus = USER.menu || [];
    const self = this;
    const icons = this.state.icons;
    return (<div className={classnames('application-sider', { show: forceShow })}>
      <div className="close"><Button type="ghost" icon="close" shape="circle" onClick={this.props.onClickClose} /></div>
      <h2 onClick={() => this.redirect('')}><a href="#/"><img src={require('./logo.png')}/></a></h2>
      <nav>
        <Menu mode="inline"
          theme="dark"
          selectedKeys={[this.state.current]}
          onClick={this.onClickNav}>
          {menus.map(function (item) {
            return <Menu.Item key={item.url}>
              <Icon type={icons.filter(function (icon) {
                return icon.title == item.name
              }).length > 0 ? icons.filter(function (icon) {
                return icon.title == item.name
              })[0].icon:'smile-o'}
              />
              {item.name}
            </Menu.Item>
          })}
        </Menu>
        <footer>
          <p> - &#10084; - </p>
        </footer>
      </nav>
    </div>)
  }
});

export default Navbar;
