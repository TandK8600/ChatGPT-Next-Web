import axios from "axios";

// 正式环境
let rootUrl = "https://gpt.yunwooo.com";

interface LoginData {
  account: string;
  password: string;
}

interface accountType {
  account: string;
}

interface RegisterData {
 /** 账号 */
account?: string

/** 验证码 */
code: string 

/** codeId */
codeId: string

/** 密码 */
password?: string
}

interface RecordData {
  /** 回答的消息 */
  answerMessages?: Object;

  /** 结果花费的token */
  completionTokens?: number;

  /** 发送的消息 */
  messages?: string[];

  /** 上一条消息返回的id，通过此种方式还原对话，没有父级则为0 */
  parentId?: number;

  /** 提示语花费的token */
  promptTokens?: number;

  /** 完整请求体 */
  requestBody?: Object;

  /** 完整响应体 */
  responseBody?: Object | null;

  /** 总共花费的token */
  totalTokens?: number;

  /** 面具内容 */
  webMaskROList?: MaskData[];
  
}

interface MaskData {
   /** 面具内容 */
   maskMessages?: Object|null;

   /** 面具角色 */
   maskRole?: string;

}

// 登录
export function LoginApi(data: LoginData) {
  return new Promise((resolve, reject) => {
    axios
      .post(rootUrl + "/web/user/login", data)
      .then((res) => {
        localStorage.setItem("loginInfo", JSON.stringify(res));
        resolve(res.data);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

// 获取验证码
export function CodeApi( params: accountType) {
  return new Promise((resolve, reject) => {
    axios
      .get(rootUrl + "/web/user/verify-code",{params:params})
      .then((res) => {
        resolve(res.data);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

// 获取充值列表
export function ListApi() {
  const temporary = localStorage.getItem("temporary");
  const token =temporary?JSON.parse(temporary).data.token:'';
  return new Promise((resolve, reject) => {
    axios
      .get(rootUrl + "/web/user/set-meal-list",{
        headers: { authorization: `${token}` }
      })
      .then((res) => {
        resolve(res.data);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

// 获取账号状态
export function AccountApi() {
  const temporary = localStorage.getItem("temporary");
  const token =temporary?JSON.parse(temporary).data.token:'';
  return new Promise((resolve, reject) => {
    axios
      .get(rootUrl + "/web/user/verify",{
        headers: { authorization: `${token}` }
      })
      .then((res) => {
        resolve(res.data);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

// 生成订单
export function OrderApi(setMealId:number) {
  const temporary = localStorage.getItem("temporary");
  const token =temporary?JSON.parse(temporary).data.token:'';
  return new Promise((resolve, reject) => {
    axios
      .post(rootUrl + `/web/user/order/${setMealId}`,{},{
        headers: { authorization: `${token}` }
      })
      .then((res) => {
        resolve(res.data);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

// 查看订单状态
export function StatusApi(orderId:number) {
  const temporary = localStorage.getItem("temporary");
  const token =temporary?JSON.parse(temporary).data.token:'';
  return new Promise((resolve, reject) => {
    axios
      .get(rootUrl + `/web/user/order/${orderId}`
      )
      .then((res) => {
        resolve(res.data);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

// 注册
export function RegisterApi(data:RegisterData) {
  return new Promise((resolve, reject) => {
    axios
      .post(rootUrl + "/web/user/register", data)
      .then((res) => {
        resolve(res.data);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

// 找回密码
export function RenameApi(data:RegisterData) {
  return new Promise((resolve, reject) => {
    axios
      .put(rootUrl + "/web/user/password", data)
      .then((res) => {
        resolve(res.data);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

// 记录
export function RecordApi(data: RecordData) {
  const loginInfo = localStorage.getItem("loginInfo");
  const token =JSON.parse(String(loginInfo))?JSON.parse(String(loginInfo)).data.data.token:'';
  return new Promise((resolve, reject) => {
    axios
      .post(rootUrl + "/web/chat", data, {
        headers: { authorization: `${token}` }
      })
      .then((res) => {
        resolve(res.data);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

// 过期时间
export function ExpireApi() {
  const loginInfo = localStorage.getItem("loginInfo");
  const token =JSON.parse(String(loginInfo))?JSON.parse(String(loginInfo)).data.data.token:'';

  return new Promise((resolve, reject) => {
    axios
      .get(rootUrl + "/web/user/expire-time", {
        headers: { authorization: `${token}` },
      })
      .then((res) => {
        resolve(res.data);
        localStorage.setItem('expireTime',res.data.data)
      })
      .catch((err) => {
        // if(err.response.data && err.response.data.code === 401){
        //   alert(err.response.data.msg)
        //   setTimeout(()=>{
        //     localStorage.clear()
        //   },500)
        // }
        reject(err); 
      });
  });
}

// 获取accesstoken
// export function GetAccessTokenApi() {
//   return new Promise((resolve, reject) => {
//     axios
//       .get('https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=wx42fd3d14874e6406&secret=1d96441a9aa5d6a93ac45fb3f4b94d6b')
//       .then((res) => {
//         resolve(res.data);
//       })
//       .catch((err) => {
//         reject(err); 
//       });
//   });
// }