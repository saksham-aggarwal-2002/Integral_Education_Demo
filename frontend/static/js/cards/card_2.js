const CardTwo = {
  // ...existing code...
  template: `
    <div class="card">
      <div class="card-body">
        <h5 class="card-title">Performance over Time</h5>
        <div style="display: flex; align-items: center; gap: 1rem;" class="mb-3">
          <label class="form-label mb-0">Select Subject:</label>
          <single-select v-model="selectedSubject" :options="subjects"></single-select>
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
      subjects: [],
      selectedSubject: null,
      boxplot_series: [],
      median_series: {},
      dates: [],
      myChart: null
    };
  },

  watch: {
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
      const res = await fetch('/dashboard2/card2/api');
      const data = await res.json();
      this.subjects = data.subjects;
      this.dates = data.dates;
      this.boxplot_series = data.boxplot_series;
      this.median_series = data.median_series;
      this.selectedSubject = this.subjects[0];
    },

    updateChart() {
      if (!this.myChart || !this.selectedSubject) return;

      const boxplotData = this.boxplot_series.map(item => item.boxplots[this.selectedSubject]);
      const medians = this.median_series[this.selectedSubject];

      const option = {
        tooltip: {
          trigger: 'item',
          axisPointer: { type: 'shadow' },
          formatter: param => {
            if (param.seriesType === 'line') {
              return `<b>Date:</b> ${this.dates[param.dataIndex]}<br><b>Median:</b> ${param.data}`;
            }
            return [
              `<b>Date:</b> ${this.dates[param.dataIndex]}`,
              `<b>Min:</b> ${param.data[1]}`,
              `<b>Q1:</b> ${param.data[2]}`,
              `<b>Median:</b> ${param.data[3]}`,
              `<b>Q3:</b> ${param.data[4]}`,
              `<b>Max:</b> ${param.data[5]}`
            ].join('<br/>');
          }
        },
        legend: {
          data: ['Distribution', 'Median'],
          top: 'top',
          selectedMode: false
        },
        xAxis: {
          type: 'category',
          data: this.dates,
          name: 'Date'
        },
        yAxis: {
          type: 'value',
          name: 'Score',
          min: 0,
          max: 100
        },
        series: [
          {
            name: 'Distribution',
            type: 'boxplot',
            data: boxplotData
          },
          {
            name: 'Median',
            type: 'line',
            data: medians,
            symbol: 'circle',
            symbolSize: 8,
            lineStyle: { color: '#e74c3c', width: 2, type: 'dashed' },
            itemStyle: { color: '#e74c3c' },
            z: 20
          }
        ]
      };

      this.myChart.setOption(option, true);
    }
  }
};