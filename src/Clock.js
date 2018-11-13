import React from 'react';

class Clock extends React.Component {
  constructor(props) {
      super(props);
      this.state = {
        opacity: 1.0,
        date:new Date()//new Date()时会获取新的时间
      }
    }
  componentDidMount() {
    this._isMounted = true;
    this.timer = setInterval(function () {
      var opacity = this.state.opacity;
      opacity -= .1;
      if (opacity <= 0) {
        opacity = 1.0;
        this.setState({
          date:new Date()
        });
      }
      this.setState({
        opacity: opacity
      });
    }.bind(this), 100);
  }
  //在组件销毁时停止Interval程序
  componentWillUnmount() {
      clearInterval(this.timer)
  }

  render() {
    return (
      <div>
        <h2 style={{opacity: this.state.opacity}}>{this.state.date.toLocaleTimeString()}</h2>
      </div>
    );    //记得要加toLocaleTimeString，报错卡我了20分钟
  }
}

export default Clock;
