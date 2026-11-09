<!-- src/views/LoginView.vue -->
<template>
  <div class="login-view">
    <LoginForm :portalType="portalType" />
  </div>
</template>

<script>
import LoginForm from '@/components/auth/LoginForm.vue';

export default {
  name: 'LoginView',
  components: {
    LoginForm
  },
  props: {
    portalType: {
      type: String,
      default: 'reader'
    }
  }
};
</script>
