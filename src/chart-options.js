var pageTheme = '#EAEEF250';

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
        autoSkip: true,
        minRotation: 0,
        maxRotation: 0,
        min: 0,
        max: 12,
        stepSize: 1,
        maxTicksLimit: 13,
        tickLength: 10,
        padding: 8,
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