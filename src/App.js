import React from 'react';
import {ReactTags} from 'react-tag-autocomplete'
import DatePicker from 'react-datepicker';
import {Line} from 'react-chartjs-2';
import ReactPlayer from 'react-player'
import Select from 'react-select'
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
        tickLength: 10,
      }
    },
    xAxes: {
      title: {
        display: true,
        text: "Stream Timestamp",
        color: '#eaeef2',
        padding: 8,
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
        tickLength: 10,
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
      name_suggestions: [],
      date: {date: null, id: null},
      validNames: [],
      validDates: [],
      validIDs: [],
      chart: [],
      xlabels: [],
      liveStream: false,
      username: '',
      played: 0,
    };
    this.setEmotes = this.setEmotes.bind(this);
    this.setDate = this.setDate.bind(this);
    this.fetchValidDates = this.fetchValidDates.bind(this);
    this.fetchEmotes = this.fetchEmotes.bind(this);
    this.fetchTopEmotes = this.fetchTopEmotes.bind(this);
    this.chartSeek = this.chartSeek.bind(this);
    this.reactTags = React.createRef();
    this.playerRef = React.createRef();
    this.fetchValidNames();

  };

  fetchValidNames() {
    fetch('https://twitchlights.com:6969/names',
    {
      method: "GET",
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then((res) => res.json())
    .then((data) => {
      const nlist = [];
      for (let i = 0; i < data.names.length; i++) {
        nlist.push({value:data.names[i], label: data.names[i].slice(1)})
      }
      
      this.setState({validNames: data.names, name_suggestions: nlist, username: nlist[0].label}, () => this.fetchValidDates())
    });
  };

  fetchValidDates() {
    const validDates = [];
    const validIds = [];
    // fetch('http://localhost:6969/dates', 
    fetch('https://twitchlights.com:6969/dates', 
    {
      method: "POST",
      body: JSON.stringify({"username": '#'.concat(this.state.username)}),
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (validDates.length === 0) {
          for (let i = 0; i < data.dates.length; i++) {
            validDates.push(new Date(data.dates[i].stream_date+"T00:00:00"));
            validIds.push(data.dates[i].vid_no)
          };
        };
        // console.log(data);
        // console.log(validDates);
        this.setState({validDates: validDates, liveStream: data.live, validIDs: validIds}, () => this.setDate(new Date(data.maxDate[0].stream_date+"T00:00:00")));
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
    if (typeof d.date != Date) {
      d = new Date(d.date);
    };
    // fetch('http://localhost:6969/fetch', 
    fetch('https://twitchlights.com:6969/fetch', 
      {
        method: "POST",
        body: JSON.stringify({"emote": e, "date": d.toISOString().split('T')[0], "username": '#'.concat(this.state.username)}),
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
    let vod;
    // console.log(d);
    if (d) {
      this.state.validDates.findIndex((val, idx) => {if (val.toISOString() === d.toISOString()) {vod = this.state.validIDs[idx]} return null});
      this.setState({date: {date: d, id: vod}}, () => this.fetchTopEmotes(d));
    }
  };
  
  fetchTopEmotes(d) {
    // fetch('http://localhost:6969/topEmotes',
    fetch('https://twitchlights.com:6969/topEmotes',
      {
        method: "POST",
        body: JSON.stringify({date: (d.toISOString().split('T')[0]), "username": '#'.concat(this.state.username)}),
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
  };


  ref = player => {
    this.player = player
  }
  chartSeek(event) {
    // console.log(event.nativeEvent.layerX / event.target.width);
    // console.log(event);
    const offsetFrac = (event.target.width - event.nativeEvent.layerX) / event.target.width;
    const layerX_true = event.nativeEvent.layerX - event.target.width * (0.033203125 * offsetFrac);
    this.player.seekTo(parseFloat(layerX_true / event.target.width), "fraction");
    // this.setState({played: (event.x / event.chart.width)});
  }
  
  render = () => {
    return (
      <div>
        <div className="container">
          <div className='dpicker'>
            <Select
              options={this.state.name_suggestions}
              isClearable={false}
              isSearchable={true}
              defaultValue={this.state.name_suggestions[0]}
            />
          </div>
          <div className="dpicker">
            <DatePicker
              selected={this.state.date.date}
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
        <div style={{ position: "relative", margin: "auto", width: "80vw"}}>
          <Line
            onClick={(event) => this.chartSeek(event)}
            options={options}
            data={{labels:this.state.xlabels, datasets:this.state.chart}}
          />
          <ReactPlayer 
            ref={this.ref}
            url={`https://www.twitch.tv/videos/${this.state.date.id}`} 
            controls={true}
            width={'100%'} 
            height={'100vh'} 
            style={{paddingTop: '30px'}}>
          </ReactPlayer>
          <div>
          </div>
        </div>
      </div>


    );
  };

};

export default App;
