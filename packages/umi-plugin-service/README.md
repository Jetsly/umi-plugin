# umi-plugin-service
[![NPM version](https://img.shields.io/npm/v/@ddot/umi-plugin-service.svg?style=flat-square)](https://npmjs.org/package/@ddot/umi-plugin-service)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
[![MIT](https://img.shields.io/dub/l/vibe-d.svg?style=flat-square)](http://opensource.org/licenses/MIT)


`umi`服务接口插件。

## 配置

**.umirc.service.yaml**

```js
export default {
  plugins: [
    [
      'umi-plugin-service'
    ]
  ]
};
```

## 目录及约定

```
.
├── dist/                          
├── mock/                         
└── src/                
    ├── layouts/index.js          
    ├── pages/    
    └── api                // 接口定义文件存放目录，里面的文件会被umi自动读取
      ├── user.yaml
      └── auth.yaml                   
├── .umirc.js                     
├── .umirc.service.yaml                     
├── .env                          
└── package.json
```


## 服务文件约定

auth.yaml 

```yaml
login:
   method: POST
   url: /login
```

user.yaml 

```yaml
getUser:
  url: /login/{userId}/{info}
```

## 扩展API

当使用本插件后，`umi`项目中会新增一个API: `@ddot/umi-service`，你可以通过引入这个新的API，获得关于服务接口功能在编程上的便利。

```javascript
import { login, getUser } from "@ddot/umi-service";

login({ data });
getUser({ userId: "", info: "" });
```

```javascript
import { getUser } from "@ddot/umi-service";

export default {
  effects: {
    *loginIn({ payload }, { call }) {
      yield call(login);
    },
    *getUser({ payload }, { call }) {
      yield call(getUser, {
        userId: payload.userId,
        info: payload.info,
      });
    }
  }
};
```

## 追加ts提示


tsconfig.json
```json
    ...
    "baseUrl": ".",
    "paths": {
      "@ddot/umi-service": ["./src/pages/.umi/umi-service"],
      ...
    },
```