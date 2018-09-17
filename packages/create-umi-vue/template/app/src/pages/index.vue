<template>
  <div>
    Hello, {{ name }}! <br />
    <button @click="onClick">touch me</button>
  </div>
</template>
<script>
export default {
  name: 'App',
  data() {
    return {
      name: 'World',
    };
  },
  methods: {
    onClick() {
      alert(1);
    },
  },
};
</script>
