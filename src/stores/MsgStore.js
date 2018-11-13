import { EventEmitter } from 'events';//消息传递组件
import dispatcher from '../dispatcher';//调度员

class MsgStore extends EventEmitter {
    constructor() {
        super();
        this.msgs =[];
    }

    getAll() {
        return this.msgs;
    }

    updateMsg(data) {
        this.msgs.push(data);
        this.emit('pushNewMsg');
    }

    history(data){
      //判断一下这是不是第一波历史记录，如果是的话，调用可以使滚动窗滚到最底部的函数
      //注意js中，一个空数组的布尔值是true，所以判断是否空数组要用数组的length属性
      if (this.msgs.length===0){
        //注意历史消息要加在前面
        this.msgs=data.concat(this.msgs);
        this.emit('pushNewMsg');
      }
      else{
        this.msgs=data.concat(this.msgs);
        this.emit('loadMsg');
      }
    }

    handleActions(action) {
        switch(action.type) {
            case 'SEND_MESSAGE': {
                this.updateMsg(action.data);
                break;
            }
            case 'HISTORY_MESSAGE':{
              this.history(action.data);
              break;
            }
            default:{
              break;
            }
        }
    }
}

const mStore = new MsgStore();
//接收调度员事件的函数需要注册
dispatcher.register(mStore.handleActions.bind(mStore));
export default mStore;
