import React from "react";
import {ReactTags} from 'react-tag-autocomplete'
import DatePicker from 'react-datepicker';
import {Line} from 'react-chartjs-2';
import "react-datepicker/dist/react-datepicker.css";
import "./tags.css"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';


ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export const options = {
  scales: {
    yAxes: {
      grid: {
        color: '#54538C',
        borderColor: '#eaeef2',
        drawTicks: false,
        tickColor: '#eaeef2',
      },
      ticks: {
        color: '#eaeef2',
      }
    },
    xAxes: {
      label: {
        display: true,
        text: "Stream Timestamp",
        color: '#eaeef2',
      },
      grid: {
        color: '#54538C',
        borderColor: '#eaeef2',
        drawTicks: false,
        tickColor: '#eaeef2',
      },
      ticks: {
        color: '#eaeef2',
        autoSkip: true,
        minRotation: 15,
        maxRotation: 15,
      }
    }
  },
  responsive: true,
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
      text: "Emote Usage in MOONMOON's Twitch chat",
      color: '#eaeef2',
    },
  },
};

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      emotes: [],
      suggestions: [],
      date: null,
      validDates: [],
      chart: [],
      xlabels: []
    };
    this.setEmotes = this.setEmotes.bind(this);
    this.setDate = this.setDate.bind(this);
    this.fetchValidDates = this.fetchValidDates.bind(this);
    this.fetchEmotes = this.fetchEmotes.bind(this);
    this.fetchTopEmotes = this.fetchTopEmotes.bind(this);
    this.reactTags = React.createRef();
    this.fetchValidDates();
  };

  fetchValidDates() {
    const validDates = [];
    fetch('https://164.90.246.172:6969/dates')
      .then((res) => res.json())
      .then((data) => {
        if (validDates.length === 0) {
          for (let i = 0; i < data.dates.length; i++) {
            validDates.push(new Date(data.dates[i].stream_date+"T00:00:00"));
          };
        };
        this.setState({validDates: validDates}, () => this.setDate(new Date(data.maxDate[0].stream_date+"T00:00:00")));
      })
  }

  setEmotes(e) {
    if (e.length === 0) {
      e = [{value: 0, label: 'All Chat Messages'}];
    }
    this.setState({emotes: e}, () => this.fetchEmotes(this.state.emotes, this.state.date));
  };

  onDelete (i) {
    const tags = this.state.emotes.slice(0)
    tags.splice(i, 1)
    this.setEmotes(tags)
  }

  onAddition (tag) {
    const tags = [].concat(this.state.emotes, tag)
    this.setEmotes(tags)
  }

  fetchEmotes(e, d) {
    if (typeof d != Date) {
      d = new Date(d);
    };
    fetch('https://164.90.246.172:6969/fetch', 
      {
        method: "POST",
        body: JSON.stringify({"emote": e, "date": d.toISOString().split('T')[0]}),
        headers: {
          'Content-Type': 'application/json',
        },
      }
    ).then((res) => res.json())
      .then((data) => {
        this.setState({type: 'line', chart: data.datasets, xlabels: data.labels}, () => null);
      });
  };

  setDate(d) {
    if (d) {
      this.setState({date: d}, () => this.fetchTopEmotes(d));
    }
  };
  
  fetchTopEmotes(d) {
    fetch('https://164.90.246.172:6969/topEmotes',
      {
        method: "POST",
        body: JSON.stringify({date: (d.toISOString().split('T')[0])}),
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )
      .then((res) => res.json())
      .then((data) => {
        const elist = [];
        for (let i = 0; i < data.topEmotes.length; i++) {
          elist.push({value:i, label: data.topEmotes[i]})
        }
        this.setState({suggestions: elist}, () => this.setEmotes(elist.slice(0, 5)));

      })
  }

  render = () => {
    return (
      <div>
        <div className="container">
          <div className="dpicker">
            <DatePicker
              selected={this.state.date}
              onChange={d => this.setDate(d)}
              includeDates={this.state.validDates}
            />
          </div>
          <div className="epicker">
            <ReactTags
              allowNew={true}
              selected={this.state.emotes}
              suggestions={this.state.suggestions}
              onDelete={this.onDelete.bind(this)}
              onAdd={this.onAddition.bind(this)}
              newOptionText={'%value%'}
              placeholderText={'Search for anything!'}
              delimiterKeys = {['Enter', 'Tab']}
            />
          </div>
        </div>
        <div style={{ position: "relative", margin: "auto", width: "80vw" }}>
          <Line
            options={options}
            data={{labels:this.state.xlabels, datasets:this.state.chart}}
          />
        </div>
      </div>


    );
  };

};

export default App;
