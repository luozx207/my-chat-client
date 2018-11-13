import React from 'react';
import Clock from './Clock.js';
import { Form, Col, Icon, Input, Button} from 'antd';
import history from './history';
import message from 'antd/lib/message';
import Modal from 'antd/lib/modal';

const FormItem = Form.Item;
const styles={
  loginbox:{
    margin:"auto",
    marginTop:150,
    width:300
  }
}

class LoginForm extends React.Component {
  constructor() {
      super();
      this.state = {
          names: [],
          visible:false
      };
  }

  //响应登录框用户名改变事件
  changeName(event){
    let name=event.target.value;
    this.setState({
      name:name,
      userState:null,
      userMsg:null
    })
  }
  //响应登录框密码改变事件
  changePassword(event){
    let pas=event.target.value;
    this.setState({
      password:pas,
      passState:null,
      passMsg:null
    })
  }
  //登录
  submit(){//将数据提交到后端验证
    // if (this.state.ustate==='success'){
    //   this.props.socket.emit('online', sessionStorage.name);
    //   history.push('/m')
    // }
    if (this.state.name&&this.state.password){
      console.log('login');
      this.props.socket.emit('login',{name:this.state.name,password:this.state.password})
    }
    else if(this.state.name){
      this.setState({
        passState:'error',
        passMsg:"密码不能为空"
      })
    }
    else{
      this.setState({
        userState:'error',
        userMsg:"用户名不能为空"
      })
    }
  }


  //点开注册框
  regist(){
    this.setState({
      visible:true
    })
  }
  //关闭注册框
  handleCancel(){
    //关闭注册框时要把所有注册的验证状态删除
    this.setState({
      visible:false,
      ustate:null,
      msg:null,
      pstate:null,
      pmsg:null
    })
  }
  //验证注册用户名不能重名
  validateName(event){
    let names=this.state.names;
    let name=event.target.value;
    let regist_name,status,msg=null;
    if (name && names.indexOf(name)<0){//名字不为空且不重复
      //列表.indexOf(元素)会输出元素在列表中的下标，如果没有找到此元素，返回-1
      regist_name=name;
      status='success';
      msg="";
    }
    else if (name){//名字重复
      status='error';
      msg="已有用户占用了这个名字";
    }
    else{//名字为空
      msg="请输入用户名";
    };
    this.setState({
        ustate:status,
        msg:msg,
        regist_name:regist_name
    });
  }
  //响应注册框密码改变
  setPassword(event){
    let p=event.target.value;
    this.setState({
      regist_password:p
    })
  }
  //响应注册框确认密码的改变
  confirmPassword(event){
    let p=event.target.value;
    this.setState({
      pstate:null,
      pmsg:null,
      confirm_password:p
    })
  }
  //提交注册信息
  regist_submit(){
    //用户名校验不通过直接跳过
    if (this.state.ustate!=='success'){}
    else if (!this.state.regist_password){
      this.setState({
        pstate:'error',
        pmsg:"密码不能为空"
      })
    }
    else if (this.state.regist_password!==this.state.confirm_password){
      this.setState({
        pstate:'error',
        pmsg:"两次输入的密码不一致"
      })
    }
    else{
      this.props.socket.emit('regist',{name:this.state.regist_name,password:this.state.regist_password})
      this.setState({
        visible:false
      })
    }
  }


  componentWillMount() {
    //加载聊天室中用户的名字
    //_isMounted的作用是判断组件是否加载，不加这个控制的话页面跳转后会出一个
    //Can't call setState (or forceUpdate) on an unmounted component.
    //的warning。不能在已经被销毁的组件中调用setState()方案
    //这是因为路由跳转后，当前组件被销毁，但组件内部还存在异步操作对state的状态信息
    //解决方法是设置组件被销毁之前，可以setState，销毁之后就不能setState
    this._isMounted = true;
    this.props.socket.on('all_name', (data) => {
          if (this._isMounted) {
            this.setState({
              names:data.data
              });
            }
        }
      );

    this.props.socket.on('login_feedback',(data)=>{
      switch (data.code) {
        case 0:
          sessionStorage.name=data.msg
          this.props.socket.emit('online', sessionStorage.name);
          history.push('/m');
          message.success('登录成功')
          break;
        case 1:
          message.error(data.msg)
          if (this._isMounted) {
            this.setState({
              passState:'error',
              passMsg:"请输入正确的密码"
              });
            }
          break;
        case 2:
          message.error(data.msg)
          if (this._isMounted) {
            this.setState({
              userState:'error',
              userMsg:"请重新输入用户名或注册"
              });
            }
          break;
        case 3:
          message.error(data.msg)
          if (this._isMounted) {
            this.setState({
              userState:'error',
              userMsg:"请更换用户登录"
              });
            }
          break;
        default:
          break;
      }
    })

    this.props.socket.on('regist_feedback',(data)=>{
      switch (data.code) {
        case 0:
          message.error(data.msg)
          break;
        case 1:
          message.success(data.msg)
          break;
        default:
          break;
      }
    })
  }

  componentWillUnmount() {
        this._isMounted = false
  }
  // <FormItem validateStatus={this.state.ustate} required={true}
  //   hasFeedback={true}
  //   help={this.state.msg}>
  render() {
    return (
      <div>
        <Clock />
        <Form style={styles.loginbox} className="login-form">
          <FormItem required={true} validateStatus={this.state.userState}
            hasFeedback={true} help={this.state.userMsg}>
              <Input prefix={<Icon type="user" style={{ fontSize: 13 }} />}
               placeholder="Please input user name" maxLength="40"
               onChange={this.changeName.bind(this)}/>
          </FormItem>
          <FormItem required={true} validateStatus={this.state.passState}
            hasFeedback={true} help={this.state.passMsg}>
              <Input prefix={<Icon type="lock" style={{ fontSize: 13 }} />}
               type="password" placeholder="Password" maxLength="20"
               onChange={this.changePassword.bind(this)}/>
          </FormItem>
          <Col>
            <Button type="primary" className="login-form-button"
            style={{marginRight:50}} onClick={this.submit.bind(this)}>
              登录
            </Button>
            <Button type="primary" className="login-form-button"
            onClick={this.regist.bind(this)}>
              注册
            </Button>
          </Col>
        </Form>
        <Modal width='450px' title={'注册'} visible={this.state.visible}
            onCancel={this.handleCancel.bind(this)}
            footer={null}>
            <Form className="login-form">
              <FormItem required={true} validateStatus={this.state.ustate}
                hasFeedback={true} help={this.state.msg} label="用户名">
                  <Input prefix={<Icon type="user" style={{ fontSize: 13 }} />}
                   placeholder="Please input a name" maxLength="40"
                   onChange={this.validateName.bind(this)}/>
              </FormItem>
              <FormItem required={true} label="密码">
                  <Input prefix={<Icon type="lock" style={{ fontSize: 13 }} />}
                   type="password" placeholder="Please set your password"
                   maxLength="20"
                   onChange={this.setPassword.bind(this)}/>
              </FormItem>
              <FormItem required={true} validateStatus={this.state.pstate}
                hasFeedback={true} help={this.state.pmsg} label="确认密码">
                  <Input prefix={<Icon type="lock" style={{ fontSize: 13 }} />}
                   type="password" placeholder="Please set your password"
                   maxLength="20"
                   onChange={this.confirmPassword.bind(this)}/>
              </FormItem>
                <Button type="primary" className="login-form-button"
                 onClick={this.regist_submit.bind(this)}>
                  提交
                </Button>
            </Form>
        </Modal>
      </div>
    );
  }
}

export default LoginForm
