import React from 'react';
import {ReactTags} from 'react-tag-autocomplete'
import DatePicker from 'react-datepicker';
import {Line} from 'react-chartjs-2';
import ReactPlayer from 'react-player';
import Select from 'react-select';
import Collapse from '@material-ui/core/Collapse';
import "react-datepicker/dist/react-datepicker.css";
import "./tags.css";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  LogarithmicScale,
} from 'chart.js';
import { Button } from '@material-ui/core';


ChartJS.register(
  CategoryScale,
  LinearScale,
  LogarithmicScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// const BASE_URL = 'http://localhost:6969';  // Use for local testing
const BASE_URL = 'https://twitchlights.com:6969';  // Use for production


export const options = {
  scales: {
    yAxes: {
      type: 'linear',
      min: 0,
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
      beginAtZero: true,
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

const colorStyles = {
  control: (baseStyles, state) => ({
    ...baseStyles,
    width: 160,
    margin: 4,
    height: 40.2,
    padding: 0,
    borderColor: state.isFocused ? '#54538C' : '#eaeef2',
  }),
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
      openColors: [...Array(10).keys()],
      usedColors: [],
      username: '',
      played: 0,
      vod_life: 0,
      expanded: true,
      graphHeight: 85,
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
    fetch(BASE_URL+'/names',
    // fetch('https://twitchlights.com:6969/names',
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
        nlist.push({value:data.names[i], label: data.names[i]})
      }
      this.setState({
        validNames: data.names, 
        name_suggestions: nlist, 
        username: nlist[0].label, 
        vod_life: data.streams[0].vod_life
      }, () => this.fetchValidDates(nlist[0].label))
    });
  };

  fetchValidDates(n) {
    options.plugins.title.text = `Emote Usage in ${n}'s Twitch chat`;
    const validDates = [];
    const validIds = [];
    fetch(BASE_URL+'/dates', 
    {
      method: "POST",
      body: JSON.stringify({"username": '#'.concat(n)}),
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
        this.setState({validDates: validDates, liveStream: data.live, validIDs: validIds}, () => 
        { try {
          this.setDate(new Date(data.maxDate[0].stream_date+"T00:00:00"))
        } catch { this.setDate(new Date()) }
      });
    })
  }

  setEmotes(e) {
    if (e.length === 0) {
      e = [{value: 0, label: 'All Chat Messages'}];
    }

    this.setState({emotes: [].concat(this.state.emotes, e)}, () => this.fetchEmotes(e, this.state.date));
  };

  onDelete (i) {
    const tags = this.state.emotes.slice(0)
    const lines = this.state.chart.slice(0)
    tags.splice(i, 1)
    lines.splice(i, 1)
    var swapColor = this.state.usedColors[i];
    var updateColors = this.state.openColors;
    var oldColors = this.state.usedColors;
    updateColors.push(swapColor);
    updateColors.sort();
    oldColors.splice(oldColors.indexOf(swapColor), 1);
    if (tags.length === 0) {
      this.setState({
        chart: lines, 
        openColors: updateColors,
        usedColors: oldColors
      }, () => this.setEmotes(tags))
    }
    else {
      this.setState({
        chart: lines, 
        emotes: tags, 
        openColors: updateColors,
        usedColors: oldColors
      }, () => {
      })
    }
  }

  onAddition (tag) {
    if (this.state.emotes.length < 10) {
      this.setEmotes([tag])
    }
  }

  fetchEmotes(e, d) {
    if (typeof d.date != Date) {
      d = new Date(d.date);
    };

    fetch(BASE_URL+'/fetch', 
      {
        method: "POST",
        body: JSON.stringify({
          "emote": e, 
          "date": d.toISOString().split('T')[0], 
          "username": '#'.concat(this.state.username),
          "labels": this.state.xlabels,
          "openColors": this.state.openColors,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      }
    ).then((res) => res.json())
      .then((data) => {
        var openColors = this.state.openColors;
        var swapColor = openColors.slice(0, e.length);
        openColors = openColors.slice(e.length);
        var usedColors = this.state.usedColors;
        usedColors = usedColors.concat(swapColor).sort();
        this.setState({
          type: 'line',
          chart: [].concat(this.state.chart, data.datasets), 
          xlabels: data.labels,
          openColors: openColors,
          usedColors: usedColors
        }, () => null);
      });
  };

  setDate(d) {
    if (new Date() - d > this.state.vod_life * 24 * 60 * 60 * 1000) {
      document.getElementById('player').hidden = true;
      const disclaimer = document.createElement('p')
      disclaimer.setAttribute('id', 'disclaimer')
      const disctext = document.createTextNode('This vod is no longer available on twitch.tv. Vods are automatically deleted after 14 days (60 days for Twitch Partners)')
      disclaimer.appendChild(disctext)
      document.getElementById('embed-player').appendChild(disclaimer)
    } else { 
      
      try {
        document.getElementById('player').hidden = false; 
        document.getElementById('disclaimer').remove()} catch {}
    }
    document.getElementById('graph').style.height = '80vh';
    let vod;
    if (d) {
      this.state.validDates.findIndex((val, idx) => {if (val.toISOString() === d.toISOString()) {vod = this.state.validIDs[idx]} return null});
      this.setState({
        date: {date: d, id: vod},
        emotes: [],
        openColors: [...Array(10).keys()],
        usedColors: [],
        chart: [],
        xlabels: [],
        expanded: true,
        graphHeight: 85
      }, () => this.fetchTopEmotes(d));
    }
  };
  
  fetchTopEmotes(d) {
    fetch(BASE_URL+'/topEmotes',
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
    this.setState({expanded: false, graphHeight: 30})
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
          <div className='npicker'>
            <Select
              styles={colorStyles}
              options={this.state.name_suggestions}
              isClearable={false}
              isSearchable={true}
              defaultValue={{value: "moonmoon", label: "moonmoon"}}
              onChange={n => this.fetchValidDates(n.label)}
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
        <Collapse in={this.state.expanded} collapsedSize='30vh'>
          <div id='graph' style={{ position: "relative", margin: "auto", width: "80vw", height: `${this.state.graphHeight}vh`, paddingBottom: '0px'}}>
            <Line
              onClick={(event) => this.chartSeek(event)}
              options={options}
              data={{labels:this.state.xlabels, datasets:this.state.chart}}
            />
          </div>
        </Collapse>
        <div className='container'>
          <Button 
            id='vodToggle'
            style={{ position: "relative", margin:'auto', alignSelf:'center', width: "80vw", paddingBottom: '0px', background:'#eaeef2'}}
            onClick={
              () => {this.setState({expanded: !this.state.expanded, graphHeight: (+ !this.state.expanded * 55) + 30}); 
                    if (this.state.expanded) {
                      document.getElementById('vodToggle').innerText = 'Hide vod replay'
                    } else {document.getElementById('vodToggle').innerText = 'Show vod replay'}
                    }
            }>
            Show vod replay
          </Button>

        </div>
        <Collapse in={!this.state.expanded} unmountOnExit={true}>
          <div id='embed-player' style={{ position: "relative", margin: "auto", width: "80vw", paddingBottom: '0px'}}>
            <ReactPlayer
              id={'player'}
              ref={this.ref}
              url={`https://www.twitch.tv/videos/${this.state.date.id}`} 
              controls={true}
              width={'100%'} 
              height={'100vh'} 
              style={{paddingTop: '30px'}}>
            </ReactPlayer>
          </div>
        </Collapse>
      </div>


    );
  };

};

export default App;
