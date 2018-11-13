import { EventEmitter } from 'events';//消息传递组件
import dispatcher from '../dispatcher';//调度员

class RoomMsgStore extends EventEmitter {
    constructor() {
        super();
        this.msgs =[];
    }

    getMsg(room) {
      var temp=[];
      var msgs=this.msgs;
      for (var i=0;i<msgs.length;i++){
          if (msgs[i].room===room){
            temp.push(msgs[i])
          }
        };
      return temp;
    }

    addMsg(data) {
        this.msgs.push(data)
    }

    saveMsg(data){
      this.msgs=data.concat(this.msgs);
      this.emit('push_room_msg');
    }

    send(){
      this.emit('push_room_msg');
    }
    handleActions(action) {
        switch(action.type) {
            case 'ADD_MESSAGE': {
                this.addMsg(action.data);
                break;
            }
            case 'ROOM_MESSAGE':{
              this.saveMsg(action.data);
              break;
            }
            case 'GET_MESSAGE':{
              console.log('send')
              this.send();
              break;
            }
            default:{
              break;
            }
        }
    }
}

const rStore = new RoomMsgStore();
//接收调度员事件的函数需要注册
dispatcher.register(rStore.handleActions.bind(rStore));
export default rStore;
