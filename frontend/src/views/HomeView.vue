<template>
    <div class="home">
      <div class="container py-5">
        <div class="text-center">
          <h1 class="display-4">Thư viện sách TM</h1>
          <p class="lead">Chào mừng đến với hệ thống quản lý thư viện và đăng ký mượn sách TM</p>
          <div class="mt-4">
            <router-link to="/login" class="btn btn-primary me-2">Đăng nhập</router-link>
            <router-link to="/register" class="btn btn-outline-primary">Đăng ký</router-link>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'HomeView'
  };
  </script>