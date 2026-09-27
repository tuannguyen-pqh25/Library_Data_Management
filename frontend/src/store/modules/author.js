import api from '@/services/api';

export default {
  namespaced: true,

  state: {
    authors: [],
    loading: false,
    error: null
  },

  mutations: {
    SET_AUTHORS(state, authors) {
      state.authors = authors;
    },
    SET_LOADING(state, status) {
      state.loading = status;
    },
    SET_ERROR(state, error) {
      state.error = error;
    }
  },

  actions: {
    async fetchAuthors({ commit }) {
      try {
        commit('SET_LOADING', true);
        console.log('Fetching authors...');
        const response = await api.get('/tacgia');
        console.log('API response for fetchAuthors:', response.data);
        commit('SET_AUTHORS', response.data);
      } catch (error) {
        console.error('Error in fetchAuthors:', {
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

    async createAuthor({ commit }, authorData) {
      try {
        console.log('Creating author with data:', authorData);
        const response = await api.post('/tacgia', authorData);
        console.log('Create author response:', response.data);
        return response.data;
      } catch (error) {
        console.error('Error in createAuthor:', {
          message: error.message,
          stack: error.stack,
          response: error.response?.data
        });
        commit('SET_ERROR', error.message);
        throw error;
      }
    },

    async updateAuthor({ commit }, { id, authorData }) {
      try {
        console.log(`Updating author ${id} with data:`, authorData);
        const response = await api.put(`/tacgia/${id}`, authorData);
        console.log('Update author response:', response.data);
        return response.data;
      } catch (error) {
        console.error('Error in updateAuthor:', {
          message: error.message,
          stack: error.stack,
          response: error.response?.data
        });
        commit('SET_ERROR', error.message);
        throw error;
      }
    },

    async deleteAuthor({ commit }, id) {
      try {
        console.log(`Deleting author ${id}`);
        const response = await api.delete(`/tacgia/${id}`);
        console.log('Delete author response:', response.data);
      } catch (error) {
        const errorMessage = error.response?.data?.message || 'Xóa tác giả thất bại';
        commit('SET_ERROR', errorMessage);
        console.error('Error in deleteAuthor:', {
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
    allAuthors: state => state.authors,
    isLoading: state => state.loading,
    error: state => state.error
  }
};