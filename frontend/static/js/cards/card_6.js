const CardSix = {
  props: ['selectedStudent'],

  template: `
  <div class="card">
    <div class="card-body">
      <h5 class="card-title">Student Subject Health</h5>
      <div class="row text-center">
        <div v-for="subj in subjects" :key="subj" class="col-md-3 mb-2" style="padding-top: 0;">
          <div class="subject-label mb-0" style="margin-bottom: 2px;">{{ subj }}</div>
          <div :id="'echarts-gauge-' + subj" style="width: 140px; height: 110px; margin: auto;"></div>
        </div>
      </div>
    </div>
  </div>
  `,

  data() {
    return {
      subjects: [],
      summary: {},
      gauges: {}
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
      const res = await fetch(`/dashboard3/card6/api?student=${encodeURIComponent(this.selectedStudent)}`);
      const data = await res.json();
      this.subjects = data.subjects;
      this.summary = data.summary;
      this.$nextTick(() => this.drawAllGauges());
    },

    drawAllGauges() {
      this.subjects.forEach(subj => {
        this.drawGauge(subj, this.summary[subj]);
      });
    },

    drawGauge(subj, value) {
      const domId = 'echarts-gauge-' + subj;
      let chart = this.gauges[subj];
      const dom = document.getElementById(domId);
      if (!dom) return;
      if (!chart) {
        chart = echarts.init(dom);
        this.gauges[subj] = chart;
      }
      const option = {
        series: [{
          type: 'gauge',
          startAngle: 180,
          endAngle: 0,
          min: 0,
          max: 1,
          radius: '100%',
          center: ['50%', '90%'],
          pointer: { show: false },
          progress: {
            show: true,
            width: 22,
            itemStyle: { color: '#4e73df' }
          },
          axisLine: {
            lineStyle: { width: 22, color: [[1, '#eee']] }
          },
          axisTick: { show: false },
          splitLine: { show: false },
          axisLabel: { show: false },
          detail: {
            valueAnimation: false,
            fontSize: 18, // Smaller text
            color: '#333',
            offsetCenter: [0, '-20%'],
            formatter: '{value}'
          },
          data: [{ value }]
        }]
      };
      chart.setOption(option);
    }
  }
};