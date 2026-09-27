// frontend/src/store/index.js

// Import hàm createStore từ Vuex 4 (Vue 3 sử dụng Vuex 4)
import { createStore } from 'vuex';

// Import các module con (state chia theo chức năng riêng biệt)
import auth from './modules/auth';           // Xử lý đăng nhập, đăng ký, xác thực
import book from './modules/book';           // Quản lý sách: thêm, sửa, xóa, tìm kiếm
import publisher from './modules/publisher'; // Quản lý nhà xuất bản
import borrow from './modules/borrow';       // Quản lý yêu cầu mượn/trả sách
import author from './modules/author';       // Quản lý tác giả sách
import category from './modules/category';   // Quản lý thể loại sách

// Tạo store chính và kết hợp các module
export default createStore({
  // Dùng object 'modules' để đưa tất cả module con vào store chính
  modules: {
    auth,       // Truy cập qua: store.state.auth, store.dispatch('auth/login'), ...
    book,       // store.state.book, store.dispatch('book/fetchBooks'), ...
    publisher,  // store.state.publisher, ...
    borrow,     // store.state.borrow, ...
    category,   // store.state.category, ...
    author      // store.state.author, ...
  }
});
