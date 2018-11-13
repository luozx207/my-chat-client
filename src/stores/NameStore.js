import { EventEmitter } from 'events';//消息传递组件
import dispatcher from '../dispatcher';//调度员

class NameStore extends EventEmitter {
    constructor() {
        super();
        this.names =[];
    }

    getAll() {
        return this.names;
    }

    updateName(data) {
        this.names=data;
        this.emit('updateName');
    }

    addName(name){
      this.names.push(name);
      this.emit('updateName');
    }

    deleteName(name){
      let namelist=this.names;
      //js要删除数组中的元素只有遍历
      for(var i=0;i<namelist.length;i++){
        if (namelist[i]===name){
          //splice(位置，个数)
          this.names.splice(i,1);
          break;
        }
      };
      this.emit('updateName');
    }

    handleActions(action) {
        switch(action.type) {
            case 'SET_NAME': {
                this.updateName(action.name);
                break;
            }
            case 'DEL_NAME':{
              this.deleteName(action.name);
              break;
            }
            case 'ADD_NAME':{
              this.addName(action.name);
              break;
            }
            // case 'BADGE':{
            //   this.updateBadge(action.name);
            //   break;
            // }
            default:{
              break;
            }
        }
    }
}

const nStore = new NameStore();
//接收调度员事件的函数需要注册
dispatcher.register(nStore.handleActions.bind(nStore));
export default nStore;
