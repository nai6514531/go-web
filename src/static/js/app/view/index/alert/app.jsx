import React from 'react';
import './app.less';
import emitter from '../../../library/emitter/emitter.js';

const App = React.createClass({
  getInitialState() {
    return ({
      status: "hide",
      msg: ""
    })
  },
  componentWillMount() {
    let self = this;
    emitter.on('change_alert_status', (data) => {
      self.setState({
        status: "show",
        msg: data.msg
      })
    })
  },
  componentDidMount() {
    this.autoClose();
  },
  autoClose() {
    let self = this;
    let timeout = setTimeout(() => {
      self.setState({
        status: "hide",
        msg: ""
      })
    }, 3000)
  },
  render() {
    let status = this.state.status;
    let msg = this.state.msg;
    return (
      <div className={"alert "+status}>
        <div className="layer"></div>
        <div className="body">
          <div className="icon">!</div>
          <div className="msg">{msg}</div>
        </div>
      </div>
    );
  }
});

export default App;
