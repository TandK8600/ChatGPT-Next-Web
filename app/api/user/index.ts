import axios from "axios";

let rootUrl = "http://gpt.yunwooo.com";

interface LoginData {
  account: string;
  password: string;
}

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
