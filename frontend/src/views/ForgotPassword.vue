<template>
    <div class="login-view">
      <ForgotPasswordForm />
    </div>
  </template>
  
  <script>
  import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm.vue';
  
  export default {
    name: 'ForgotPassword',
    components: {
      ForgotPasswordForm
    }
  };
  </script>