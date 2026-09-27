<template>
    <div class="login-view">
      <ConfirmPasswordForm />
    </div>
  </template>
  
  <script>
  import ConfirmPasswordForm from '@/components/auth/ConfirmPasswordForm.vue';
  
  export default {
    name: 'ConfirmPassword',
    components: {
      ConfirmPasswordForm
    }
  };
  </script>