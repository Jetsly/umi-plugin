
<template>
  <div>
    Hello, {{ isAuth }} {{ name }} for {{lang}}! <br />
    <button @click="onClick">touch me</button>
  </div>
</template>
<script>
import { mapState, dispatch } from '@ddot/umi-vue';
export default {
  computed: {
    ...mapState({
      isAuth: state => state.model.isAuth,
    }),
    ...mapState('model', ['name']),
    ...mapState('global', ['lang']),
  },
  updated() {
    console.log(1);
  },
  methods: {
    onClick() {
      dispatch({ type: 'model/logout' });
    },
  },
};
</script>
