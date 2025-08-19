const MultiSelect = {
  template: `
    <div style="position:relative;" ref="wrapper">
      <div class="multi-select" @click="focusInput">
        <span v-for="item in modelValue" :key="item" class="tag">
          {{ item }}
          <button type="button" @click.stop="remove(item)">x</button>
        </span>
        <input type="text" v-model="search" @input="filterOptions" @keydown.enter.prevent="addHighlighted" @keydown.arrow-down.prevent="highlightNext" @keydown.arrow-up.prevent="highlightPrev">
      </div>
      <div class="options" v-if="showDropdown && filteredOptions.length">
        <div 
          v-for="(option, index) in filteredOptions" 
          :key="option" 
          class="option"
          :class="{ highlighted: index === highlighted }"
          @mousedown.prevent="select(option)">
          {{ option }}
        </div>
      </div>
    </div>
  `,
  props: {
    modelValue: { type: Array, default: () => [] },
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
      .filter(o => !this.modelValue.includes(o))
      .filter(o => o.toLowerCase().includes(this.search.toLowerCase()));
    this.highlighted = -1; // No highlight by default
    this.showDropdown = true; // Always show dropdown when filtering
  },
  
    select(option) {
      this.$emit('update:modelValue', [...this.modelValue, option]);
      this.search = '';
      this.showDropdown = false;
      this.filteredOptions = [];
    },
    remove(item) {
      this.$emit('update:modelValue', this.modelValue.filter(i => i !== item));
    },
    addHighlighted() {
      if (this.filteredOptions.length) {
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