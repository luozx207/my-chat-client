import React from 'react';
import RoomMsgStore from './stores/RoomMsgStore';
import Input from 'antd/lib/input';
import Alert from 'antd/lib/alert';
import {msgStyles} from './style.js';
import Popover from 'antd/lib/popover';

const styles={
  msgBox: {
      height: 480,
      width:600,
      overflowY: 'auto',
      overflowX: 'hidden',
      padding: '8px',
      marginBottom:15,
	    boxShadow:'1px 1px 2px rgba(0,0,0,0.3),0 0 5px rgba(0,0,0,0.1) inset'
  }
}

export default class Room extends React.Component {
  constructor() {
      super();
      this.state = {
        message:[],
        //一开始用message:RoomMsgStore.getMsg(this.props.room)的话
        //constructor加载的时候props还没加载，因此会报错
      };
      this.tableContent=null;
  }

  componentWillMount() {
    this._isMounted = true;
    //每次点开model都是一个新的未渲染组件，因此每次都会执行componentWillMount
    this.setState({
      message:RoomMsgStore.getMsg(this.props.room)
    })
    //接收新消息，新信息直接添加到组件message，新信息也会在外层存储到store中
    this.props.socket.on('room_new_msg',(data) => {
      //当你打开与A的聊天界面，有可能B也在给你发消息
      //如果不加以区分，消息就会显示在与A的聊天界面上
        if(data.room===this.props.room){
          let m=this.state.message;
          m.push(data);
            if (this._isMounted) {
            this.setState({
                message:m
            });
          }
        }
        //需要每次收到消息都使滚轮滚到最底部
        let node = this.refs.msgbox;
        //但是modal组件点开之前，componentWillMount已经加载，但是组件真实dom没有加载
        //因此node的值是空，会报错，所以执行这句时先判断node是否为空
        if(node){
          node.scrollTop = node.scrollHeight;
        }
    })
    //因为表情要绑定的函数与父组件不同，因此构造出的table不能直接继承自父组件
    //但是常量emoji可以继承
    this.tableContent=this.getTableContent(this.props.emoji)
}

  componentDidMount(){
    //componentWillMount执行时，组件还没渲染出来
    //所以把使滚轮滚到最底下的命令放到componentDidMount
    //这里用于第一次打开modal时滚轮到最底，因为componentDidMount与componentWillMount
    //一样，只在组件第一次渲染的时候加载
    let node = this.refs.msgbox;
    node.scrollTop = node.scrollHeight;
  }

  // componentWiilReceiveProps(nextProps){
  //   console.log('Props');
  //   this.setState({
  //     message:RoomMsgStore.getMsg(nextProps.room)
  //   })
  // }

  componentWillUnmount() {
        this._isMounted = false
  }

  submitMessage(event){
    var message=this.state.value;
    if (message){//输入不为空才发送
      let time=new Date()
      this.props.socket.emit('room_message',{room:this.props.room,name:sessionStorage.name,data:message,time:time.toLocaleString()});//获取当天日期和发送时间
      //清空输入框的值，现在清空state里的值就可以了
      this.setState({
        value:null
      })
    }
  }

  getTableContent(emoji){
    let n=emoji.length;
    //计算需要多少行，向上取整
    let row=Math.ceil(n/8);
    let rows,table=[];
    for(var r=0;r<row;r++){
        rows=[];
        for(var i=r*8;i<(r+1)*8;i++){
            if (emoji[i]){
              rows.push(<td style={{cursor:'pointer'}} key={'emoji'+i} onClick={this.addEmoji.bind(this)}>
                        {emoji[i]}</td>)}
            else{
              break;
            }
          };
        table.push(<tr key={'row'+r}>{rows}</tr>)
        }
    return <table><tbody>{table}</tbody></table>
  }

  //要改变Input的内容，只有用value=this.state.value来解决
  saveValue(event){
    this.setState({
      value:event.target.value
    })
  }

  addEmoji(event){
    //用event.target获取当前节点，innerHTML用于获取节点内容
    let emoji=event.target.innerHTML
    // 判断一下value是否为空，如果是null+emojis输入框会显示一个null
    // 这是因为触发了隐式的类型转换
    if (this.state.value){
        this.setState({
          value:this.state.value+emoji
        })
      }
    else{
      this.setState({
        value:emoji
      })
    }
  }

  render(){
    //表情气泡卡片模块
    const pover=<Popover content={this.tableContent}>
        <img style={msgStyles.leftIcon} src={require('./img/emoji.png')} alt="" />
        </Popover>
    // const room_msg=RoomMsgStore.getMsg(this.props.room)
    const msgComponent = this.state.message.map((msg,index) => {
      if(msg.name===sessionStorage.name){
        return <div style={msgStyles.msgRight} key={index}>
        <div style={msgStyles.msgContent}>
          <div style={msgStyles.msgTitleBox}>
            <img style={msgStyles.rightIcon} src={require('./img/icon1.png')} alt="" />
            <b>{msg.name}</b></div>
          <div style={{float:'right'}}>{msg.time}</div>
        </div>
        <Alert message={msg.data} type="success"/></div>;}
      else{
        return  <div style={msgStyles.msgLeft} key={index}>
        <div style={msgStyles.msgContent}>
        <div style={msgStyles.msgTitleBox}>
          <img style={msgStyles.leftIcon} src={require('./img/icon2.png')} alt="" />
          <b>{msg.name}</b></div>
          <div style={{float:'right'}}>{msg.time}</div>
        </div>
        <Alert message={msg.data} type="info"/></div>;}
    });
    return(
      <div>
          <div style={styles.msgBox} ref='msgbox'>
            {msgComponent}
            </div>
          <Input placeholder="Press Enter to send" addonBefore={pover}
          value={this.state.value} onChange={this.saveValue.bind(this)}
          maxLength="250"
          onPressEnter={this.submitMessage.bind(this)} />
      </div>
      )
  }
}
