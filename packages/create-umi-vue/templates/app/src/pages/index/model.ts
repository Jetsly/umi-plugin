export default {
  namespace: 'model',
  state: {
    isAuth: false,
    name: 'ddot',
  },
  reducers: {
    changeAuth(state) {
      state.isAuth = true;
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
