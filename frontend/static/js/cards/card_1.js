const CardOne = {
template: `
  <div class="card">
    <div class="card-body">
      <h5 class="card-title">Exam Distributions</h5>

      <div class="row mb-3">
        <div class="col-md-6 mb-2">
          <label class="form-label">Select Exam Set:</label>
          <single-select v-model="selectedExam" :options="examSets"></single-select>
        </div>
        <div class="col-md-6 mb-2">
          <label class="form-label">Select Students:</label>
          <multi-select v-model="selectedStudents" :options="students"></multi-select>
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
      examSets: [],
      selectedExam: null,
      students: [],
      selectedStudents: [],
      myChart: null
    };
  },

  watch: {
    selectedStudents() {
      this.updateChart();
    },

    selectedExam() {
      this.selectedStudents = [];
      this.students = Object.keys(this.students_marks[this.selectedExam] || {});
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

      const res = await fetch('/dashboard2/card1/api');
      const data = await res.json();

      this.subjects = data.subjects;
      this.subject_distributions = data.subject_distributions;
      this.students_marks = data.students_marks;

      // Populate exam sets dynamically
      this.examSets = Object.keys(data.subject_distributions);

      // Default selection
      this.selectedExam = this.examSets[0];

      // Populate student list for selected exam
      this.students = Object.keys(this.students_marks[this.selectedExam] || {});

      
      //this.$nextTick(() => this.initChart());
    },




    updateChart() {
        if (!this.myChart) return;

        const examData = this.subject_distributions[this.selectedExam] || [];
        const subjects = this.subjects;

        // Scatter points for selected students
        const scatterSeries = this.selectedStudents.map(student => {
          const studentScores = this.students_marks[this.selectedExam][student] || [];
          return {
            name: student,
            type: 'scatter',
            data: studentScores,
            symbolSize: 12,
            z: 10, // <-- Ensures scatter dots are above boxplot
            animation: false,
            tooltip: { formatter: params => `${student}: ${params.value}` }
          };
        });

        const option = {
          tooltip: { trigger: 'item', axisPointer: { type: 'shadow' } },
          legend: {
            data: ['Distribution', ...this.selectedStudents],
            top: 'top',
            selectedMode: false
          },
          xAxis: { type: 'category', data: subjects },
          yAxis: { type: 'value', name: 'Score', min: 0, max: 100 },
          series: [
            {
              name: 'Distribution',
              type: 'boxplot',
              data: examData,
              tooltip: {
                formatter: param => [
                  param.name,
                  'Min: ' + param.data[1],
                  'Q1: ' + param.data[2],
                  'Median: ' + param.data[3],
                  'Q3: ' + param.data[4],
                  'Max: ' + param.data[5]
                ].join('<br/>')
              }
            },
            ...scatterSeries
          ]
        };

        // Merge option to update series without redrawing axes
        this.myChart.setOption(option, true);
      },

    initChart() {
      const chartDom = this.$refs.chartContainer;
      if (!chartDom) return;

      // Create and store chart instance
      this.myChart = echarts.init(chartDom);

      // Make chart responsive
      window.addEventListener('resize', () => this.myChart.resize());

      // Initial rendering of chart
      this.updateChart();
    }


      

  }
    
    
};
