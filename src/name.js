import React from 'react';
import NameStore from './stores/NameStore';
import * as RoomMsgAction from './actions/RoomMsgAction';
import * as NameAction from './actions/NameAction';
import Room from './room.js';
import Card from 'antd/lib/card';
import message from 'antd/lib/message';
import Badge from 'antd/lib/badge';
import Modal from 'antd/lib/modal';

const styles={
  cardInner:{
    fontSize:18,
    width:250,
    height:30,
    margin:5,
    textAlign:'left'
  },
  cardbox: {
      opacity:0.93,
      height: 605,
      width:280,
      padding: '8px',
      float:'right',
      overflow: 'auto',
      margin: '15px 15px 15px 0',
      boxShadow:'1px 1px 4px rgba(0,0,0,0.3),0 0 30px rgba(0,0,0,0.2) inset'
  },
}

export default class Name extends React.Component {
  constructor() {
      super();
      this.state = {
          names: NameStore.getAll(),
          visible:false
      };
  }
  componentWillMount() {
    //新用户获取当前在线用户列表
    this.props.socket.on('online_name', (data) => {
      //先判断一下在线用户是否为空，如果是空值且直接赋值，会改变store中name的数据类型
          if (data){
              NameAction.setName(data);
            }
          }
      );
    //前端接收一个新的在线用户
    this.props.socket.on('add_name',(name)=>{
      NameAction.addName(name);
      if (name!==sessionStorage.name){
          let info='用户'+name+'已上线'
          message.info(info,5);
      }
    });
    //响应用户离线事件，前端删除一个在线用户
    this.props.socket.on('del_name',(name)=>{
      NameAction.delName(name);
      let info='用户'+name+'已下线'
      message.info(info,5);
    });
    //接收store传过来的更新的用户列表
    NameStore.on('updateName', () => {
        this.setState({
            names:NameStore.getAll()
        });
    });
    //收到加入房间的邀请
    this.props.socket.on('invite',(data)=>{
      if (data['guest']===sessionStorage.name){
        this.props.socket.emit('join',data['room'])
        //应该把房间名和收到的消息数都绑定到在线用户的名字上
        //查看是否邀请的是自己，如果是，接受邀请，加入房间
        let name=data['invitor'];
        this.setState({
            [name]:{
              count:0,
              room:data['room']
            }
          })
        }
      else if (data['invitor']===sessionStorage.name) {
        //如果自己是发起者，要把房间名绑定在自己的邀请人上
        let name=data['guest']
        this.setState({
          visible:true,//弹窗弹出来
          guest:name,
          [name]:{
            count:0,
            room:data['room']
          }
        })
      }
    });
    //房间中收到新信息，先加到store中，Room组件再从store中筛选出本房间的信息
    this.props.socket.on('room_new_msg',(data) => {
      let name=data.name;
      //更新name页面的badge count
      //不是自己发的消息而且当前没有点开与对方的对话框
      if ((name!==sessionStorage.name)&&(this.state.guest!==name)){
      //一开始使用this.refs[name]来获取badge的节点，但是count是一个props
      //它是只读的，不能够通过node.count+=1来改变它的值，只能通过state传递
      //注意setState中key是变量和this.state[name]的写法
          this.setState({
            [name]:{
              //之前没加room，导致name中room的值不见了
              room:this.state[name].room,
              count:this.state[name].count+1
            }
          });
        }
      //此时room组件并没有渲染，因此要在外层将信息消息加到store里
      RoomMsgAction.addRoomMessage(data);
    })


    //把后端发过来的私聊消息存到store里
    this.props.socket.on('room_msg', (data) => {
      RoomMsgAction.saveRoomMessage(data)
    });
  }

  // componentDidMount(){
  //   if (this.state.visible===true){
  //     RoomMsgAction.getMessage()
  //   }
  // }

  handleClick(name){
    //先判断是不是点击了自己
    if (name!==sessionStorage.name){
      //首先，查看这个名字有没有绑定房间号，如果有绑定，说明此房间已经创建
      if(this.state[name]){
        //记录邀请人名字，传给弹出式聊天窗
        this.setState({
            visible:true,
            guest:name,
            [name]:{
              //之前没加room，导致name中room的值不见了
              room:this.state[name].room,
              count:0//未读消息计数归零
            }
          });
      }
      //如果没有，会查看后端的数据。
      else{
      //如果后端也没有数据，后端会创建房间，并发一个invite事件到前端，那时候绑定房间号
      this.props.socket.emit('check_room',{name:sessionStorage.name,guest:name})
      }
    }
}

  handleCancel(){
    this.setState({
      visible:false,
      guest:''//为了能接收到新消息通知
    })
  }

  render(){
    const title="与"+this.state.guest+"聊天中..."
    const nameList = this.state.names.map((name, index) => {
        return <div style={styles.cardInner} key={index} onClick={()=>this.handleClick(name)}>
                <div style={{cursor:'pointer',float:'left'}}>
                <img style={{width:18,height:18,marginRight:5}} src={require('./img/people_fill.png')} alt="" />
                <b style={{marginRight:10}}>{name}</b>
                </div>
                <Badge ref={name} count={this.state[name]&&this.state[name].count} /></div>;
    });//考虑this.state[name]没有初始值的情况
    //cursor:'pointer'可以实现鼠标悬停在元素上方时变成一只手
    return(
      <Card title="在线用户列表" style={styles.cardbox}>
        {nameList}
        <Modal width='650px' title={title} visible={this.state.visible}
            onCancel={this.handleCancel.bind(this)} key={Math.random()} footer={null}>
          <Room room={this.state[this.state.guest]&&this.state[this.state.guest].room}
          socket={this.props.socket} emoji={this.props.emoji}/>
        </Modal>
      </Card>
    )
  }
}
