const CardSeven = {
  props: ['selectedStudent'],

  template: `
    <div class="card">
      <div class="card-body text-center">
        <h5 class="card-title">Probability of Selection</h5>
        <div id="echarts-full-gauge" style="width: 160px; height: 160px; margin: auto;"></div>
      </div>
    </div>
  `,

  data() {
    return {
      overallAverage: '-',
      gauge: null
    };
  },

  watch: {
    selectedStudent() {
      this.fetchData();
    }
  },

  async mounted() {
    await this.fetchData();
  },

  methods: {
    async fetchData() {
      if (!this.selectedStudent) return;
      const res = await fetch(`/dashboard3/card7/api?student=${encodeURIComponent(this.selectedStudent)}`);
      const data = await res.json();
      this.overallAverage = data.overallAverage;
      this.$nextTick(() => this.drawGauge());
    },

    drawGauge() {
      const dom = document.getElementById('echarts-full-gauge');
      if (!dom) return;
      if (!this.gauge) {
        this.gauge = echarts.init(dom);
      }
      const option = {
        series: [{
          type: 'gauge',
          startAngle: 90,
          endAngle: -270,
          min: 0,
          max: 1,
          radius: '100%',
          center: ['50%', '50%'],
          pointer: { show: false },
          progress: {
            show: true,
            width: 22,
            itemStyle: { color: '#ff9800' } // orange color
          },
          axisLine: {
            lineStyle: { width: 22, color: [[1, '#eee']] }
          },
          axisTick: { show: false },
          splitLine: { show: false },
          axisLabel: { show: false },
          detail: {
            valueAnimation: false,
            fontSize: 22,
            color: '#333',
            offsetCenter: [0, '0%'],
            formatter: '{value}'
          },
          data: [{ value: this.overallAverage }]
        }]
      };
      this.gauge.setOption(option);
    }
  }
};