import api from '@/services/api';

export default {
  namespaced: true,

  state: {
    borrowRequests: [],
    borrowHistory: [],
    loading: false,
    error: null
  },

  mutations: {
    SET_BORROW_REQUESTS(state, requests) {
      state.borrowRequests = requests;
    },
    SET_BORROW_HISTORY(state, history) {
      state.borrowHistory = history;
    },
    SET_LOADING(state, status) {
      state.loading = status;
    },
    SET_ERROR(state, error) {
      state.error = error;
    },
    CLEAR_ERROR(state) {
      state.error = null;
    }
  },

  actions: {
    async fetchBorrowRequests({ commit }) {
      commit('SET_LOADING', true);
      try {
        const response = await api.get('/muonsach/admin/requests');
        const cleanedData = response.data.map(request => ({
          ...request,
          DocGia: request.DocGia || { hoLot: 'N/A', ten: '', maDocGia: 'N/A' },
          ChiTietPhieuMuons: request.ChiTietPhieuMuons.map(ct => ({
            ...ct,
            PhieuTra: ct.PhieuTra || null
          })) || []
        }));
        commit('SET_BORROW_REQUESTS', cleanedData);
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || 'Có lỗi xảy ra');
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },

    async fetchBorrowHistory({ commit }) {
      commit('SET_LOADING', true);
      try {
        const response = await api.get('/muonsach/history');
        const cleanedData = response.data.map(request => ({
          ...request,
          ChiTietPhieuMuons: request.ChiTietPhieuMuons.map(ct => ({
            ...ct,
            PhieuTra: ct.PhieuTra || null
          })) || []
        }));
        commit('SET_BORROW_HISTORY', cleanedData);
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || 'Có lỗi khi tải lịch sử mượn sách');
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },

    async createBorrowRequest({ commit }, { chiTiet }) {
      commit('SET_LOADING', true);
      try {
        const response = await api.post('/muonsach/request', { chiTiet });
        return response.data;
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || 'Có lỗi xảy ra');
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },

    async updateBorrowStatus({ commit }, { id, status }) {
      commit('SET_LOADING', true);
      try {
        const response = await api.put(`/muonsach/admin/requests/${id}`, { trangThai: status });
        return response.data;
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || 'Có lỗi xảy ra');
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },

    clearError({ commit }) {
      commit('CLEAR_ERROR');
    }
  },

  getters: {
    allBorrowRequests: state => state.borrowRequests,
    borrowHistory: state => state.borrowHistory,
    isLoading: state => state.loading,
    error: state => state.error
  }
};
