import React from 'react';
import './app.less';
import { Menu, Icon } from 'antd';
import { Link } from 'react-router';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as UserActions from '../../actions/user';

const MenuItem = Menu.Item;

function mapStateToProps(state) {
  const { user: { menu } } = state;
  return { menu };
}

function mapDispatchToProps(dispatch) {
  const {
    getUserMenu,
  } = bindActionCreators(UserActions, dispatch);
  return {
    getUserMenu,
  };
}

class LeftMenu extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      current: '1',
      openKeys: [],
    };
    this.handleClick = this.handleClick.bind(this);
  }
  handleClick(e) {
    console.log('click ', e);
    this.setState({ current: e.key });
  }
  componentDidMount() {
    this.props.getUserMenu(20);
  }
  showMe() {
    console.log(this.props.menu);
  }
  render() {
    const menu = this.props.menu;
    let menuList = '';
    const data = [
      {
        url: '/agent',
        name: '代理商管理',
      },
      {
        url: '/cash',
        name: '结算管理',
      }
    ];
    if(menu && menu.fetch == true){
      menuList = data.map((item, key) => {
        return (
          <MenuItem key = {key}>
            <Link to= {item.url} >
              <span>{item.name}</span>
            </Link>
          </MenuItem>
        );
      })
    }
    return (
      <div className="menu">
        <button onClick={this.showMe.bind(this)}>Show me</button>
        <Menu
          mode="inline"
          selectedKeys={[this.state.current]}
          style={{ width: 240 }}
          onClick={this.handleClick}
        >
          {menuList}
        </Menu>
      </div>
    );
  }
}


LeftMenu.propTypes = {
  title: React.PropTypes.string,
};

export default connect(mapStateToProps, mapDispatchToProps)(LeftMenu);
