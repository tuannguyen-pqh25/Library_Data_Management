<template>
  <div class="book-management">
    <LoadingSpinner :show="loading" />
    
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>Quản lý sách</h2>
      <button class="btn btn-primary" @click="showAddModal = true">
        <i class="fas fa-plus"></i> Thêm sách mới
      </button>
    </div>

    <!-- Error Alert -->
    <div v-if="error" class="alert alert-danger alert-dismissible fade show" role="alert">
      {{ error }}
      <button type="button" class="btn-close" @click="clearError"></button>
    </div>

    <!-- Search Box -->
    <div class="row mb-4">
      <div class="col-md-6">
        <div class="input-group">
          <input 
            type="text" 
            class="form-control" 
            v-model="searchTerm"
            placeholder="Tìm kiếm sách theo tên sách, mã sách, tên nhà xuất bản"
            @input="searchBooks"
          >
          <button class="btn btn-outline-secondary" type="button" @click="searchBooks">
            <i class="fas fa-search"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Books Table -->
    <div class="table-responsive">
      <table class="table table-striped">
        <thead>
          <tr>
            <th>Mã sách</th>
            <th>Tên sách</th>
            <th>Nhà xuất bản</th>
            <th>Tác giả</th>
            <th>Đơn giá</th>
            <th>Số quyển</th>
            <th>Năm XB</th>
            <th>Nguồn gốc</th>
            <th>Hình ảnh</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="book in filteredBooks" :key="book.maSach">
            <td>{{ book.maSach }}</td>
            <td>{{ book.tenSach }}</td>
            <td>{{ book.NhaXuatBan?.tenNXB || 'N/A' }}</td>
            <td>{{ book.TacGia?.tenTacGia || 'N/A' }}</td>
            <td>{{ formatCurrency(book.donGia) }}</td>
            <td :class="getQuantityClass(book.soLuongHienCo)">
              {{ book.soLuongHienCo }}
              <br>
              <small v-if="book.soLuongHienCo <= 3" class="text-muted">
                {{ getQuantityMessage(book.soLuongHienCo) }}
              </small>
            </td>
            <td>{{ book.namXuatBan }}</td>
            <td>{{ book.nguonGoc }}</td>
            <td>
              <img :src="`${API_URL}/${book.imagePath || 'uploads/default-book.jpg'}`" style="max-width: 100px;" alt="Book cover">
            </td>
            <td>
              <button class="btn btn-sm btn-info me-2" @click="editBook(book)">
                <i class="fas fa-edit"></i>
              </button>
              <button class="btn btn-sm btn-danger" @click="confirmDelete(book)">
                <i class="fas fa-trash"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Add/Edit Modal -->
    <div class="modal" tabindex="-1" :class="{ 'd-block': showAddModal }">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ editingBook ? 'Sửa thông tin sách' : 'Thêm sách mới' }}</h5>
            <button type="button" class="btn-close" @click="closeModal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="handleSubmit" novalidate>
              <div class="mb-3" v-if="editingBook">
                <label class="form-label">Mã sách <span class="text-danger">*</span></label>
                <input 
                  type="text" 
                  class="form-control"
                  :class="{ 'is-invalid': errors.maSach }"
                  v-model="bookForm.maSach"
                  readonly
                >
                <div class="invalid-feedback" v-if="errors.maSach">
                  {{ errors.maSach }}
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label">Tên sách <span class="text-danger">*</span></label>
                <input 
                  type="text" 
                  class="form-control"
                  :class="{ 'is-invalid': errors.tenSach }"
                  v-model="bookForm.tenSach"
                  required
                  @input="validateField('tenSach')"
                >
                <div class="invalid-feedback" v-if="errors.tenSach">
                  {{ errors.tenSach }}
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label">Nhà xuất bản <span class="text-danger">*</span></label>
                <select 
                  class="form-select"
                  :class="{ 'is-invalid': errors.maNXB }"
                  v-model="bookForm.maNXB"
                  required
                  @change="validateField('maNXB')"
                >
                  <option value="">Chọn nhà xuất bản</option>
                  <option v-for="publisher in publishers" :key="publisher.maNXB" :value="publisher.maNXB">
                    {{ publisher.tenNXB }}
                  </option>
                </select>
                <div class="invalid-feedback" v-if="errors.maNXB">
                  {{ errors.maNXB }}
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label">Tác giả <span class="text-danger">*</span></label>
                <select 
                  class="form-select"
                  :class="{ 'is-invalid': errors.maTacGia }"
                  v-model="bookForm.maTacGia"
                  required
                  @change="validateField('maTacGia')"
                >
                  <option value="">Chọn tác giả</option>
                  <option v-for="author in authors" :key="author.maTacGia" :value="author.maTacGia">
                    {{ author.tenTacGia }}
                  </option>
                </select>
                <div class="invalid-feedback" v-if="errors.maTacGia">
                  {{ errors.maTacGia }}
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label">Thể loại <span class="text-danger">*</span></label>
                <select 
                  class="form-select"
                  :class="{ 'is-invalid': errors.maTheLoai }"
                  v-model="bookForm.maTheLoai"
                  required
                  @change="validateField('maTheLoai')"
                >
                  <option value="">Chọn thể loại</option>
                  <option v-for="category in categories" :key="category.maTheLoai" :value="category.maTheLoai">
                    {{ category.tenTheLoai }}
                  </option>
                </select>
                <div class="invalid-feedback" v-if="errors.maTheLoai">
                  {{ errors.maTheLoai }}
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label">Đơn giá <span class="text-danger">*</span></label>
                <input 
                  type="number" 
                  class="form-control"
                  :class="{ 'is-invalid': errors.donGia }"
                  v-model.number="bookForm.donGia"
                  min="0"
                  required
                  @input="validateField('donGia')"
                >
                <div class="invalid-feedback" v-if="errors.donGia">
                  {{ errors.donGia }}
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label">Số lượng hiện có <span class="text-danger">*</span></label>
                <input 
                  type="number" 
                  class="form-control"
                  :class="{ 'is-invalid': errors.soLuongHienCo }"
                  v-model.number="bookForm.soLuongHienCo"
                  min="0"
                  required
                  @input="validateField('soLuongHienCo')"
                >
                <div class="invalid-feedback" v-if="errors.soLuongHienCo">
                  {{ errors.soLuongHienCo }}
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label">Năm xuất bản <span class="text-danger">*</span></label>
                <input 
                  type="number" 
                  class="form-control"
                  :class="{ 'is-invalid': errors.namXuatBan }"
                  v-model.number="bookForm.namXuatBan"
                  min="1900"
                  :max="new Date().getFullYear()"
                  required
                  @input="validateField('namXuatBan')"
                >
                <div class="invalid-feedback" v-if="errors.namXuatBan">
                  {{ errors.namXuatBan }}
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label">Nguồn gốc <span class="text-danger">*</span></label>
                <input 
                  type="text" 
                  class="form-control"
                  :class="{ 'is-invalid': errors.nguonGoc }"
                  v-model="bookForm.nguonGoc"
                  required
                  @input="validateField('nguonGoc')"
                >
                <div class="invalid-feedback" v-if="errors.nguonGoc">
                  {{ errors.nguonGoc }}
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label">Hình ảnh bìa sách</label>
                <input 
                  type="file" 
                  class="form-control"
                  @change="handleImageUpload"
                  accept="image/*"
                >
              </div>

              <div class="text-end">
                <button type="button" class="btn btn-secondary me-2" @click="closeModal">Hủy</button>
                <button type="submit" class="btn btn-primary" :disabled="loading || Object.keys(errors).length > 0">
                  {{ loading ? 'Đang xử lý...' : (editingBook ? 'Cập nhật' : 'Thêm mới') }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-backdrop fade show" v-if="showAddModal"></div>

    <!-- Delete Confirmation Modal -->
    <div class="modal" tabindex="-1" :class="{ 'd-block': showDeleteModal }">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Xác nhận xóa</h5>
            <button type="button" class="btn-close" @click="showDeleteModal = false"></button>
          </div>
          <div class="modal-body">
            <p>Bạn có chắc chắn muốn xóa sách "{{ selectedBook?.tenSach }}" không?</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="showDeleteModal = false">Hủy</button>
            <button type="button" class="btn btn-danger" @click="handleDelete" :disabled="loading">
              {{ loading ? 'Đang xử lý...' : 'Xóa' }}
            </button>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-backdrop fade show" v-if="showDeleteModal"></div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import { showError, showSuccess } from '@/utils/notifications';
import api from '@/services/api';

export default {
  name: 'BookManagement',
  components: { LoadingSpinner },
  
  setup() {
    const store = useStore();
    const showAddModal = ref(false);
    const showDeleteModal = ref(false);
    const editingBook = ref(null);
    const selectedBook = ref(null);
    const errors = ref({});
    const searchTerm = ref('');
    const imageFile = ref(null);
    const API_URL = import.meta.env.VITE_API_IMAGE_URL;

    const bookForm = ref({
      maSach: '',
      tenSach: '',
      maNXB: '',
      maTacGia: '',
      maTheLoai: '',
      donGia: null,
      soLuongHienCo: null,
      namXuatBan: new Date().getFullYear(),
      nguonGoc: ''
    });

    const loading = computed(() => store.getters['book/isLoading']);
    const error = computed(() => store.getters['book/error']);
    const books = computed(() => store.getters['book/allBooks']);
    const publishers = computed(() => store.getters['publisher/allPublishers']);
    const authors = computed(() => store.getters['author/allAuthors']);
    const categories = computed(() => store.getters['category/allCategories']); // Assuming category store exists

    const filteredBooks = computed(() => {
      if (!searchTerm.value) return books.value;
      const search = searchTerm.value.toLowerCase();
      return books.value.filter(book => 
        String(book.maSach).toLowerCase().includes(search) ||
        book.tenSach.toLowerCase().includes(search) ||
        book.NhaXuatBan?.tenNXB?.toLowerCase().includes(search) ||
        book.TacGia?.tenTacGia?.toLowerCase().includes(search) ||
        book.nguonGoc.toLowerCase().includes(search)
      );
    });

    const validateField = (field) => {
      const newErrors = { ...errors.value };
      const currentYear = new Date().getFullYear();

      if (field === 'tenSach') {
        if (!bookForm.value.tenSach) {
          newErrors.tenSach = 'Tên sách là bắt buộc';
        } else {
          delete newErrors.tenSach;
        }
      }

      if (field === 'maNXB') {
        if (!bookForm.value.maNXB) {
          newErrors.maNXB = 'Nhà xuất bản là bắt buộc';
        } else {
          delete newErrors.maNXB;
        }
      }

      if (field === 'maTacGia') {
        if (!bookForm.value.maTacGia) {
          newErrors.maTacGia = 'Tác giả là bắt buộc';
        } else {
          delete newErrors.maTacGia;
        }
      }

      if (field === 'maTheLoai') {
        if (!bookForm.value.maTheLoai) {
          newErrors.maTheLoai = 'Thể loại là bắt buộc';
        } else {
          delete newErrors.maTheLoai;
        }
      }

      if (field === 'donGia') {
        if (bookForm.value.donGia === null || bookForm.value.donGia === '') {
          newErrors.donGia = 'Đơn giá là bắt buộc';
        } else if (bookForm.value.donGia < 0) {
          newErrors.donGia = 'Đơn giá phải lớn hơn hoặc bằng 0';
        } else {
          delete newErrors.donGia;
        }
      }

      if (field === 'soLuongHienCo') {
        if (bookForm.value.soLuongHienCo === null || bookForm.value.soLuongHienCo === '') {
          newErrors.soLuongHienCo = 'Số lượng hiện có là bắt buộc';
        } else if (bookForm.value.soLuongHienCo < 0) {
          newErrors.soLuongHienCo = 'Số lượng hiện có phải lớn hơn hoặc bằng 0';
        } else {
          delete newErrors.soLuongHienCo;
        }
      }

      if (field === 'namXuatBan') {
        if (!bookForm.value.namXuatBan) {
          newErrors.namXuatBan = 'Năm xuất bản là bắt buộc';
        } else if (bookForm.value.namXuatBan < 1900 || bookForm.value.namXuatBan > currentYear) {
          newErrors.namXuatBan = `Năm xuất bản phải từ 1900 đến ${currentYear}`;
        } else {
          delete newErrors.namXuatBan;
        }
      }

      if (field === 'nguonGoc') {
        if (!bookForm.value.nguonGoc) {
          newErrors.nguonGoc = 'Nguồn gốc là bắt buộc';
        } else {
          delete newErrors.nguonGoc;
        }
      }

      errors.value = newErrors;
    };

    const validateForm = () => {
      const newErrors = {};
      const currentYear = new Date().getFullYear();

      if (!bookForm.value.tenSach) {
        newErrors.tenSach = 'Tên sách là bắt buộc';
      }
      if (!bookForm.value.maNXB) {
        newErrors.maNXB = 'Nhà xuất bản là bắt buộc';
      }
      if (!bookForm.value.maTacGia) {
        newErrors.maTacGia = 'Tác giả là bắt buộc';
      }
      if (!bookForm.value.maTheLoai) {
        newErrors.maTheLoai = 'Thể loại là bắt buộc';
      }
      if (bookForm.value.donGia === null || bookForm.value.donGia === '') {
        newErrors.donGia = 'Đơn giá là bắt buộc';
      } else if (bookForm.value.donGia < 0) {
        newErrors.donGia = 'Đơn giá phải lớn hơn hoặc bằng 0';
      }
      if (bookForm.value.soLuongHienCo === null || bookForm.value.soLuongHienCo === '') {
        newErrors.soLuongHienCo = 'Số lượng hiện có là bắt buộc';
      } else if (bookForm.value.soLuongHienCo < 0) {
        newErrors.soLuongHienCo = 'Số lượng hiện có phải lớn hơn hoặc bằng 0';
      }
      if (!bookForm.value.namXuatBan) {
        newErrors.namXuatBan = 'Năm xuất bản là bắt buộc';
      } else if (bookForm.value.namXuatBan < 1900 || bookForm.value.namXuatBan > currentYear) {
        newErrors.namXuatBan = `Năm xuất bản phải từ 1900 đến ${currentYear}`;
      }
      if (!bookForm.value.nguonGoc) {
        newErrors.nguonGoc = 'Nguồn gốc là bắt buộc';
      }

      errors.value = newErrors;
      return Object.keys(newErrors).length === 0;
    };

    const fetchData = async () => {
      try {
        console.log('Fetching data for books, publishers, authors, and categories...');
        await Promise.all([
          store.dispatch('book/fetchBooks'),
          store.dispatch('publisher/fetchPublishers'),
          store.dispatch('author/fetchAuthors'),
          store.dispatch('category/fetchCategories') // Assuming category store exists
        ]);
        console.log('Data fetched successfully');
      } catch (error) {
        console.error('Error fetching data:', {
          message: error.message,
          stack: error.stack,
          response: error.response?.data
        });
        showError(error.message || 'Lỗi khi tải dữ liệu');
      }
    };

    const closeModal = () => {
      showAddModal.value = false;
      editingBook.value = null;
      errors.value = {};
      bookForm.value = {
        maSach: '',
        tenSach: '',
        maNXB: '',
        maTacGia: '',
        maTheLoai: '',
        donGia: null,
        soLuongHienCo: null,
        namXuatBan: new Date().getFullYear(),
        nguonGoc: ''
      };
      imageFile.value = null;
    };

    const getQuantityClass = (quantity) => {
      if (quantity === 0) return 'text-danger fw-bold';
      if (quantity <= 3) return 'text-warning fw-bold';
      return 'text-success';
    };

    const getQuantityMessage = (quantity) => {
      if (quantity === 0) return 'Hết sách';
      if (quantity <= 3) return 'Sắp hết sách';
      return '';
    };

    const editBook = (book) => {
      editingBook.value = book;
      bookForm.value = { 
        maSach: book.maSach,
        tenSach: book.tenSach,
        maNXB: book.maNXB || book.NhaXuatBan?.maNXB || '',
        maTacGia: book.maTacGia || book.TacGia?.maTacGia || '',
        maTheLoai: book.maTheLoai || book.TheLoai?.maTheLoai || '',
        donGia: book.donGia ?? null,
        soLuongHienCo: book.soLuongHienCo ?? null,
        namXuatBan: book.namXuatBan,
        nguonGoc: book.nguonGoc,
        imagePath: book.imagePath || 'Uploads/default-book.jpg'
      };
      imageFile.value = null;
      showAddModal.value = true;
    };

    const confirmDelete = (book) => {
      selectedBook.value = book;
      showDeleteModal.value = true;
    };

    const handleDelete = async () => {
      try {
        console.log('Deleting book:', selectedBook.value.maSach);
        await store.dispatch('book/deleteBook', selectedBook.value.maSach);
        await fetchData();
        showDeleteModal.value = false;
        selectedBook.value = null;
        showSuccess('Xóa sách thành công');
        console.log('Book deleted successfully');
      } catch (error) {
        console.error('Error deleting book:', {
          message: error.message,
          stack: error.stack,
          response: error.response?.data
        });
        showError(error.message || 'Lỗi khi xóa sách');
      }
    };

    const handleSubmit = async () => {
      const isValid = validateForm();
      if (!isValid) {
        console.warn('Validation failed:', errors.value);
        return;
      }

      try {
        const formData = new FormData();
        if (editingBook.value) {
          formData.append('maSach', bookForm.value.maSach);
        }
        formData.append('tenSach', bookForm.value.tenSach);
        formData.append('maNXB', bookForm.value.maNXB);
        formData.append('maTacGia', bookForm.value.maTacGia);
        formData.append('maTheLoai', bookForm.value.maTheLoai);
        formData.append('donGia', bookForm.value.donGia);
        formData.append('soQuyen', bookForm.value.soLuongHienCo);
        formData.append('namXuatBan', bookForm.value.namXuatBan);
        formData.append('nguonGoc', bookForm.value.nguonGoc);
        if (imageFile.value) {
          formData.append('image', imageFile.value);
        }

        console.log('Submitting book:', {
          tenSach: bookForm.value.tenSach,
          maNXB: bookForm.value.maNXB,
          maTacGia: bookForm.value.maTacGia,
          maTheLoai: bookForm.value.maTheLoai,
          donGia: bookForm.value.donGia,
          soQuyen: bookForm.value.soLuongHienCo,
          namXuatBan: bookForm.value.namXuatBan,
          nguonGoc: bookForm.value.nguonGoc,
          hasImage: !!imageFile.value
        });

        if (editingBook.value) {
          await store.dispatch('book/updateBook', {
            id: editingBook.value.maSach,
            bookData: formData
          });
          showSuccess('Cập nhật sách thành công');
          console.log('Book updated successfully');
        } else {
          const response = await store.dispatch('book/createBook', formData);
          console.log('Create book response:', response);
          showSuccess('Thêm sách mới thành công');
        }
        await fetchData();
        closeModal();
      } catch (error) {
        console.error('Error submitting book:', {
          message: error.message,
          stack: error.stack,
          response: error.response?.data
        });
        let errorMessage = error.response?.data?.message || error.message || 'Lỗi khi lưu sách';
        if (error.response?.data?.code === 11000) {
          errorMessage = 'Mã sách đã tồn tại';
          errors.value.maSach = errorMessage;
        } else if (error.response?.data?.errors?.maTacGia) {
          errorMessage = 'Tác giả là bắt buộc';
          errors.value.maTacGia = errorMessage;
        } else if (error.response?.data?.errors?.maNXB) {
          errorMessage = 'Nhà xuất bản là bắt buộc';
          errors.value.maNXB = errorMessage;
        } else if (error.response?.data?.errors?.maTheLoai) {
          errorMessage = 'Thể loại là bắt buộc';
          errors.value.maTheLoai = errorMessage;
        }
        showError(errorMessage);
        if (error.response?.data?.errors) {
          errors.value = { ...errors.value, ...error.response.data.errors };
        }
      }
    };

    const handleImageUpload = (event) => {
      imageFile.value = event.target.files[0];
      console.log('Image selected:', imageFile.value?.name);
    };

    const formatCurrency = (value) => {
      return new Intl.NumberFormat('vi-VN', { 
        style: 'currency', 
        currency: 'VND' 
      }).format(value);
    };

    const clearError = () => {
      store.commit('book/SET_ERROR', null);
    };

    const searchBooks = () => {
      searchTerm.value = searchTerm.value.trim();
      console.log('Searching books with term:', searchTerm.value);
    };

    onMounted(fetchData);

    return {
      showAddModal,
      showDeleteModal,
      editingBook,
      selectedBook,
      bookForm,
      loading,
      getQuantityClass,
      getQuantityMessage,
      error,
      errors,
      books,
      publishers,
      authors,
      categories,
      searchTerm,
      filteredBooks,
      closeModal,
      editBook,
      confirmDelete,
      handleDelete,
      handleSubmit,
      formatCurrency,
      clearError,
      validateField,
      searchBooks,
      handleImageUpload,
      API_URL
    };
  }
};
</script>

<style scoped>
.modal {
  background-color: rgba(0, 0, 0, 0.5);
}
.form-label {
  font-weight: 500;
}
.text-danger {
  font-weight: bold;
  background-color: rgba(255, 0, 0, 0.1);
}
.text-warning {
  background-color: rgba(255, 193, 7, 0.1);
}
.text-success {
  color: #198754 !important;
}
.text-muted {
  font-size: 0.85em;
  font-style: italic;
}
</style>