<template>
  <div class="book-management">
    <LoadingSpinner :show="loading" />
    
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>Quản lý sách</h2>
      <button class="btn btn-primary" @click="openAddModal">
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
          <tr v-for="book in filteredBooks" :key="`${book.maSach}:${book.maTacGia}:${book.maTheLoai}`">
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
      <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-lg">
        <div class="modal-content shadow-lg">
          <div class="modal-header bg-light">
            <h5 class="modal-title fw-bold text-dark">
              <i :class="editingBook ? 'fas fa-pen-to-square text-primary me-2' : 'fas fa-plus-circle text-primary me-2'"></i>
              {{ editingBook ? 'Sửa thông tin sách' : 'Thêm sách mới' }}
            </h5>
            <button type="button" class="btn-close" @click="closeModal" aria-label="Đóng"></button>
          </div>

          <form @submit.prevent="handleSubmit" novalidate class="d-flex flex-column" style="min-height: 0;">
            <div class="modal-body py-3 px-4">
              <div v-if="editingBook" class="alert alert-light border small text-muted py-2 px-3 mb-3 d-flex align-items-center gap-2">
                <i class="fas fa-info-circle text-primary"></i>
                <span>Chỉ cần chỉnh sửa những trường muốn thay đổi, sau đó bấm <strong>"Cập nhật"</strong> để lưu.</span>
              </div>

              <div class="row g-3">
                <!-- Mã sách (chỉ hiện khi sửa) -->
                <div class="col-md-4" v-if="editingBook">
                  <label class="form-label fw-medium small mb-1">Mã sách <span class="text-danger">*</span></label>
                  <input 
                    type="text" 
                    class="form-control bg-light"
                    :class="{ 'is-invalid': errors.maSach }"
                    v-model="bookForm.maSach"
                    readonly
                  >
                  <div class="invalid-feedback" v-if="errors.maSach">{{ errors.maSach }}</div>
                </div>

                <!-- Tên sách -->
                <div :class="editingBook ? 'col-md-8' : 'col-12'">
                  <label class="form-label fw-medium small mb-1">Tên sách <span v-if="!editingBook" class="text-danger">*</span></label>
                  <input 
                    type="text" 
                    class="form-control"
                    :class="{ 'is-invalid': errors.tenSach }"
                    v-model="bookForm.tenSach"
                    placeholder="Nhập tên sách..."
                    :required="!editingBook"
                    @input="validateField('tenSach')"
                  >
                  <div class="invalid-feedback" v-if="errors.tenSach">{{ errors.tenSach }}</div>
                </div>

                <!-- Nhà xuất bản -->
                <div class="col-md-6">
                  <label class="form-label fw-medium small mb-1" for="book-publisher">Nhà xuất bản <span v-if="!editingBook" class="text-danger">*</span></label>
                  <AdminSelect
                    id="book-publisher"
                    v-model="bookForm.maNXB"
                    :options="publisherOptions"
                    :invalid="!!errors.maNXB"
                    placeholder="Chọn nhà xuất bản"
                    @change="validateField('maNXB')"
                  />
                  <div class="invalid-feedback" v-if="errors.maNXB">{{ errors.maNXB }}</div>
                </div>

                <!-- Tác giả -->
                <div class="col-md-6">
                  <label class="form-label fw-medium small mb-1" for="book-author">Tác giả <span v-if="!editingBook" class="text-danger">*</span></label>
                  <AdminSelect
                    id="book-author"
                    v-model="bookForm.maTacGia"
                    :options="authorOptions"
                    :invalid="!!errors.maTacGia"
                    placeholder="Chọn tác giả"
                    @change="validateField('maTacGia')"
                  />
                  <div class="invalid-feedback" v-if="errors.maTacGia">{{ errors.maTacGia }}</div>
                </div>

                <!-- Thể loại -->
                <div class="col-md-6">
                  <label class="form-label fw-medium small mb-1" for="book-category">Thể loại <span v-if="!editingBook" class="text-danger">*</span></label>
                  <AdminSelect
                    id="book-category"
                    v-model="bookForm.maTheLoai"
                    :options="categoryOptions"
                    :invalid="!!errors.maTheLoai"
                    placeholder="Chọn thể loại"
                    @change="validateField('maTheLoai')"
                  />
                  <div class="invalid-feedback" v-if="errors.maTheLoai">{{ errors.maTheLoai }}</div>
                </div>

                <!-- Năm xuất bản -->
                <div class="col-md-6">
                  <label class="form-label fw-medium small mb-1">Năm xuất bản <span v-if="!editingBook" class="text-danger">*</span></label>
                  <input 
                    type="number" 
                    class="form-control"
                    :class="{ 'is-invalid': errors.namXuatBan }"
                    v-model.number="bookForm.namXuatBan"
                    min="1900"
                    :max="new Date().getFullYear()"
                    :required="!editingBook"
                    @input="validateField('namXuatBan')"
                  >
                  <div class="invalid-feedback" v-if="errors.namXuatBan">{{ errors.namXuatBan }}</div>
                </div>

                <!-- Đơn giá -->
                <div class="col-md-6">
                  <label class="form-label fw-medium small mb-1">Đơn giá (VNĐ) <span v-if="!editingBook" class="text-danger">*</span></label>
                  <input 
                    type="number" 
                    class="form-control"
                    :class="{ 'is-invalid': errors.donGia }"
                    v-model.number="bookForm.donGia"
                    min="0"
                    placeholder="VD: 85000"
                    :required="!editingBook"
                    @input="validateField('donGia')"
                  >
                  <div class="invalid-feedback" v-if="errors.donGia">{{ errors.donGia }}</div>
                </div>

                <!-- Số lượng hiện có -->
                <div class="col-md-6">
                  <label class="form-label fw-medium small mb-1">Số quyển hiện có <span v-if="!editingBook" class="text-danger">*</span></label>
                  <input 
                    type="number" 
                    class="form-control"
                    :class="{ 'is-invalid': errors.soLuongHienCo }"
                    v-model.number="bookForm.soLuongHienCo"
                    min="0"
                    placeholder="VD: 10"
                    :required="!editingBook"
                    @input="validateField('soLuongHienCo')"
                  >
                  <div class="invalid-feedback" v-if="errors.soLuongHienCo">{{ errors.soLuongHienCo }}</div>
                </div>

                <!-- Nguồn gốc -->
                <div class="col-md-6">
                  <label class="form-label fw-medium small mb-1">Nguồn gốc <span v-if="!editingBook" class="text-danger">*</span></label>
                  <input 
                    type="text" 
                    class="form-control"
                    :class="{ 'is-invalid': errors.nguonGoc }"
                    v-model="bookForm.nguonGoc"
                    placeholder="VD: Việt Nam"
                    :required="!editingBook"
                    @input="validateField('nguonGoc')"
                  >
                  <div class="invalid-feedback" v-if="errors.nguonGoc">{{ errors.nguonGoc }}</div>
                </div>

                <!-- Hình ảnh bìa sách -->
                <div class="col-12 mt-2">
                  <label class="form-label fw-medium small mb-1">Hình ảnh bìa sách</label>
                  <div class="p-3 border rounded-3 bg-light d-flex align-items-center gap-3">
                    <!-- Ảnh bìa Preview / Hiện tại -->
                    <div class="position-relative flex-shrink-0" style="width: 64px; height: 86px;">
                      <img 
                        v-if="imagePreviewUrl" 
                        :src="imagePreviewUrl" 
                        alt="Preview ảnh mới" 
                        class="w-100 h-100 rounded border shadow-sm"
                        style="object-fit: cover;"
                      />
                      <img 
                        v-else-if="editingBook && bookForm.imagePath" 
                        :src="`${API_URL}/${bookForm.imagePath}`" 
                        @error="$event.target.style.display = 'none'"
                        alt="Ảnh bìa hiện tại" 
                        class="w-100 h-100 rounded border shadow-sm"
                        style="object-fit: cover;"
                      />
                      <div 
                        v-else 
                        class="w-100 h-100 rounded border bg-white d-flex flex-column align-items-center justify-content-center text-muted"
                        style="font-size: 11px;"
                      >
                        <i class="fas fa-image fa-2x mb-1 text-secondary opacity-50"></i>
                        <span>Chưa có ảnh</span>
                      </div>
                    </div>

                    <!-- Input chọn file và nút hủy chọn -->
                    <div class="flex-grow-1">
                      <div class="d-flex align-items-center gap-2 mb-1">
                        <input 
                          ref="fileInputRef"
                          type="file" 
                          class="form-control form-control-sm"
                          @change="handleImageUpload"
                          accept="image/*"
                        >
                        <button 
                          v-if="imageFile" 
                          type="button" 
                          class="btn btn-outline-danger btn-sm text-nowrap"
                          @click="clearSelectedImage"
                          title="Hủy chọn file mới"
                        >
                          <i class="fas fa-times me-1"></i>Bỏ chọn
                        </button>
                      </div>
                      <div class="small text-muted" style="font-size: 12px;">
                        <span v-if="imageFile" class="text-success fw-medium">
                          <i class="fas fa-check-circle me-1"></i>Đã chọn: {{ imageFile.name }}
                        </span>
                        <span v-else-if="editingBook">
                          <i class="fas fa-info-circle me-1 text-primary"></i>Để trống ô tải ảnh nếu muốn giữ nguyên ảnh bìa hiện tại.
                        </span>
                        <span v-else>
                          <i class="fas fa-info-circle me-1 text-secondary"></i>Tùy chọn tải ảnh bìa cho sách (.jpg, .png, .webp).
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Modal Footer (Luôn hiển thị cố định ở chân modal, không bị che khuất) -->
            <div class="modal-footer bg-light border-top justify-content-end py-2 px-4">
              <button type="button" class="btn btn-secondary px-3" @click="closeModal">
                <i class="fas fa-times me-1"></i>Hủy
              </button>
              <button type="submit" class="btn btn-primary px-4 fw-medium" :disabled="loading || Object.keys(errors).length > 0">
                <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status"></span>
                <i v-else :class="editingBook ? 'fas fa-save me-2' : 'fas fa-plus me-2'"></i>
                {{ loading ? 'Đang xử lý...' : (editingBook ? 'Cập nhật' : 'Thêm mới') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
    <div class="modal-backdrop fade show" v-if="showAddModal"></div>

    <!-- Delete Confirmation Modal -->
    <div class="modal fade" tabindex="-1" :class="{ 'd-block show': showDeleteModal }">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg" style="border-radius: 16px; overflow: hidden;">
          <div class="modal-header bg-danger text-white py-3 px-4">
            <h5 class="modal-title d-flex align-items-center gap-2 mb-0 fw-semibold fs-5">
              <i class="fas fa-trash-alt"></i>
              Xác nhận xóa sách
            </h5>
            <button type="button" class="btn-close btn-close-white" @click="showDeleteModal = false"></button>
          </div>
          <div class="modal-body text-center p-4">
            <div class="mb-3">
              <div class="d-inline-flex align-items-center justify-content-center rounded-circle" style="width: 64px; height: 64px; background-color: #FEE2E2; color: #DC2626;">
                <i class="fas fa-book-dead fa-2x"></i>
              </div>
            </div>
            <p class="fs-6 mb-1 text-secondary">Bạn có chắc chắn muốn xóa cuốn sách:</p>
            <h5 class="fw-bold text-danger mb-3">"{{ selectedBook?.tenSach }}"</h5>
            <div class="p-2 px-3 rounded-3 small text-muted" style="background-color: #F8FAFC; border: 1px dashed #CBD5E1;">
              <i class="fas fa-info-circle me-1 text-primary"></i>
              Hệ thống sẽ kiểm tra tính toàn vẹn (tồn kho và lịch sử mượn) trước khi thực hiện xóa.
            </div>
          </div>
          <div class="modal-footer bg-light border-0 justify-content-end py-3 px-4">
            <button type="button" class="btn btn-secondary px-4 rounded-pill" @click="showDeleteModal = false">Hủy</button>
            <button type="button" class="btn btn-danger px-4 rounded-pill" @click="handleDelete" :disabled="loading">
              <span v-if="loading" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
              {{ loading ? 'Đang xử lý...' : 'Xác nhận xóa' }}
            </button>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-backdrop fade show" v-if="showDeleteModal"></div>

    <!-- Warning / Error Dialog Modal -->
    <div class="modal fade" tabindex="-1" :class="{ 'd-block show': showWarningModal }">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg" style="border-radius: 16px; overflow: hidden;">
          <div class="modal-header bg-danger text-white py-3 px-4">
            <h5 class="modal-title d-flex align-items-center gap-2 mb-0 fw-semibold fs-5">
              <i class="fas fa-shield-alt"></i>
              {{ warningTitle }}
            </h5>
            <button type="button" class="btn-close btn-close-white" @click="showWarningModal = false" aria-label="Close"></button>
          </div>
          <div class="modal-body text-center p-4">
            <div class="mb-3">
              <div class="d-inline-flex align-items-center justify-content-center rounded-circle" style="width: 72px; height: 72px; background-color: #FEE2E2; color: #DC2626;">
                <i class="fas fa-exclamation-triangle fa-2x"></i>
              </div>
            </div>
            <h5 class="fw-bold text-dark mb-2">{{ warningMessage }}</h5>
            <div v-if="warningHint" class="alert alert-light border text-start small mb-0 p-3 mt-3 rounded-3" style="background-color: #F8FAFC; border-color: #E2E8F0 !important;">
              <div class="d-flex align-items-start gap-2">
                <i class="fas fa-info-circle text-primary mt-1"></i>
                <div class="text-secondary">{{ warningHint }}</div>
              </div>
            </div>
          </div>
          <div class="modal-footer bg-light border-0 justify-content-center py-3">
            <button type="button" class="btn btn-primary px-4 py-2 rounded-pill fw-medium" @click="showWarningModal = false">
              <i class="fas fa-check me-2"></i>Đã hiểu
            </button>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-backdrop fade show" v-if="showWarningModal"></div>
  </div>
</template>

<script>
import '@/assets/admin-management.css';
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import AdminSelect from '@/components/admin/AdminSelect.vue';
import { showError, showSuccess } from '@/utils/notifications';
import api from '@/services/api';

export default {
  name: 'BookManagement',
  components: { LoadingSpinner, AdminSelect },
  
  setup() {
    const store = useStore();
    const showAddModal = ref(false);
    const showDeleteModal = ref(false);
    const showWarningModal = ref(false);
    const warningTitle = ref('Không thể xóa sách');
    const warningMessage = ref('');
    const warningHint = ref('');
    const editingBook = ref(null);
    const selectedBook = ref(null);
    const errors = ref({});
    const searchTerm = ref('');
    const imageFile = ref(null);
    const imagePreviewUrl = ref(null);
    const fileInputRef = ref(null);
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

    const getOriginalBookValues = () => ({
      tenSach: editingBook.value.tenSach,
      maNXB: editingBook.value.maNXB || editingBook.value.NhaXuatBan?.maNXB || '',
      maTacGia: editingBook.value.maTacGia || editingBook.value.TacGia?.maTacGia || '',
      maTheLoai: editingBook.value.maTheLoai || editingBook.value.TheLoai?.maTheLoai || '',
      donGia: editingBook.value.donGia,
      soLuongHienCo: editingBook.value.soLuongHienCo,
      namXuatBan: editingBook.value.namXuatBan,
      nguonGoc: editingBook.value.nguonGoc,
    });

    const getChangedBookFields = () => {
      const originalValues = getOriginalBookValues();
      return Object.keys(originalValues).filter((field) =>
        String(bookForm.value[field] ?? '') !== String(originalValues[field] ?? '')
      );
    };

    const loading = computed(() => store.getters['book/isLoading']);
    const error = computed(() => store.getters['book/error']);
    const books = computed(() => store.getters['book/allBooks']);
    const publishers = computed(() => store.getters['publisher/allPublishers']);
    const authors = computed(() => store.getters['author/allAuthors']);
    const categories = computed(() => store.getters['category/allCategories']); // Assuming category store exists
    const publisherOptions = computed(() => publishers.value.map(publisher => ({
      value: publisher.maNXB,
      label: publisher.tenNXB
    })));
    const authorOptions = computed(() => authors.value.map(author => ({
      value: author.maTacGia,
      label: author.tenTacGia
    })));
    const categoryOptions = computed(() => categories.value.map(category => ({
      value: category.maTheLoai,
      label: category.tenTheLoai
    })));

    const filteredBooks = computed(() => {
      if (!searchTerm.value) return books.value;
      const search = searchTerm.value.trim().toLowerCase();
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
      if (editingBook.value) {
        getChangedBookFields().forEach(validateField);
        return Object.keys(errors.value).length === 0;
      }

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

    const clearSelectedImage = () => {
      imageFile.value = null;
      if (imagePreviewUrl.value) {
        URL.revokeObjectURL(imagePreviewUrl.value);
        imagePreviewUrl.value = null;
      }
      if (fileInputRef.value) {
        fileInputRef.value.value = '';
      }
    };

    const openAddModal = () => {
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
        nguonGoc: '',
        imagePath: ''
      };
      clearSelectedImage();
      showAddModal.value = true;
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
        nguonGoc: '',
        imagePath: ''
      };
      clearSelectedImage();
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
      errors.value = {};
      clearSelectedImage();
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
        imagePath: book.imagePath || ''
      };
      showAddModal.value = true;
    };

    const confirmDelete = (book) => {
      store.commit('book/SET_ERROR', null);
      selectedBook.value = book;
      showDeleteModal.value = true;
    };

    const handleDelete = async () => {
      try {
        console.log('Deleting book:', selectedBook.value.maSach);
        await store.dispatch('book/deleteBook', {
          maSach: selectedBook.value.maSach,
          maTacGia: selectedBook.value.maTacGia || selectedBook.value.TacGia?.maTacGia,
          maTheLoai: selectedBook.value.maTheLoai || selectedBook.value.TheLoai?.maTheLoai
        });
        await fetchData();
        showDeleteModal.value = false;
        selectedBook.value = null;
        showSuccess('Xóa sách thành công');
        console.log('Book deleted successfully');
      } catch (error) {
        const errorMessage = error.response?.data?.message || error.message || 'Lỗi khi xóa sách';
        store.commit('book/SET_ERROR', null);
        showDeleteModal.value = false;

        warningTitle.value = 'Không thể xóa sách!';
        warningMessage.value = errorMessage;

        if (errorMessage.includes('đang được mượn') || errorMessage.includes('chờ duyệt')) {
          warningHint.value = 'Quy tắc toàn vẹn: Sách này hiện đang có độc giả mượn hoặc nằm trong phiếu chờ duyệt. Không thể xóa sách khi độc giả chưa hoàn tất trả sách.';
        } else if (errorMessage.includes('còn trong kho')) {
          warningHint.value = 'Quy tắc toàn vẹn: Sách vẫn còn số lượng trong kho. Nếu sách đã thanh lý hết, vui lòng bấm "Sửa" và cập nhật số quyển về 0 trước khi xóa.';
        } else if (errorMessage.includes('lịch sử mượn/trả')) {
          warningHint.value = 'Quy tắc toàn vẹn: Sách đã phát sinh dữ liệu mượn/trả trong quá khứ. Hệ thống khóa xóa để bảo toàn dữ liệu lịch sử và báo cáo tài chính/thống kê của thư viện.';
        } else {
          warningHint.value = 'Quy tắc toàn vẹn: Vui lòng kiểm tra lại các ràng buộc dữ liệu liên quan đến cuốn sách này.';
        }

        showWarningModal.value = true;
        selectedBook.value = null;
        console.error('Error deleting book:', {
          message: error.message,
          stack: error.stack,
          response: error.response?.data
        });
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
          const changedFields = getChangedBookFields();
          if (changedFields.length === 0 && !imageFile.value) {
            showError('Bạn chưa thay đổi thông tin nào');
            return;
          }
          changedFields.forEach((field) => {
            formData.append(field, bookForm.value[field]);
          });
          if (imageFile.value) {
            formData.append('image', imageFile.value);
          }
        } else {
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
            identity: {
              maSach: editingBook.value.maSach,
              maTacGia: editingBook.value.maTacGia || editingBook.value.TacGia?.maTacGia,
              maTheLoai: editingBook.value.maTheLoai || editingBook.value.TheLoai?.maTheLoai
            },
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
      const file = event.target.files?.[0];
      if (file) {
        imageFile.value = file;
        if (imagePreviewUrl.value) {
          URL.revokeObjectURL(imagePreviewUrl.value);
        }
        imagePreviewUrl.value = URL.createObjectURL(file);
        console.log('Image selected:', file.name);
      }
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
      console.log('Searching books with term:', searchTerm.value);
    };

    onMounted(fetchData);

    return {
      showAddModal,
      showDeleteModal,
      showWarningModal,
      warningTitle,
      warningMessage,
      warningHint,
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
      publisherOptions,
      authorOptions,
      categoryOptions,
      searchTerm,
      filteredBooks,
      openAddModal,
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
      clearSelectedImage,
      imageFile,
      imagePreviewUrl,
      fileInputRef,
      API_URL
    };
  }
};
</script>

<style scoped>
.badge { font-size: 0.9em; }
.text-muted { font-size: 0.85em; font-style: italic; }
</style>