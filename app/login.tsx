import { useEffect, useState } from "react";
import { CodeApi, LoginApi,RegisterApi,ListApi,OrderApi, StatusApi } from "./api/user";
import "./styles/login.scss";

interface Response {
  code: number;
  msg: string;
  data: any | string;
}

export default function Login({name}:any) {
  const [formData, setFormData] = useState({ account: "", password: "" });
  const [signData, setSignData] = useState({ account: "",code:"", password1: "",password2: ""});
  const [sign,setSign] = useState(false)
  const [codeId,setCodeId]= useState('')
  const [count,setCount] = useState(60)
  const [buy,setBuy] = useState(false)
  const [order,setOrder] = useState(false)
  const [list,setList] = useState([])
  const [form,setForm] = useState(null)
  const [link,setLink] = useState(false)
  const [info,setInfo] = useState({})

  useEffect(()=>{
    getList()
  },[])

  const getList =  (async ()=>{
    let res = (await ListApi()) as Response;
    if(res.code===200){
      setList(res.data)
    }
  })

  const buyOrder =async (id:number)=>{
    setInfo(list.filter((item:{name:string,content:string,price:string,setMealId:number})=>item.setMealId===id))
    let data = (await OrderApi(id)) as Response
    if(data.code===200){
      setOrder(true)
      setForm(data.data.alipayBody as any)
      // 如果弹窗还在---查询订单是否支付---支付之后关闭弹窗
      if(name[0]==="buy"){
        const time = setInterval(async ()=>{
          let res = (await StatusApi(data.data.orderId)) as any
          if(res.data==="1"){
            clearInterval(time)
            name[1]()
            setBuy(false)
            alert('支付成功')
          }
        },1000)
      }
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
    // 对接登录
    LoginApi(formData).then((res: any) => {
        localStorage.setItem("temporary", JSON.stringify(res));
        alert("登录成功")
        name[1]()
        name[3](false)
        // 判断是否过期---过期续费---没过期弹窗隐藏
    },(err)=>{
      // 未授权
      console.log("登录失败",err);
        // 未授权
        if(err.response.status===401){
          // 禁用---联系客服页面
          if(err.response.data.code===403){
            // 触发改变
            name[2]("link")
            setLink(true)
          }
          alert(err.response.data.msg)
          console.log(err.response);
        }
    });
   
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
      {name[0]==="buy"||buy?
        (<div className="login">
          <div className="login-main">
          <div className="login-delete" onClick={()=>name[1]()}>+</div>
          <div className="login-title">
             <div>充值</div>
             <div></div>
          </div>
          {
            order?(
              <div>
                <div className="iframe">
                <iframe srcDoc={form as any} width={205} height={205}></iframe>
                </div>
              </div>
            ):(
              <div className="list">
              {
                list.map((item:{name:string,content:string,price:string,setMealId:number})=>(
             
              <div key={item.setMealId} className="form-box1" >
               <div className="form-item">
                <div className="form-item-title"><span className="name">{item.name}</span></div>
                <div className="form-item-title">介绍：<span>{item.content}</span></div>
                <div className="form-item-title">价格：<span className="price">￥{item.price}</span></div>
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
      name[0]==="link"||link?(
        <div className="login">
          <div className="login-main">
          <div className="login-delete" onClick={()=>name[1]()}>+</div>
          <div className="login-title">联系客服</div>
          <div  className="login-img"></div>
          </div>
        </div>
      ):
        (
          <div className="login">
            {
              sign?(
                <div className="login-main">
       <div className="login-delete" onClick={()=>name[1]()}>+</div>
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
              className="form-item-input"
            />
            <div className="form-item-get" onClick={getCode}>{count===60?'获取验证码':count+'s后重试'}</div>
          </div>
          <div className="form-item">
            <div className="form-item-title">验证码</div>
            <input
              type="text"
              onChange={changeCode}
              value={signData.code}
              className="form-item-input"
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
        <div className="addtional">
          <span >已有账号？</span>
          <span className="addtional-active" onClick={changeSign}>去登录</span>
        </div>
        </div>
      </div>
              ):(
                <div className="login-main">
          <div className="login-delete" onClick={()=>name[1]()}>+</div>
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
                className="form-item-input"
              />
            </div>
            <div className="form-item">
              <div className="form-item-title">密码</div>
              <input
                type="password"
                onChange={changePassword}
                value={formData.password}
                placeholder="请输入密码"
                className="form-item-input"
              />
              <div className="code"></div>
            </div>
          </div>
          <div className="submit" onClick={submit}>
            登录
          </div>
           <div className="addtional">
          <span>还没有账号？</span>
          <span className="addtional-active" onClick={changeSign}>去注册</span>
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
