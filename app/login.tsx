import { useState } from "react";
import { LoginApi } from "./api/user";
import "./styles/login.scss";

interface Response {
  code: number;
  msg: string;
  data: any | string;
}

export default function Login() {
  const [formData, setFormData] = useState({ account: "", password: "" });
  const [isLogin, setIsLogin] = useState(true);
  const [title, setTitle] = useState("");
  const submit = async () => {
    console.log(formData);
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
    console.log(data);
    if (data.code === 200) {
      // 登录成功的操作
      localStorage.setItem("Infotoken", JSON.stringify(data));
      window.location.reload();
      return;
    }
    if (data.code === 604) {
      // 被禁用/过期的操作
      if (data.msg !== "账号或密码错误") {
        setIsLogin(false);
        setTitle(data.msg);
        return;
      }
    }
    alert(data.msg);
  };
  const changePhone = (e: { target: { value: string } }) => {
    setFormData({ account: e.target.value, password: formData.password });
  };
  const changeCode = (e: { target: { value: string } }) => {
    setFormData({ account: formData.account, password: e.target.value });
  };

  return (
    <div className="login">
      {isLogin ? (
        <div className="login-main">
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
                onChange={changeCode}
                value={formData.password}
                placeholder="请输入密码"
              />
              <div className="code"></div>
            </div>
          </div>
          <div className="submit" onClick={submit}>
            登录
          </div>
        </div>
      ) : (
        <div className="login-main">
          <div className="login-title">
            <div>提示</div>
            <div></div>
          </div>
          {/* 文案 */}
          <div className="login-content">{title}</div>
          {/* 二维码 */}
          <div className="login-code"></div>
        </div>
      )}
    </div>
  );
}
