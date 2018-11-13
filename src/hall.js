import React from 'react';
import MsgStore from './stores/MsgStore';
import * as MsgAction from './actions/MsgAction';
import Name from './name';
import Alert from 'antd/lib/alert';//最好按需加载ui组件，不然会导致编译出来的js文件过大
import Input from 'antd/lib/input';
import message from 'antd/lib/message';
import {msgStyles} from './style.js'
import Icon from 'antd/es/icon';
import Menu from 'antd/lib/menu';
import Dropdown from 'antd/lib/dropdown';
import Modal from 'antd/lib/modal';
import Popover from 'antd/lib/popover';
import Upload from 'antd/lib/upload';

const styles={
  mainBox:{
    height: 650,
    width:1050,
    display: 'inline-block',
  },
  msgBox: {
      height: 550,
      width:720,
      overflowY: 'auto',
      overflowX: 'hidden',
      padding: '8px',
      margin: 15,
      backgroundColor:'rgba(255,255,255,0.96)',
	    boxShadow:'1px 1px 4px rgba(0,0,0,0.3),0 0 20px rgba(0,0,0,0.2) inset'
  },
  antInput:{
    width:720,
    opacity:0.95,
    margin: '2px 15px 0px 15px'
  },
  msgBox2: {
      height: 600,
      width:600,
      overflowY: 'auto',
      overflowX: 'hidden',
      padding: '8px',
      marginBottom:15,
      boxShadow:'1px 1px 2px rgba(0,0,0,0.1),0 0 5px rgba(0,0,0,0.1) inset'
  }
}
//不会改变的常量应该放在组件外部
const emoji= ['😊','😃','😉','😂','😁','😇','😝','😎','😚','😐','😍','😒','😓','😔','😌','😏','😖','😞','😠','😡','😈'];

export default class Hall extends React.Component{
  constructor(){
    super();
    this.state={
      r_message:MsgStore.getAll(),//从store拿到消息历史记录
      rooms:[],
      visible:false,
      room_message:[]
    }
    this.tableContent=null
  }

  componentWillMount() {
    //每次setState后会调用render中的函数，虽然不会重新渲染真实dom，但是也会影响网页性能
    //因此，不使用这个方案，而是在modal打开时再生成随机数
    // setInterval(()=>{
    //   if (!this.state.visible){
    //       var r=Math.random()
    //       this.setState({
    //         random: r
    //       });
    //   }
    // }, 1000);

    //之前getTableContent放在render中，但是每次setState时render中的函数就又会执行
    //而getTableContent是构造表情table的函数，其实它只需要执行一次
    //因此只要在组件渲染前运算一次，再存为组件的常量就可以了
    this.tableContent=this.getTableContent(emoji)
    //收到新的消息后，将消息传给MsgAction
    this.props.socket.on('message', (data) => {
          console.log('received message');
          MsgAction.sendMessage(data);
        }
      );
    //接收历史消息
    this.props.socket.on('history_message',(data)=>{
      console.log('received history message');
      MsgAction.historyMessage(data);
    })
    this.props.socket.on('no_more_message',()=>{
      message.warn('无更多历史数据',3);
    })
    //接收store传过来的更新的消息记录
    MsgStore.on('pushNewMsg', () => {
        this.setState({
            r_message:MsgStore.getAll()
        });
        let node = this.refs.msgbox;
        node.scrollTop = node.scrollHeight;
      })
    //这个函数会让滚动窗滚到已读信息部分
    MsgStore.on('loadMsg',()=>{
      this.setState({
        r_message:MsgStore.getAll()
      })
        this.refs.msgbox.scrollTop=1500;
        message.success('历史消息已加载',3);
    })
    //私聊记录的房间和对话人名字
    this.props.socket.on('rooms',(data)=>{
      this.setState({
        rooms:data
      })
    })
  }
  componentDidMount() {
          this.props.socket.on('connect', () => {
              console.log('connected')
          });
      }

  handleScroll(){
      if (this.refs.msgbox.scrollTop===0){
        this.props.socket.emit('load_msg')
      }
  }

  submitMessage(){
    var message=this.state.value;
    if (message){//输入不为空才发送
      let time=new Date()
      this.props.socket.emit('imessage',{name:sessionStorage.name,data:message,time:time.toLocaleString()});//获取当天日期和发送时间
      //清空输入框的值，现在清空state里的值就可以了
      this.setState({
        //value:''是无效的，this.state.value仍然是空值
        value:null
      })
    }
    // var s=this.refs.cardbox.scrollTop+1000;
    // this.setState({
    //   scroll:s
    // });
    // console.log(this.state.scroll);
  }

  //直接将room中的message赋给room_message，由room_message去渲染显示的消息
  handleClick(room){
    this.setState({
      visible:true,
      room_message:room.msg,
      guest:room.name
    })
  }

  handleCancel(){
    this.setState({
      visible:false
    })
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

  getTableContent(emoji){
    let n=emoji.length;
    //计算需要多少行，向上取整
    let row=Math.ceil(n/8);
    let rows,table=[];
    for(var r=0;r<row;r++){
        rows=[];
        for(var i=r*8;i<(r+1)*8;i++){
          //最后一行的数据有可能不满一行
            if (emoji[i]){
              //为了使key唯一
              //因为onClick的函数绑定了这个组件，因此构造出来的table不能给子组件继承
              rows.push(<td style={{cursor:'pointer'}} key={'emoji'+i} onClick={this.addEmoji.bind(this)}>
                        {emoji[i]}</td>)}
            else{
              break;
            }
          };
        table.push(<tr key={'row'+r}>{rows}</tr>)
        }
    //Browsers need the <tbody> tag. If it is not in your code,
    //then the browser will automatically insert it.
    //This will work fine on first render, but when the table gets updated,
    //then the DOM tree is different from what React expects.
    // This can give strange bugs, therefore React warns you to insert the <tbody>.
    // It is a really helpful warning.
    return <table><tbody>{table}</tbody></table>
  }

  showMsg(target){
    return target.map((msg,index) => {
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
  }

  render(){
    const r_message = this.state.r_message;
    //标示自己的名字
    const title="欢迎你，"+sessionStorage.name;
    //返回大厅信息，自己的信息在右边
    const msgComponent = this.showMsg(r_message)
    //查看自己聊天记录的模块
    const menuItem=this.state.rooms.map((room,index)=>{
      var list_name="与"+room.name+"的聊天";
      return <Menu.Item key={index} onClick={()=>this.handleClick(room)}>
                <img style={msgStyles.leftIcon} src={require('./img/chat.png')} alt="" />
                <b>{list_name}</b> </Menu.Item>
    })
    const menu = (<Menu>
                    {menuItem}
                  </Menu>);
    const room_message=this.showMsg(this.state.room_message);
    const room_title="与"+this.state.guest+"的聊天";
    //表情气泡卡片模块
    const pover=<Popover content={this.tableContent}>
        <img style={msgStyles.leftIcon} src={require('./img/emoji.png')} alt="" />
        </Popover>
    //上传模块
    const props = {
        name: 'file',
        //要在package.json中设置代理，否则会出现跨域错误
        action: '/upload/',
        headers: {
          authorization: 'authorization-text',
        },
        onChange(info) {
          if (info.file.status !== 'uploading') {
            console.log(info.file, info.fileList);
          }
          if (info.file.status === 'done') {
            message.success(`${info.file.name} file uploaded successfully`);
          } else if (info.file.status === 'error') {
            message.error(`${info.file.name} file upload failed.`);
          }
        },
      }
    const upload= <Upload {...props}>
      <img style={msgStyles.leftIcon} src={require('./img/upload.png')} alt="" />
      </Upload>
    // const upload= <form action="http://127.0.0.1:5000/upload/" method='post' enctype='multipart/form-data'>
    //     <img style={msgStyles.leftIcon} src={require('./img/upload.png')} alt="" />
    //     <p><input type='file' name='file' />
    //        <input type='submit' value='Upload' /></p></form>

    return(
    <div style={styles.mainBox}>
      <div>
        <h3>{title}</h3>
        <Dropdown overlay={menu}>
        <a className="ant-dropdown-link" style={{fontSize:15}}>
          查看您的私聊记录<Icon type="down" />
        </a>
      </Dropdown>
      </div>
      <div style={{float:"left"}}>
          <div style={styles.msgBox} ref='msgbox' title="上滑加载更多消息"
            onScroll={this.handleScroll.bind(this)}>
            {msgComponent}
            </div>
            <Input addonBefore={pover} addonAfter={upload} value={this.state.value} size="large"
            placeholder="Press Enter to send" onChange={this.saveValue.bind(this)}
            style={styles.antInput} onPressEnter={this.submitMessage.bind(this)}
            maxLength="250"/>
      </div>
      <Name socket={this.props.socket} emoji={emoji}/>
      <Modal width='650px' title={room_title} visible={this.state.visible}
          onCancel={this.handleCancel.bind(this)} key={Math.random()} footer={null}>
            <div style={styles.msgBox2}>
              {room_message}
              </div>
      </Modal>
    </div>
    )
  }
}
