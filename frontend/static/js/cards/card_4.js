const CardFour = {
  template: `
    <div class="card">
      <div class="card-body">
        <h5 class="card-title">Question Accuracy</h5>
        <div class="row mb-3">
          <div class="col-md-6 mb-2">
            <label class="form-label mb-0">Select Exam Set:</label>
            <single-select v-model="selectedExam" :options="exams"></single-select>
          </div>
          <div class="col-md-6 mb-2">
            <label class="form-label mb-0">Select Subject:</label>
            <single-select v-model="selectedSubject" :options="subjects"></single-select>
          </div>
        </div>
        <div class="row">
          <div class="col-12">
            <div ref="chartContainer" style="width: 100%; min-height: 400px; height: 400px;"></div>
          </div>
        </div>
      </div>
    </div>
  `,

  data() {
    return {
      exams: [],
      subjects: [],
      questions: [],
      bar_data: {},
      selectedExam: null,
      selectedSubject: null,
      myChart: null
    };
  },

  watch: {
    selectedExam() {
      this.selectedSubject = this.subjects[0];
      this.updateChart();
    },
    selectedSubject() {
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
      const res = await fetch('/dashboard2/card4/api');
      const data = await res.json();
      this.exams = data.exams;
      this.subjects = data.subjects;
      this.questions = data.questions;
      this.bar_data = data.bar_data;
      this.selectedExam = this.exams[0];
      this.selectedSubject = this.subjects[0];
    },

    updateChart() {
      if (!this.myChart || !this.selectedExam || !this.selectedSubject) return;

      const data = this.bar_data[this.selectedExam][this.selectedSubject];
      const xData = data.map(item => item.question);
      const yData = data.map(item => item.percent_correct);

      const option = {
        xAxis: {
          type: 'category',
          data: xData,
          name: 'Question'
        },
        yAxis: {
          type: 'value',
          name: 'Percent Correct',
          min: 0,
          max: 100
        },
        series: [
          {
            name: 'Percent Correct',
            type: 'bar',
            data: yData,
            itemStyle: { color: '#4e73df' }
          }
        ]
      };

      this.myChart.setOption(option, true);
    }
  }
};