<template>
  <div ref="root" class="admin-select" :class="{ 'is-invalid': invalid, 'is-open': isOpen }">
    <button
      :id="id"
      class="admin-select-trigger"
      :class="{ 'has-value': selectedOption }"
      type="button"
      role="combobox"
      aria-haspopup="listbox"
      :aria-expanded="isOpen"
      :aria-controls="listboxId"
      :aria-activedescendant="isOpen && focusedIndex >= 0 ? optionId(focusedIndex) : undefined"
      :aria-invalid="invalid ? 'true' : undefined"
      @click="toggleMenu"
      @keydown="handleKeydown"
    >
      <span>{{ selectedOption?.label || placeholder }}</span>
      <i class="fas fa-chevron-down admin-select-chevron" aria-hidden="true"></i>
    </button>

    <ul v-if="isOpen" :id="listboxId" class="admin-select-menu" role="listbox">
      <li
        v-for="(option, index) in options"
        :id="optionId(index)"
        :key="String(option.value)"
        class="admin-select-option"
        :class="{
          'is-active': index === focusedIndex,
          'is-selected': isSelected(option)
        }"
        role="option"
        :aria-selected="isSelected(option)"
        @mouseenter="focusedIndex = index"
        @mousedown.prevent
        @click="selectOption(option)"
      >
        <span>{{ option.label }}</span>
        <i v-if="isSelected(option)" class="fas fa-check" aria-hidden="true"></i>
      </li>
      <li v-if="options.length === 0" class="admin-select-empty" role="presentation">
        Không có lựa chọn
      </li>
    </ul>
  </div>
</template>

<script>
import { computed, getCurrentInstance, onBeforeUnmount, onMounted, ref } from 'vue';

export default {
  name: 'AdminSelect',
  props: {
    id: {
      type: String,
      required: true
    },
    modelValue: {
      type: [String, Number],
      default: ''
    },
    options: {
      type: Array,
      default: () => []
    },
    placeholder: {
      type: String,
      required: true
    },
    invalid: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:modelValue', 'change'],
  setup(props, { emit }) {
    const root = ref(null);
    const isOpen = ref(false);
    const focusedIndex = ref(-1);
    const instanceId = getCurrentInstance().uid;
    const listboxId = `admin-select-listbox-${instanceId}`;

    const selectedOption = computed(() => props.options.find(isSelected));

    function isSelected(option) {
      return option.value === props.modelValue;
    }

    function optionId(index) {
      return `${listboxId}-option-${index}`;
    }

    function openMenu(index = -1) {
      isOpen.value = true;
      const selectedIndex = props.options.findIndex(isSelected);
      focusedIndex.value = index >= 0
        ? index
        : selectedIndex >= 0
          ? selectedIndex
          : props.options.length > 0
            ? 0
            : -1;
    }

    function closeMenu() {
      isOpen.value = false;
      focusedIndex.value = -1;
    }

    function toggleMenu() {
      if (isOpen.value) {
        closeMenu();
      } else {
        openMenu();
      }
    }

    function selectOption(option) {
      emit('update:modelValue', option.value);
      emit('change', option.value);
      closeMenu();
    }

    function handleKeydown(event) {
      if (event.key === 'Tab') {
        closeMenu();
        return;
      }

      if (event.key === 'Escape') {
        if (isOpen.value) {
          event.preventDefault();
          closeMenu();
        }
        return;
      }

      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        const direction = event.key === 'ArrowDown' ? 1 : -1;
        if (!isOpen.value) {
          const selectedIndex = props.options.findIndex(isSelected);
          const nextIndex = selectedIndex < 0
            ? direction > 0 ? 0 : props.options.length - 1
            : Math.min(Math.max(selectedIndex + direction, 0), props.options.length - 1);
          openMenu(nextIndex);
          return;
        }
        if (props.options.length > 0) {
          focusedIndex.value = (focusedIndex.value + direction + props.options.length) % props.options.length;
        }
        return;
      }

      if (event.key === 'Home' || event.key === 'End') {
        if (props.options.length > 0) {
          event.preventDefault();
          if (!isOpen.value) isOpen.value = true;
          focusedIndex.value = event.key === 'Home' ? 0 : props.options.length - 1;
        }
        return;
      }

      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        if (!isOpen.value) {
          openMenu();
        } else if (focusedIndex.value >= 0) {
          selectOption(props.options[focusedIndex.value]);
        }
      }
    }

    function handleOutsidePointer(event) {
      if (root.value && !root.value.contains(event.target)) {
        closeMenu();
      }
    }

    onMounted(() => document.addEventListener('pointerdown', handleOutsidePointer));
    onBeforeUnmount(() => document.removeEventListener('pointerdown', handleOutsidePointer));

    return {
      root,
      isOpen,
      focusedIndex,
      listboxId,
      selectedOption,
      isSelected,
      optionId,
      toggleMenu,
      selectOption,
      handleKeydown
    };
  }
};
</script>

<style scoped>
.admin-select {
  position: relative;
  width: 100%;
}

.admin-select-trigger {
  display: flex;
  width: 100%;
  min-height: 44px;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 9px 14px;
  border: 1px solid var(--admin-border, #e5eaf0);
  border-radius: 9px;
  background: #fff;
  color: var(--admin-ink, #192b3d);
  font: inherit;
  text-align: left;
  transition: border-color 160ms ease, box-shadow 160ms ease;
}

.admin-select-trigger:not(.has-value) {
  color: #718096;
}

.admin-select-trigger:hover,
.admin-select.is-open .admin-select-trigger,
.admin-select-trigger:focus-visible {
  border-color: #70b9ae;
  outline: none;
  box-shadow: 0 0 0 0.2rem rgb(17 124 112 / 12%);
}

.admin-select.is-invalid .admin-select-trigger {
  border-color: #dc3545;
}

.admin-select.is-invalid .admin-select-trigger:focus-visible {
  box-shadow: 0 0 0 0.2rem rgb(220 53 69 / 16%);
}

.admin-select-chevron {
  color: #627184;
  font-size: 0.8rem;
  transition: transform 160ms ease;
}

.admin-select.is-open .admin-select-chevron {
  transform: rotate(180deg);
}

.admin-select-menu {
  position: absolute;
  z-index: 1080;
  top: calc(100% + 6px);
  right: 0;
  left: 0;
  max-height: 250px;
  margin: 0;
  padding: 5px;
  overflow-y: auto;
  border: 1px solid var(--admin-border, #e5eaf0);
  border-radius: 11px;
  background: #fff;
  box-shadow: 0 14px 34px rgb(25 43 61 / 16%);
  list-style: none;
}

.admin-select-option {
  display: flex;
  min-height: 40px;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 11px;
  border-radius: 7px;
  color: var(--admin-ink, #192b3d);
  cursor: pointer;
  transition: color 120ms ease, background-color 120ms ease;
}

.admin-select-option.is-active {
  background: #e8f5f1;
  color: #0d685e;
}

.admin-select-option.is-selected {
  background: #117c70;
  color: #fff;
}

.admin-select-option.is-selected.is-active {
  background: #0d685e;
}

.admin-select-option i {
  font-size: 0.8rem;
}

.admin-select-empty {
  padding: 10px 11px;
  color: #718096;
}

@media (prefers-reduced-motion: reduce) {
  .admin-select-trigger,
  .admin-select-chevron,
  .admin-select-option {
    transition: none;
  }
}
</style>
