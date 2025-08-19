const SingleSelect = {
  template: `
    <div style="position:relative;" ref="wrapper">
      <div class="multi-select" @click="focusInput">
        <span v-if="modelValue" class="tag">
          {{ modelValue }}
          <button type="button" @click.stop="clear" aria-label="Clear">&times;</button>
        </span>
        <input
          type="text"
          v-model="search"
          @input="filterOptions"
          @keydown.enter.prevent="addHighlighted"
          @keydown.arrow-down.prevent="highlightNext"
          @keydown.arrow-up.prevent="highlightPrev"
          :placeholder="modelValue ? '' : 'Select...'"
        >
      </div>
      <div class="options" v-if="showDropdown && filteredOptions.length">
        <div
          v-for="(option, index) in filteredOptions"
          :key="option"
          class="option"
          :class="{ highlighted: index === highlighted }"
          @mousedown.prevent="select(option)"
        >
          {{ option }}
        </div>
      </div>
    </div>
  `,
  props: {
    modelValue: { type: String, default: '' },
    options: { type: Array, default: () => [] }
  },
  data() {
    return {
      search: '',
      filteredOptions: [],
      highlighted: -1,
      showDropdown: false
    };
  },
  watch: {
    search() { this.filterOptions(); }
  },
  methods: {
    focusInput() {
      this.$el.querySelector('input').focus();
      this.showDropdown = true;
      this.filterOptions();
    },
    filterOptions() {
      this.filteredOptions = this.options
        .filter(o => o.toLowerCase().includes(this.search.toLowerCase()));
      this.highlighted = -1;
      if (this.search !== '' || this.filteredOptions.length) {
        this.showDropdown = true;
      }
    },
    select(option) {
      this.$emit('update:modelValue', option);
      this.search = '';
      this.showDropdown = false;
      this.filteredOptions = [];
    },
    clear() {
      this.$emit('update:modelValue', '');
      this.search = '';
      this.filterOptions();
    },
    addHighlighted() {
      if (this.filteredOptions.length && this.highlighted !== -1) {
        this.select(this.filteredOptions[this.highlighted]);
      }
    },
    highlightNext() {
      if (this.highlighted < this.filteredOptions.length - 1) this.highlighted++;
    },
    highlightPrev() {
      if (this.highlighted > 0) this.highlighted--;
    },
    handleClickOutside(event) {
      if (!this.$refs.wrapper.contains(event.target)) {
        this.showDropdown = false;
      }
    }
  },
  mounted() {
    this.filterOptions();
    document.addEventListener('mousedown', this.handleClickOutside);
  },
  beforeUnmount() {
    document.removeEventListener('mousedown', this.handleClickOutside);
  }
};