# umi-plugin-vue
[![NPM version](https://img.shields.io/npm/v/@ddot/umi-plugin-vue.svg?style=flat-square)](https://npmjs.org/package/@ddot/umi-plugin-vue)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
[![MIT](https://img.shields.io/dub/l/vibe-d.svg?style=flat-square)](http://opensource.org/licenses/MIT)


`umi`服务接口插件。

## 配置

**.umirc.js** 

`@ddot/umi-plugin-vue` 插件默认配置

```js
export default {
  plugins: [
    [
      '@ddot/umi-plugin-vue',
      {
        dva: {
          immer: true,
        },
        routes: {
          exclude: [/model/],
        },
      }
    ]
  ]
};
```


## 扩展API

当使用本插件后，`umi`项目中会新增一个API: `@ddot/umi-vue`

```html
<template>
  <div>
    Hello, {{ isAuth }} {{ name }}! <br />
    <button @click="onClick">touch me</button>
  </div>
</template>
<script>
import { mapState, dispatch } from '@ddot/umi-vue'
export default {
  computed: {
    ...mapState({
      isAuth: state => state.model.isAuth,
    }),
    ...mapState('model',[
      'name'
    ])
  },
  methods: {
    onClick() {
      dispatch({type:'model/logout'})
    },
  },
};
</script>
```

```javascript
export default {
  namespace: 'model',
  state: {
    isAuth: false,
    name: 'ddot', 
  },
  reducers: {
    changeAuth(state) {
      state.isAuth  = true;
    },
  },
  effects: {
    *logout(_, { call, put }) {
      yield put({
        type: 'changeAuth',
      });
    },
  },
};

```



