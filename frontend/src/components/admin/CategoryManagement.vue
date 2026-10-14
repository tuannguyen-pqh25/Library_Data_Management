<template>
  <div class="category-management">
    <LoadingSpinner :show="loading" />

    <!-- Header section -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>Quản lý thể loại</h2>
      <button class="btn btn-primary" @click="openAddModal">
        <i class="fas fa-plus"></i> Thêm thể loại mới
      </button>
    </div>

    <!-- Error Alert -->
    <div v-if="error" class="alert alert-danger alert-dismissible fade show" role="alert">
      {{ error }}
      <button type="button" class="btn-close" @click="clearError"></button>
    </div>

    <div class="row mb-4">
      <div class="col-md-6">
        <div class="input-group">
          <input
            type="text"
            class="form-control"
            v-model="searchTerm"
            placeholder="Tìm kiếm theo mã hoặc tên thể loại"
          >
          <span class="input-group-text">
            <i class="fas fa-search"></i>
          </span>
        </div>
      </div>
    </div>

    <!-- Danh sách thể loại -->
    <div class="table-responsive">
      <table class="table table-striped">
        <thead>
          <tr>
            <th>Mã thể loại</th>
            <th>Tên thể loại</th>
            <th>Số sách</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!filteredCategories?.length">
            <td colspan="4" class="text-center">Không có thể loại nào</td>
          </tr>
          <tr v-for="category in filteredCategories" :key="category.maTheLoai">
            <td>{{ category.maTheLoai }}</td>
            <td>{{ category.tenTheLoai }}</td>
            <td>{{ category.soLuongSach || 0 }}</td>
            <td>
              <button class="btn btn-sm btn-info me-2" @click="editCategory(category)">
                <i class="fas fa-edit"></i>
              </button>
              <button class="btn btn-sm btn-danger" @click="confirmDelete(category)">
                <i class="fas fa-trash"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal thêm/sửa thể loại -->
    <div class="modal" tabindex="-1" :class="{ 'd-block': showAddModal }">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              {{ editingCategory ? 'Sửa thông tin thể loại' : 'Thêm thể loại mới' }}
            </h5>
            <button type="button" class="btn-close" @click="closeModal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="handleSubmit" novalidate>
              <div class="mb-3" v-if="editingCategory">
                <label class="form-label">Mã thể loại <span class="text-danger">*</span></label>
                <input
                  type="text"
                  class="form-control"
                  :class="{ 'is-invalid': errors.maTheLoai }"
                  v-model="categoryForm.maTheLoai"
                  readonly
                >
                <div class="invalid-feedback" v-if="errors.maTheLoai">
                  {{ errors.maTheLoai }}
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label">Tên thể loại <span class="text-danger">*</span></label>
                <input
                  type="text"
                  class="form-control"
                  :class="{ 'is-invalid': errors.tenTheLoai }"
                  v-model="categoryForm.tenTheLoai"
                  required
                  @input="validateField('tenTheLoai')"
                >
                <div class="invalid-feedback" v-if="errors.tenTheLoai">
                  {{ errors.tenTheLoai }}
                </div>
              </div>

              <div class="text-end">
                <button type="button" class="btn btn-secondary me-2" @click="closeModal">Hủy</button>
                <button
                  type="submit"
                  class="btn btn-primary"
                  :disabled="loading"
                >
                  {{ loading ? 'Đang xử lý...' : (editingCategory ? 'Cập nhật' : 'Thêm mới') }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Xác nhận xóa -->
    <div class="modal" tabindex="-1" :class="{ 'd-block': showDeleteModal }">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Xác nhận xóa</h5>
            <button type="button" class="btn-close" @click="closeDeleteModal"></button>
          </div>
          <div class="modal-body">
            <p>Bạn có chắc chắn muốn xóa thể loại "<strong>{{ selectedCategory?.tenTheLoai }}</strong>" không?</p>
            <div v-if="selectedCategoryBooks.length" class="alert alert-warning mb-0">
              <p class="mb-2">
                Thể loại này đang có {{ selectedCategoryBooks.length }} sách liên kết. Không thể xóa cho đến khi chuyển các sách sang thể loại khác:
              </p>
              <ul class="mb-0">
                <li v-for="book in selectedCategoryBooks" :key="`${book.maSach}:${book.maTacGia}:${book.maTheLoai}`">
                  {{ book.tenSach }} (mã {{ book.maSach }})
                </li>
              </ul>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeDeleteModal">Hủy</button>
            <button
              type="button"
              class="btn btn-danger"
              @click="handleDelete"
              :disabled="loading || selectedCategoryBooks.length > 0"
            >
              {{ loading ? 'Đang xử lý...' : (selectedCategoryBooks.length ? 'Không thể xóa' : 'Xóa') }}
            </button>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-backdrop fade show" v-if="showAddModal || showDeleteModal"></div>
  </div>
</template>

<script>
import '@/assets/admin-management.css';
import { ref, onMounted, computed } from 'vue';
import { useStore } from 'vuex';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import { showError, showSuccess } from '@/utils/notifications';

export default {
  name: 'CategoryManagement',
  components: { LoadingSpinner },
  setup() {
    const store = useStore();
    const showAddModal = ref(false);
    const editingCategory = ref(null);
    const searchTerm = ref('');
    const showDeleteModal = ref(false);
    const selectedCategory = ref(null);
    const categoryForm = ref({
      maTheLoai: '',
      tenTheLoai: '',
    });
    const errors = ref({});

    const categories = computed(() => store.getters['category/allCategories'] || []);
    const loading = computed(() => store.getters['category/isLoading'] || false);
    const error = computed(() => store.getters['category/error']);
    const allBooks = computed(() => store.getters['book/allBooks'] || []);
    const selectedCategoryBooks = computed(() => {
      const categoryId = Number(selectedCategory.value?.maTheLoai);
      if (!categoryId) return [];
      return allBooks.value.filter((book) => Number(book.maTheLoai) === categoryId);
    });

    const filteredCategories = computed(() => {
      const cats = categories.value || [];
      if (!searchTerm.value.trim()) return cats;
      const search = searchTerm.value.toLowerCase().trim();
      return cats.filter(cat =>
        String(cat.maTheLoai).toLowerCase().includes(search) ||
        cat.tenTheLoai.toLowerCase().includes(search)
      );
    });

    const validateField = (field) => {
      const newErrors = { ...errors.value };
      if (field === 'tenTheLoai') {
        if (!categoryForm.value.tenTheLoai?.trim()) {
          newErrors.tenTheLoai = 'Tên thể loại là bắt buộc';
        } else {
          delete newErrors.tenTheLoai;
        }
      }
      errors.value = newErrors;
    };

    const validateForm = () => {
      errors.value = {};
      validateField('tenTheLoai');
      return Object.keys(errors.value).length === 0;
    };

    const fetchData = async () => {
      try {
        console.log('Fetching categories...');
        await Promise.all([
          store.dispatch('category/fetchCategories'),
          store.dispatch('book/fetchBooks')
        ]);
        console.log('Categories and books fetched successfully');
      } catch (err) {
        console.error('Error fetching categories:', {
          message: err.message,
          stack: err.stack,
          response: err.response?.data
        });
        showError('Lỗi khi tải dữ liệu: ' + (err.response?.data?.message || err.message));
      }
    };

    const closeModal = () => {
      showAddModal.value = false;
      editingCategory.value = null;
      categoryForm.value = {
        maTheLoai: '',
        tenTheLoai: '',
      };
      errors.value = {};
    };

    const openAddModal = () => {
      closeModal();
      showAddModal.value = true;
    };

    const closeDeleteModal = () => {
      showDeleteModal.value = false;
      selectedCategory.value = null;
    };

    const editCategory = (category) => {
      if (!category.maTheLoai) {
        console.error('Category maTheLoai is undefined');
        showError('Không tìm thấy mã thể loại');
        return;
      }
      editingCategory.value = category;
      categoryForm.value = { ...category };
      errors.value = {};
      showAddModal.value = true;
    };

    const confirmDelete = (category) => {
      if (!category.maTheLoai) {
        console.error('Category maTheLoai is undefined');
        showError('Không tìm thấy mã thể loại');
        return;
      }
      selectedCategory.value = category;
      showDeleteModal.value = true;
    };

    const handleDelete = async () => {
      try {
        if (!selectedCategory.value?.maTheLoai) {
          console.error('Category maTheLoai is undefined for deletion');
          showError('Không tìm thấy mã thể loại');
          return;
        }
        console.log('Deleting category:', selectedCategory.value.maTheLoai);
        await store.dispatch('category/deleteCategory', selectedCategory.value.maTheLoai);
        await fetchData();
        closeDeleteModal();
        showSuccess('Xóa thể loại thành công');
        console.log('Category deleted successfully');
      } catch (err) {
        console.error('Delete category error:', {
          message: err.message,
          stack: err.stack,
          response: err.response?.data
        });
        showError('Lỗi khi xóa thể loại: ' + (err.response?.data?.message || err.message));
      }
    };

    const handleSubmit = async () => {
      console.log('handleSubmit triggered');
      try {
        const isValid = validateForm();
        console.log('Validation result:', { isValid, errors: errors.value });
        if (!isValid) {
          console.warn('Validation failed:', errors.value);
          showError('Vui lòng kiểm tra lại các trường thông tin');
          return;
        }

        const categoryData = {
          tenTheLoai: categoryForm.value.tenTheLoai.trim(),
        };
        if (!editingCategory.value) {
          delete categoryData.maTheLoai; // Không gửi maTheLoai khi thêm mới
        }
        console.log('Submitting category data:', categoryData);

        if (editingCategory.value) {
          if (!editingCategory.value.maTheLoai) {
            console.error('maTheLoai is undefined for editing category');
            showError('Không tìm thấy mã thể loại');
            return;
          }
          await store.dispatch('category/updateCategory', {
            maTheLoai: editingCategory.value.maTheLoai,
            categoryData
          });
          showSuccess('Cập nhật thể loại thành công');
          console.log('Category updated successfully');
        } else {
          const response = await store.dispatch('category/createCategory', categoryData);
          console.log('Create category response:', response);
          showSuccess('Thêm thể loại thành công');
        }
        await fetchData();
        closeModal();
      } catch (err) {
        console.error('Error saving category:', {
          message: err.message,
          stack: err.stack,
          response: err.response?.data
        });
        if (err.response?.data?.errors) {
          errors.value = { ...errors.value, ...err.response.data.errors };
        }
        showError(err.response?.data?.message || err.message || 'Lỗi khi lưu thể loại');
      }
    };

    const clearError = () => {
      store.commit('category/SET_ERROR', null);
    };

    onMounted(fetchData);

    return {
      showAddModal,
      openAddModal,
      editingCategory,
      categoryForm,
      errors,
      loading,
      error,
      filteredCategories,
      searchTerm,
      closeModal,
      editCategory,
      handleSubmit,
      clearError,
      showDeleteModal,
      selectedCategory,
      selectedCategoryBooks,
      confirmDelete,
      closeDeleteModal,
      handleDelete
    };
  }
};
</script>
