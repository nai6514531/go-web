import React from 'react';
import {Menu, Button, Icon} from 'antd';
import classnames from 'classnames';
const SubMenu = Menu.SubMenu;
import Menus from './menus.jsx'

const App = React.createClass({
  propTypes: {
    forceShow: React.PropTypes.bool,
    onClickClose: React.PropTypes.func,
    onRedirect: React.PropTypes.func
  },
  getDefaultProps() {
    return {
      forceShow: false,
      onClickClose: function () {},
      onRedirect: function () {},
    }
  },
  getInitialState() {
    return {
      current: '1',
      icons:[
        {'title':'运营商管理','icon':'user'},
        {'title':'结算管理','icon':'pay-circle-o'},
        {'title':'设备管理','icon':'calculator'},
        {'title':'数据统计','icon':'line-chart'},
        {'title': '洗衣查询','icon':'search'},
        {'title': '模块查询','icon':'search'},
      ],
      openKeys: [],
    };
  },
  onOpenChange(openKeys) {
    // openKeys 是当前被打开的菜单
    const state = this.state;
    // 找出符合条件的元素
    openKeys.find(function (key) {
      //console.log(state.openKeys.indexOf(key));
    })
    // 找出上次打开的元素
    const latestOpenKey = openKeys.find(key => !(state.openKeys.indexOf(key) > -1));
    // 上次关闭的元素
    const latestCloseKey = state.openKeys.find(key => !(openKeys.indexOf(key) > -1));

    let nextOpenKeys = [];
    if (latestOpenKey) {
      nextOpenKeys = this.getAncestorKeys(latestOpenKey).concat(latestOpenKey);
    }
    if (latestCloseKey) {
      nextOpenKeys = this.getAncestorKeys(latestCloseKey);
    }
    this.setState({ openKeys: nextOpenKeys });
  },
  getAncestorKeys(key) {
    // const map = {
    //   sub3: ['sub2'],
    // };
    return  [];
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
              openKeys={this.state.openKeys}
              onOpenChange={this.onOpenChange}
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
      </nav>
    </div>)
  }
});

export default App;
