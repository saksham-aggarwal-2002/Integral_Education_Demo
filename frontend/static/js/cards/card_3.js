const CardThree = {
  // ...existing code...
    template: `
    <div class="card">
        <div class="card-body">
        <h5 class="card-title">Band Distributions</h5>
        <div style="display: flex; align-items: center; gap: 1rem;" class="mb-3">
            <label class="form-label mb-0">Select Exam Set:</label>
            <single-select v-model="selectedExam" :options="exams"></single-select>
        </div>
        <div class="row">
            <div class="col-12">
            <div ref="chartContainer" style="width: 100%; min-height: 400px; height: 400px;"></div>
            </div>
        </div>
        </div>
    </div>
    `,
// ...existing code...

  data() {
    return {
      exams: [],
      subjects: [],
      bands: [],
      pie_data: {},
      selectedExam: null,
      myChart: null
    };
  },

  watch: {
    selectedExam() {
      this.updateChart();
    }
  },

  async mounted() {
    await this.fetchData();
    this.myChart = echarts.init(this.$refs.chartContainer);
    this.updateChart();
    window.addEventListener('resize', () => this.myChart.resize());
  },

  methods: {
    async fetchData() {
      const res = await fetch('/dashboard2/card3/api');
      const data = await res.json();
      this.exams = data.exams;
      this.subjects = data.subjects;
      this.bands = data.bands;
      this.pie_data = data.pie_data;
      this.selectedExam = this.exams[0];
    },

    updateChart() {
      if (!this.myChart || !this.selectedExam) return;

      // Use absolute pixel positions for centers and titles
      const gridPositions = [
        { left: '25%', top: '25%' },
        { left: '75%', top: '25%' },
        { left: '25%', top: '75%' },
        { left: '75%', top: '75%' }
      ];

      const series = this.subjects.map((subj, idx) => ({
        name: subj,
        type: 'pie',
        radius: '30%',
        center: [gridPositions[idx].left, gridPositions[idx].top],
        label: { show: false }, // Hide category labels on pie
        data: this.pie_data[this.selectedExam][subj]
      }));

      const titles = this.subjects.map((subj, idx) => ({
        text: subj,
        left: gridPositions[idx].left,
        top: (parseInt(gridPositions[idx].top) + 20) + '%', // 20% below the center
        textAlign: 'center',
        textStyle: { fontSize: 15 }
      }));

      const option = {
        legend: {
          data: this.bands,
          top: 'top',
          left: 'center',
          orient: 'horizontal'
        },
        tooltip: {
          trigger: 'item',
          formatter: '{b}: {c} ({d}%)'
        },
        title: titles, // <-- Add this line
        series: series
      };

      this.myChart.setOption(option, true);
    }
  }
};