import axios from "axios";

let rootUrl = "https://gpt.yunwooo.com";

interface LoginData {
  account: string;
  password: string;
}

interface RecordData {
  /** 回答的消息 */
  answerMessages?: undefined;

  /** 结果花费的token */
  completionTokens?: number;

  /** 发送的消息 */
  messages?: undefined;

  /** 上一条消息返回的id，通过此种方式还原对话，没有父级则为0 */
  parentId?: string;

  /** 提示语花费的token */
  promptTokens?: number;

  /** 完整请求体 */
  requestBody?: undefined;

  /** 完整响应体 */
  responseBody?: undefined;

  /** 总共花费的token */
  totalTokens?: number;
}

// 登录
export function LoginApi(data: LoginData) {
  return new Promise((resolve, reject) => {
    axios
      .post(rootUrl + "/web/user/login", data)
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
  return new Promise((resolve, reject) => {
    axios
      .post(rootUrl + "/web/chat", data)
      .then((res) => {
        resolve(res.data);
      })
      .catch((err) => {
        reject(err);
      });
  });
}
