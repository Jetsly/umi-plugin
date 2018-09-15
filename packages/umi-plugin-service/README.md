# umi-plugin-service

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
    └── pages/                    
├── .umirc.js                     
├── .umirc.service.yaml                     
├── .env                          
└── package.json
```


## 服务文件约定


.umirc.service.yaml 

```yaml

login:
   method: POST
   url: /login/{oder}

logout:
   url: /logout
```

## 扩展API

当使用本插件后，`umi`项目中会新增一个API: `@umi/service`，你可以通过引入这个新的API，获得关于服务接口功能在编程上的便利。

```javascript
import service from '@umi/service'

service.login({data})

service.logout({data})

```