import { smallScreen } from "./App";
var pageTheme = '#EAEEF250';
var tickSpacing = smallScreen ? 60 : 30;

var options = {
  name: 'emoteGraph',
  tooltips: {
    mode: 'index',
    intersect: false
  },
  hover: {
    mode: 'index',
    intersect: false
  },
  scales: {
    yAxes: {
      type: 'linear',
      min: 0,
      grid: {
        color: pageTheme,
        borderColor: '#eaeef2',
        drawTicks: false,
        tickColor: '#eaeef2',
      },
      ticks: {
        color: '#eaeef2',
        tickLength: 10,
      }
    },
    xAxes: {
      beginAtZero: true,
      title: {
        display: true,
        text: "Stream Timestamp",
        color: '#eaeef2',
        padding: 8,
      },
      grid: {
        color: pageTheme,
        borderColor: '#eaeef2',
        drawTicks: true,
        tickColor: '#eaeef2',
      },
      ticks: {
        color: '#eaeef2',
        autoSkip: false,
        minRotation: 15,
        maxRotation: 15,
        tickLength: 10,
        padding: 8,
        callback: function(value, index, values) {
          var prevMinute = 2
          const minute = this.getLabelForValue(value).split(':')[1];
          try {
            prevMinute = this.getLabelForValue(value-1).split(':')[1];
          } catch {}
          const labelAdj = this.getLabelForValue(value).slice(0, -2)+'00';
          if ((minute % tickSpacing === 0 && prevMinute % tickSpacing !== 0) || value === 0) {
            return labelAdj;
          }
        } 

      }
    }
  },
  responsive: true,
  maintainAspectRatio: false,
  stacked: true,
  plugins: {
    legend: {
      position: 'top',
      labels: {
        color: '#eaeef2',
      },
    },
    title: {
      display: true,
      text: "Emote Usage in moonmoon's Twitch chat",
      color: '#eaeef2',
    },
  },
};

export default options;