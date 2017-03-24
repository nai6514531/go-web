import React from "react";
import {Menu, Button, Icon,Modal} from "antd";
const confirm = Modal.confirm;
const Header = React.createClass({
  propTypes: {
    onHamburgClick: React.PropTypes.func
  },
  getDefaultProps: function () {
    return {
      onHamburgClick: function () {}
    };
  },
  logout() {
    confirm({
      title: '确认退出登录吗?',
      onOk() {
        var timestamp =new Date().getTime();
        fetch(`/api/signout?_t=${timestamp}`, {
          headers: {
            'HTTP_X_REQUESTED_WITH': 'XMLHttpRequest'
          },
          method: 'get',
          credentials: 'same-origin'
        }).then(response=>response.json())
          .then(function (data) {
            if (data && data.status && parseInt(data.status.substr(-2)) == 0) {
              window.location.href = '/'
            } else {
              alert(data.msg || '系统异常,请重试!')
            }
          });
      },
    });
  },
  onClick(item) {
    if (item.key.includes('logout')) {
      return this.logout();
    }
    if (/^#|\//.test(item.key)) {
      window.location.href = item.key;
    }
  },
  render() {
    const {location} = this.props;
    const menus = USER.menu || [];
    return (<div className="application-header">
      <span className="hamburg">
        <Button type="ghost" icon="bars" onClick={this.props.onHamburgClick} />
      </span>
      <div className="right">
        <span className="name">
          {USER.name}, 您好!
        </span>
        <span className="logout">
          <Icon type="logout" onClick={this.logout} />
        </span>
      </div>
    </div>)
  }
});

export default Header;
