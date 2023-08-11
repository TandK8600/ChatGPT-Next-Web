import { useState } from "react";
import { CodeApi, LoginApi,RegisterApi,ListApi,OrderApi } from "./api/user";
import "./styles/login.scss";

interface Response {
  code: number;
  msg: string;
  data: any | string;
}

export default function Login({changeType}:any) {
  const [formData, setFormData] = useState({ account: "", password: "" });
  const [signData, setSignData] = useState({ account: "",code:"", password1: "",password2: ""});
  const [sign,setSign] = useState(false)
  const [codeId,setCodeId]= useState('')
  const [count,setCount] = useState(60)
  const [buy,setBuy] = useState(false)
  const [order,setOrder] = useState(false)
  const [list,setList] = useState([])
  const [form,setForm] = useState(null)
  const buyOrder =async (id:number)=>{
    let data = (await OrderApi(id)) as Response
    if(data.code===200){
      setOrder(true)
      setForm(data.msg as any)
    }
  }
  const changeSign = ()=>{
    sign?setSign(false):setSign(true)
  }

  const signAccount =async ()=>{
    // 判空
    if(!signData.account||!signData.code||!signData.password1||!signData.password2){
      alert("请将信息填写完整")
      return
    }
    // 判两次密码
    if(signData.password1!==signData.password2){
      alert("两次密码不一致")
      return
    }
    // 提交
    const {code,data} = (await RegisterApi({'account':signData.account,'code':signData.code,'codeId':codeId,'password':signData.password2})) as Response;
    if(code===200){
      alert("注册成功，去登录")
      setSign(false)
    }
    else{
      alert(data)
    }
    
  }
  const getCode =async ()=>{
    if(count<60){
      alert("验证码已发送，请稍后重试")
      return
    }
    if(!signData.account||!(/^(13[0-9]|14[01456879]|15[0-3,5-9]|16[2567]|17[0-8]|18[0-9]|19[0-3,5-9])\d{8}$/).test(signData.account)){
      alert("请输入正确的手机号码")
      return
    }
    // 对接验证码
    const {code,data} = (await CodeApi({'account':signData.account})) as Response;
    if(code===200){
      setCodeId(data)
      const time = setInterval(()=>{
        setCount((count)=>{
          if(count===1){
            clearInterval(time)
          }
          return count>1?count-1:60
        })
        console.log(count);
      },1000)
    }
    if(code===604){
      alert(data)
    }
  }
  const submit = async () => {
    if (!formData.account) {
      alert("请填写您的账号");
      return;
    }
    if (!formData.password) {
      alert("请填写您的密码");
      return;
    }
    // 对接
    const data = (await LoginApi(formData)) as Response;
    if (data.code === 200) {
      // 对比时间，如果账号过期
      let myDate = new Date()
      let s1 = myDate.getTime()
      let s2 = new Date(data.data.expireTime.replace(/-/g,'/')).getTime()
      if(s1>=s2){
      // 账号过期的操作
      setBuy(true)
      localStorage.setItem("temporary", JSON.stringify(data));
      let res = (await ListApi()) as Response;
      if(res.code===200){
        setList(res.data)
      }
      alert("您的账号已过期");
      return
      }
      // 登录成功的操作
      changeType()
      alert("登录成功");
      localStorage.setItem("Infotoken", JSON.stringify(data));
      return;
    }
    if (data.code === 604) {
      alert(data.msg);
    }
   
  };
  const changePhone = (e: { target: { value: string } }) => {
    setFormData({ account: e.target.value, password: formData.password });
  };
  const changePassword = (e: { target: { value: string } }) => {
    setFormData({ account: formData.account, password: e.target.value });
  };
  const changeAccount = (e: { target: { value: string } }) => {
    setSignData({ account: e.target.value,code:signData.code,password1:signData.password1,password2:signData.password2 });
  };
  const changeCode = (e: { target: { value: string } }) => {
    setSignData({ account: signData.account,code:e.target.value,password1:signData.password1,password2:signData.password2 });
  };
  const changePassword1 = (e: { target: { value: string } }) => {
    setSignData({ account: signData.account,code:signData.code,password1:e.target.value,password2:signData.password2 });
  };
  const changePassword2 = (e: { target: { value: string } }) => {
    setSignData({ account: signData.account,code:signData.code,password1:signData.password1,password2:e.target.value });
  };

  return (

    <div >
      {buy?
        (<div className="login">
          <div className="login-main">
          <div className="login-delete" onClick={()=>changeType()}>+</div>
          <div className="login-title">
             <div>充值</div>
             <div></div>
          </div>
          {
            order?(
              <div>
                <iframe srcDoc={form as any} width={205} height={205}></iframe>
              </div>
            ):(
              <div className="list">
              {
                list.map((item:{name:string,content:string,price:string,setMealId:number})=>(
              <div className="form-box1" key={item.setMealId}>
               <div className="form-item">
                <div className="form-item-title">套餐名称：<span>{item.name}</span></div>
                <div className="form-item-title">套餐内容：<span>{item.content}</span></div>
                <div className="form-item-title">套餐价格：<span>{item.price}</span></div>
              </div>
              <div className="form-buy" onClick={()=>buyOrder(item.setMealId)}>购买</div>
              </div>
                ))
              }
              </div>
            )
          }
          </div>
        </div>)
      :
        (
          <div className="login">
            {
              sign?(
                <div className="login-main">
       <div className="login-delete" onClick={()=>changeType()}>+</div>
        <div className="login-title">
          <div>注册</div>
          <div></div>
         </div>
         <div className="form-box">
           <div className="form-item">
            <div className="form-item-title">账号</div>
             <input
              type="text"
              onChange={changeAccount}
              value={signData.account}
              placeholder="请输入账号"
            />
            <div className="form-item-get" onClick={getCode}>{count===60?'获取验证码':count+'s后重试'}</div>
          </div>
          <div className="form-item">
            <div className="form-item-title">验证码</div>
            <input
              type="text"
              onChange={changeCode}
              value={signData.code}
              placeholder="请输入验证码"
            />
            <div className="code"></div>
          </div>
          <div className="form-item">
            <div className="form-item-title">密码</div>
            <input
              type="password"
              onChange={changePassword1}
              value={signData.password1}
              placeholder="请输入密码"
            />
            <div className="code"></div>
          </div>
          <div className="form-item">
            <div className="form-item-title">确认密码</div>
            <input
              type="password"
              onChange={changePassword2}
              value={signData.password2}
              placeholder="请输入密码"
            />
            <div className="code"></div>
          </div>
          <div className="submit" onClick={signAccount}>
          注册
        </div>
        <div className="sign" onClick={changeSign}>
            登录
          </div>
        </div>
      </div>
              ):(
                <div className="login-main">
          <div className="login-delete" onClick={()=>changeType()}>+</div>
          <div className="login-title">
             <div>登录</div>
             <div></div>
           </div>
           <div className="form-box">
             <div className="form-item">
               <div className="form-item-title">账号</div>
               <input
                type="text"
                onChange={changePhone}
                value={formData.account}
                placeholder="请输入账号"
              />
            </div>
            <div className="form-item">
              <div className="form-item-title">密码</div>
              <input
                type="password"
                onChange={changePassword}
                value={formData.password}
                placeholder="请输入密码"
              />
              <div className="code"></div>
            </div>
          </div>
          <div className="submit" onClick={submit}>
            登录
          </div>
          <div className="sign" onClick={changeSign}>
            注册
          </div>
        </div>
              )
            }
          </div>
        )
      }
    </div>
  );
}
