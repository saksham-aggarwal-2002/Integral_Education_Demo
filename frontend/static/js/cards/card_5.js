const CardFive = {
  props: ['selectedStudent'],

  template: `
    <div class="card">
      <div class="card-body">
        <h5 class="card-title">Student Performance Over Time</h5>
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
      subjects: [],
      dates: [],
      scores: {},
      myChart: null
    };
  },

  watch: {
    selectedStudent() {
      this.fetchData();
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
      if (!this.selectedStudent) return;
      const res = await fetch(`/dashboard3/card5/api?student=${encodeURIComponent(this.selectedStudent)}`);
      const data = await res.json();
      this.subjects = data.subjects;
      this.dates = data.dates;
      this.scores = data.scores;
      this.updateChart();
    },

updateChart() {
  if (!this.myChart || !this.subjects.length || !this.dates.length) return;

  // Build one line series per subject (give each an id for stable updates)
  const series = this.subjects.map(subj => ({
    id: `series-${subj}`,
    name: subj,
    type: 'line',
    data: this.scores[subj] || [],
    smooth: true,
    symbol: 'circle',
    symbolSize: 8,
    lineStyle: { width: 2 },
    showSymbol: true,
    connectNulls: false
  }));

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' },
      formatter: (params) => {
        let html = `<strong>${params[0].axisValue}</strong><br/>`;
        params.forEach(p => { html += `${p.marker} ${p.seriesName}: ${p.data}<br/>`; });
        return html;
      }
    },
    legend: {
      data: this.subjects,
      top: 'top',
      selectedMode: 'multiple'
    },
    grid: { left: '5%', right: '5%', bottom: '10%', containLabel: true },
    xAxis: { type: 'category', data: this.dates, name: 'Date', boundaryGap: false },
    yAxis: { type: 'value', name: 'Score', min: 0, max: 100 },
    series
  };

  this.myChart.setOption(option, true);

  // Ensure we don't stack multiple listeners if updateChart runs again
  this.myChart.off('legendselectchanged');

  // Hard toggle: strip data from deselected series so no dots can appear
  this.myChart.on('legendselectchanged', (e) => {
    const updatedSeries = this.subjects.map(subj => {
      const on = e.selected[subj] !== false;
      return {
        id: `series-${subj}`,
        // keep type/name so ECharts matches the series by id
        type: 'line',
        name: subj,
        data: on ? (this.scores[subj] || []) : [], // ← empty when hidden
        showSymbol: on,
        lineStyle: { width: on ? 2 : 0 },
        itemStyle: { opacity: on ? 1 : 0 },
        areaStyle: on ? undefined : { opacity: 0 }
      };
    });
    this.myChart.setOption({ series: updatedSeries }, false);
  });
}


  }
};