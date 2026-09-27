import api from '@/services/api'; // Import đối tượng API đã cấu hình sẵn axios

export default {
  namespaced: true, // Bật chế độ namespaced để module hoạt động độc lập trong store chính
  state: {
    publishers: [],    // Danh sách nhà xuất bản
    loading: false,    // Trạng thái đang tải (dùng cho spinner hoặc disable nút)
    error: null        // Thông báo lỗi khi thao tác thất bại
  },
  mutations: {
  SET_PUBLISHERS(state, publishers) {
    state.publishers = publishers; // Gán danh sách nhà xuất bản từ API vào state
  },
  SET_LOADING(state, status) {
    state.loading = status; // Bật hoặc tắt trạng thái loading
  },
  SET_ERROR(state, error) {
    state.error = error; // Gán thông báo lỗi khi có lỗi xảy ra
  }
},

  actions: {
  // Gọi API để lấy danh sách nhà xuất bản
  async fetchPublishers({ commit }) {
    try {
      commit('SET_LOADING', true); // Bắt đầu tải
      const response = await api.get('/nhaxuatban'); // Gọi API
      commit('SET_PUBLISHERS', response.data); // Lưu dữ liệu nhận được vào state
    } catch (error) {
      commit('SET_ERROR', error.message); // Ghi lại lỗi nếu xảy ra
    } finally {
      commit('SET_LOADING', false); // Tắt loading dù thành công hay thất bại
    }
  },

  // Gọi API để tạo một nhà xuất bản mới
  async createPublisher({ commit }, publisherData) {
    try {
      const response = await api.post('/nhaxuatban', publisherData); // Gửi dữ liệu mới lên server
      return response.data; // Trả về dữ liệu để sử dụng ngoài component
    } catch (error) {
      commit('SET_ERROR', error.message); // Ghi lỗi
      throw error; // Ném lỗi để component bắt và xử lý tiếp
    }
  },

  // Cập nhật thông tin nhà xuất bản
  async updatePublisher({ commit }, { id, publisherData }) {
    try {
      const response = await api.put(`/nhaxuatban/${id}`, publisherData); // Gửi PUT request
      return response.data;
    } catch (error) {
      commit('SET_ERROR', error.message); // Xử lý lỗi
      throw error;
    }
  },

  // Xóa một nhà xuất bản theo ID
  async deletePublisher({ commit }, id) {
    try {
      await api.delete(`/nhaxuatban/${id}`); // Gửi DELETE request
    } catch (error) {
        const errorMessage = error.response?.data?.message || 'Xóa nhà xuất bản thất bại';
            commit('SET_ERROR', errorMessage);
            console.error('Error in deletePublisher:', {
            message: error.message,
            stack: error.stack,
            response: error.response?.data
            });
            throw error;
            } finally {
                commit('SET_LOADING', false);
            }
    },
},

  getters: {
    allPublishers: state => state.publishers, // Lấy toàn bộ danh sách nhà xuất bản
    isLoading: state => state.loading, // Lấy trạng thái loading hiện tại
    error: state => state.error // Lấy lỗi hiện tại (nếu có)
  }
};