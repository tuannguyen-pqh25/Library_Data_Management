import api from '@/services/api';

export default {
  namespaced: true,

  state: {
    books: [],
    loading: false,
    error: null
  },

  mutations: {
    SET_BOOKS(state, books) {
      state.books = books;
    },
    SET_LOADING(state, status) {
      state.loading = status;
    },
    SET_ERROR(state, error) {
      state.error = error;
    }
  },

  actions: {
    async fetchBooks({ commit }) {
      try {
        commit('SET_LOADING', true);
        console.log('Fetching books...');
        const response = await api.get('/sach');
        console.log('API response for fetchBooks:', response.data);
        commit('SET_BOOKS', response.data);
      } catch (error) {
        console.error('Error in fetchBooks:', {
          message: error.message,
          stack: error.stack,
          response: error.response?.data
        });
        commit('SET_ERROR', error.message);
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },

    async createBook({ commit }, bookData) {
      try {
        console.log('Creating book with data:', bookData);
        const response = await api.post('/sach', bookData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        console.log('Create book response:', response.data);
        return response.data;
      } catch (error) {
        console.error('Error in createBook:', {
          message: error.message,
          stack: error.stack,
          response: error.response?.data
        });
        commit('SET_ERROR', error.message);
        throw error;
      }
    },

    async updateBook({ commit }, { id, bookData }) {
      try {
        console.log(`Updating book ${id} with data:`, bookData);
        const response = await api.put(`/sach/${id}`, bookData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        console.log('Update book response:', response.data);
        return response.data;
      } catch (error) {
        console.error('Error in updateBook:', {
          message: error.message,
          stack: error.stack,
          response: error.response?.data
        });
        commit('SET_ERROR', error.message);
        throw error;
      }
    },

    async deleteBook({ commit }, id) {
      try {
        console.log(`Deleting book ${id}`);
        const response = await api.delete(`/sach/${id}`);
        console.log('Delete book response:', response.data);
      } catch (error) {
        const errorMessage = error.response?.data?.message || 'Xóa nhà xuất bản thất bại';
        commit('SET_ERROR', errorMessage);
        console.error('Error in deleteBook:', {
          message: error.message,
          stack: error.stack,
          response: error.response?.data
        });
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    }
  },

  getters: {
    allBooks: state => state.books,
    isLoading: state => state.loading,
    error: state => state.error
  }
};