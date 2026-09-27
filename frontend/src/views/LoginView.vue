<!-- src/views/LoginView.vue -->
<template>
    <div class="login-view">
      <LoginForm />
    </div>
  </template>
  
  <script>
  import LoginForm from '@/components/auth/LoginForm.vue';
  
  export default {
    name: 'LoginView',
    components: {
      LoginForm
    }
  };
  </script>