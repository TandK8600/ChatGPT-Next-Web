import axios from 'axios'

let rootUrl = "https://api.freehands.cn/"

interface LoginData{
    account:string
    password:string
}

export function LoginApi(param:LoginData){
    return new Promise((resolve,reject)=>{
        axios.post(rootUrl+'/v1/users/login',param).then(res=>{
            resolve(res.data)
        }).catch((err)=>{
            reject(err)
        })
    })
}