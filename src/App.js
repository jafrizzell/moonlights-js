import React from 'react';
import {ReactTags} from 'react-tag-autocomplete'
import DatePicker from 'react-datepicker';
import {getElementAtEvent, Line} from 'react-chartjs-2';
import ReactPlayer from 'react-player';
import Select from 'react-select';
import Collapse from '@material-ui/core/Collapse';
import "react-datepicker/dist/react-datepicker.css";
import "./tags.scss";
import options from "./chart-options.js"
import colorStyles from "./react-select-styles.js"

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

ChartJS.register(
  CategoryScale,
  LinearScale,
  LogarithmicScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);
const TESTING = false;

const BASE_URL = TESTING ? 'http://localhost:6969' : 'https://twitchlights.com:6969'

export var pageTheme = '#54538C';
export var hoverText = '#EAEEF2';
export var smallScreen = false;

function WelcomePopup(props) {
  return (
    <div id='welcomePopup' className='welcomePopup' style={{'visibility': props.visibible}}>
      <div>
        <h1>Welcome to Twitchlights!</h1>
        <h2>Here are a few tips to help you get the most out of this dashboard</h2>
        <nav>
          <ol>
            <li  style={{'fontWeight': 'bold'}}>Select top used emotes, or search for anything you are interested in!
              <ul>
                <br></br>
                <li>Want to find when a song was played? Try searching the name of the song - it might show up on the graph!</li>
                <br></br>
                <li>Dev tip #1: Search for .* to see all chat messages</li>
                {/* <li>Dev tip #2: Use the form X|Y to search for messages with X or Y</li> */}
              </ul>
              </li>
            <br></br>
            <li style={{'fontWeight': 'bold'}}>Skip to the best parts of the VOD!
              <ul>
                <br></br>
                <li>Click on a point on the graph to skip to that time in the VOD</li>
                <li>Click on a "Highlight" to skip to that time in the VOD</li>
              </ul>
            </li>
            <br></br>
            <li style={{'fontWeight': 'bold'}} href='https://www.youtube.com/channel/UCQdHh7MAW93EAqRoupxc3eg'>Check out the&nbsp;
              <a 
              href='https://www.youtube.com/channel/UCQdHh7MAW93EAqRoupxc3eg'
              target="_blank" 
              rel="noopener noreferrer"
              >Twitchlights</a>
              &nbsp;YouTube Channel!
            </li>
          </ol>
        </nav>
        <button 
          onClick={() => document.getElementById('welcomePopup').style.visibility = 'hidden'}>
            Let's Go!
        </button>
        <hr style={{'paddingRight': '2px', 'border': '1px solid #12121290', 'animation': 'rainbow-border 5s linear infinite'}}></hr>
        <h4>
          Made by Me actually | Discord:&nbsp;
          <a href='https://www.discord.com/users/151913358889713667'
            target="_blank" 
            rel="noopener noreferrer">Me actually#8806
          </a>
        </h4>
      </div>
    </div>
  )  
}

function Popup(props) {
  const isFirstVisit = props.firstVisit;
  if (isFirstVisit ==='false') {
    return <WelcomePopup visibible={'hidden'}/>;
  }
  if (isFirstVisit) {
    localStorage.setItem('firstVisit', 'false')
    return <WelcomePopup visibible={'visible'}/>;
  }
}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      firstVisit: localStorage.getItem('firstVisit') || true,
      emotes: [],
      suggestions: [],
      name_suggestions: [],
      date: {date: null, id: null},
      // date: {date: localStorage.date, id: localStorage.id},
      validNames: [],
      validDates: [],
      validIDs: [],
      chart: [],
      xlabels: [],
      liveStream: false,
      openColors: [...Array(10).keys()],
      usedColors: [],
      username: localStorage.getItem('username')||'moonmoon',
      played: 0,
      vod_life: 0,
      expanded: true,
      collapsedSize:'30vh',
      spacing: 0,
    };
    this.setEmotes = this.setEmotes.bind(this);
    this.setDate = this.setDate.bind(this);
    this.fetchValidDates = this.fetchValidDates.bind(this);
    this.fetchEmotes = this.fetchEmotes.bind(this);
    this.fetchTopEmotes = this.fetchTopEmotes.bind(this);
    this.chartSeek = this.chartSeek.bind(this);
    this.highlightSeek = this.highlightSeek.bind(this);
    this.drawLine = this.drawLine.bind(this);
    this.killLine = this.killLine.bind(this);
    this.reactTags = React.createRef();
    this.playerRef = React.createRef();
    this.chartRef = React.createRef();
    this.updateDimensions = this.updateDimensions.bind(this);
    const theme = document.documentElement;

    if (window.innerWidth < 992) {
      this.state.collapsedSize = '80vh';
      theme.style.setProperty('--flex-direction', 'column');
      theme.style.setProperty('--menu-margin', '6%');
      theme.style.setProperty('--emote-buffer', '0px')
    } else { 
      this.state.collapsedSize = '30vh';
      theme.style.setProperty('--flex-direction', 'row'); 
      theme.style.setProperty('--menu-margin', '12px'); 
      theme.style.setProperty('--emote-buffer', '12px')
    }
    window.addEventListener('resize', this.updateDimensions);
    if (window.innerWidth < 500) {
      smallScreen = true;
      this.state.spacing = 40;
    }
    else if (window.innerWidth < 800) {
      this.state.spacing = 120;
    }
    else {this.state.spacing = 240}
    this.fetchValidNames();
  };

  // componentDidMount() {
  //  First-time visitor popup
  // }

  updateDimensions = () => {
    let s;
    const theme = document.documentElement;
    if (window.innerWidth < 500) {
      theme.style.setProperty('--flex-direction', 'column');
      theme.style.setProperty('--menu-margin', '6%'); 
      theme.style.setProperty('--emote-buffer', '0px')
      s = 40;
    }
    else if (window.innerWidth < 992) {
      theme.style.setProperty('--flex-direction', 'column');
      theme.style.setProperty('--menu-margin', '6%'); 
      theme.style.setProperty('--emote-buffer', '0px')
      s = 120;
    }
    else {
      s = 240; 
      theme.style.setProperty('--flex-direction', 'row');
      theme.style.setProperty('--menu-margin', '12px'); 
      theme.style.setProperty('--emote-buffer', '12px')
    }
    const d = this.state.date
    if (s !== this.state.spacing) {
      this.setState({
        spacing: s, 
        chart: [],
        openColors: [...Array(10).keys()],
        usedColors: [],
      }, () => {
        this.fetchEmotes(this.state.emotes, d)
      });
    }
  };

  fetchValidNames() {
    fetch(BASE_URL+'/names',
    {
      method: "GET",
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then((res) => res.json())
    .then((data) => {
      let nlist = [];
      for (let n = 0; n < data.names.length; n++) {
        nlist.push({value: data.names[n], label: data.names[n]})

      }
      const savedState = data.names.indexOf(this.state.username);
      
      this.setState({
        validNames: data.names, 
        name_suggestions: nlist, 
        username: nlist[savedState].label, 
        vod_life: data.streams[savedState].vod_life,
      }, () => {this.fetchValidDates(this.state.username)})
    });
  };

  fetchValidDates(n) {
    localStorage.setItem('username', n)
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
        for (let i = 0; i < data.dates.length; i++) {
          validDates.push(new Date(data.dates[i].stream_date+"T00:00:00"));
          validIds.push(data.dates[i].vid_no)
        };
        const theme = document.documentElement;
        theme.style.setProperty('--accent-color', data.accentColor);
        theme.style.setProperty('--text-color', data.textColor);
        pageTheme = data.accentColor;
        hoverText = data.textColor;
        this.setState({
          validDates: validDates, 
          validIDs: validIds, 
          username: n,
          liveStream: data.live
        }, () => {  
          if (this.state.date.date !== undefined && validDates.includes(this.state.date.date)) {
            this.setDate(new Date(this.state.date.date))
          } else {
            try {
              this.setDate(new Date(data.maxDate[0].stream_date+"T00:00:00"))
          } catch { this.setDate(new Date())}
          }
      });
    })
  }

  setEmotes(e) {
    if (e.length === 0) {
      e = [{value: 101, label: 'All Chat Messages'}];
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
        emotes: [],
        openColors: updateColors,
        usedColors: oldColors
      }, () => this.setEmotes([]))
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
          "spacing": this.state.spacing
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
      document.getElementById('vodToggle').disabled = true;
      document.getElementById('vodToggle').innerText = 'This vod is no longer available on twitch.tv. Vods are automatically deleted after 14 days (60 days for Twitch Partners)'
      
    } else {
      document.getElementById('graph').style.height = '80vh';
      document.getElementById('vodToggle').disabled = false;
      document.getElementById('vodToggle').innerText = 'Show vod replay'
    }
    let vod;
    if (d) {
      this.state.validDates.findIndex((val, idx) => {if (val.toISOString() === d.toISOString()) {vod = this.state.validIDs[idx]} return null});
      // localStorage.setItem('date', d.toISOString().split('T')[0]+"T00:00:00");
      // localStorage.setItem('id', vod);
      this.setState({
        date: {date: d, id: vod},
        emotes: [],
        openColors: [...Array(10).keys()],
        usedColors: [],
        chart: [],
        xlabels: [],
        expanded: true,
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
        document.getElementById('total-msg').innerText = `Total Chat Messages: ${data.numMsg}`
        document.getElementById('unique-chatters').innerText = `Unique Chatters: ${data.numChatters}`
        
        // Add calculated highlights to ul list of highlights
        var ul = document.getElementById('highlights-section');
        while (ul.firstChild) {
          ul.removeChild(ul.firstChild);
        };

        let li;
        if (data.highlights.length === 0) {
          li = document.createElement('li');
          li.className = 'highlight-item--invalid'
          // li.style.disabled = true;
          if (this.state.liveStream) {
            li.appendChild(document.createTextNode('Highlights will be available after the stream'))
          } else {
            li.appendChild(document.createTextNode(`No highlights available 😞 Try again later?`))
          }
          ul.appendChild(li)
        }
        else {
          for (let k = 0; k < data.highlights.length; k++) {
            li = document.createElement('li');
            li.addEventListener('click', this.highlightSeek, false)
            li.addEventListener('mouseover', this.drawLine)
            li.className = 'highlight-item'
            li.id = `li-${k}`
            var k_time = data.highlights[k].timestamp
            var outer_div = document.createElement('div')
            outer_div.id = `div-${k}`
            outer_div.className = 'highlight-item-inner'
            // li.appendChild(outer_div.appendChild(document.createTextNode(`${k_time.split('T')[1].split('.')[0]} - ${data.highlights[k].trigger}`)))
            // li.appendChild(outer_div)
            li.appendChild(document.createTextNode(`${k_time.split('T')[1].split('.')[0]} - ${data.highlights[k].trigger}`))
            ul.appendChild(li)
          }
        }
        const elist = [];
        for (let i = 0; i < data.topEmotes.length; i++) {
          elist.push({value:i, label: data.topEmotes[i]})
        }
        this.setState({suggestions: elist, liveStream: data.live, }, () => this.setEmotes(elist.slice(0, 5)));

      })
  };

  drawLine(loc) {
    for (let c = 0; c < this.state.chart.length; c++) {
      if (this.state.chart[c].label === 'Highlight') {
        this.killLine(c);
      }
    }
    let yMax;
    const xLoc = loc.target.firstChild.data.split(' - ')[0];
    if (TESTING) {
      yMax = ChartJS.instances['1'].scales.yAxes.end;
    } else {
      yMax = ChartJS.instances['0'].scales.yAxes.end;
    }
    // const oldState = this.state.chart;
    const newLine = [{
      label: 'Highlight', 
      type: 'line', 
      backgroundColor: '#eaeef2', 
      borderColor: '#eaeef2',
      data: [{x: xLoc, y: '0'}, {x: xLoc, y: yMax}]
    }];
    // var fadeState = [].concat(this.state.chart, newLine)
    // fadeState.slice(-1).backgroundColor = '#cccccc';
    // fadeState.slice(-1).borderColor = '#cccccc';
    var xlabels = this.state.xlabels;
    // if (!xlabels.includes(xLoc)) {
    xlabels.push(xLoc);
    for (let i = xlabels.length - 1; i > 0 && xlabels[i] <= xlabels[i-1]; i--) {
        var tmp = xlabels[i];
        xlabels[i] = xlabels[i-1];
        xlabels[i-1] = tmp;
    }
    // }
    this.setState({
      chart: [].concat(this.state.chart, newLine),
      xlabels: xlabels
    }, () => { 
    //   setTimeout(() => { 
    //   this.setState({chart: oldState})
    // }, 3000)
    }
    )
    
  }

  killLine(loc) {
    if (typeof loc !== 'number') {
      loc = -1;
    }
    const xOut = this.state.chart.slice(loc)[0].data[0].x;
    var afterXLabel = this.state.xlabels;
    var afterChart = this.state.chart;
    afterChart.splice(loc, 1);
    afterXLabel.splice(afterXLabel.indexOf(xOut), 1);
    this.setState({chart: afterChart, xlabels: afterXLabel.sort() }, () => {})
  }

  ref = player => {
    this.player = player
  }

  highlightSeek(event) {
    if (this.state.expanded) {
      this.setState({expanded: false});
    }
    document.getElementById('vodToggle').innerText = 'Hide vod replay'
    if (window.innerWidth > 992) {
      document.getElementById('graph').style.height = '30vh';
    }
    const clickedTime = event.target.innerText.split(' ')[0].split(':');
    const adjTime = (+clickedTime[0]) * 60 * 60 + (+clickedTime[1]) * 60 + (+clickedTime[2])
    try {
      this.player.onReady(() => {
        this.player.seekTo(adjTime, "seconds");
      })
    } catch { this.player.seekTo(adjTime, "seconds"); }
  }


  chartSeek(event) {
    const idx = getElementAtEvent(this.chartRef.current, event)    
    if (idx.length > 0) {
      if (new Date() - this.state.date.date > this.state.vod_life * 24 * 60 * 60 * 1000) {
        return;
      }
      document.getElementById('vodToggle').innerText = 'Hide vod replay'
      if (window.innerWidth > 992) {
        document.getElementById('graph').style.height = '30vh';
      }
      this.setState({expanded: false})
      
      const clickedTime = idx[0].element.$context.raw.x.split(':');
      const adjTime = (+clickedTime[0]) * 60 * 60 + (+clickedTime[1]) * 60 + (+clickedTime[2])
      try {
        this.player.onReady(() => {
          this.player.seekTo(adjTime, "seconds");
        })
      } catch { this.player.seekTo(adjTime, "seconds"); }
    } else {
      return;
    }
  }

  render = () => {
    return (
      <div className='page'>
        <Popup firstVisit={this.state.firstVisit}/>
        <div id='menu-bar' className='menu-bar'>
          <img src='icon_3color_2.png' alt='Twitchlights logo' className='menu-bar-icon'></img>
          <div id='menu-bar-items' className='menu-bar-items'>
            <div className='menu-bar-item-bg'>
              <img 
                src='help_icon.png' 
                id='menu-bar-help-1' 
                className='menu-bar-help' 
                alt='help button' 
                onMouseOver={() => document.getElementById('menu-bar-help-1').setAttribute('src', 'help_icon_inv.png')}
                onMouseLeave={() => document.getElementById('menu-bar-help-1').setAttribute('src', 'help_icon.png')}
                onClick={() => document.getElementById('welcomePopup').style.visibility = 'visible'}
              ></img>
            </div>
            {/* <div className='menu-bar-item-bg'>
              <img 
                src='help_icon.png' 
                id='menu-bar-help-2' 
                className='menu-bar-help' 
                alt='help button' 
                onMouseOver={() => document.getElementById('menu-bar-help-2').setAttribute('src', 'help_icon_inv.png')}
                onMouseLeave={() => document.getElementById('menu-bar-help-2').setAttribute('src', 'help_icon.png')}
                onClick={() => document.getElementById('welcomePopup').style.visibility = 'visible'}
              ></img>
            </div> */}
          
          </div>
        </div>
        <div id='pickers-chart-vod' style={{'display': 'flex', 'flexDirection': 'row' , 'minWidth': '75%'}}>
          <div style={{'width':'100%'}}>
            <div id='input-pickers' className="container">
                {/* <div className='helpDiv'>
                  <button className='helpButton' onClick={() => this.setState({firstVisit: true})}></button>
                </div> */}
              <div id='name-date-picker' style={{'display': 'flex', 'flexDirection': 'row', 'justifyContent': 'space-between', 'marginBottom':'6px'}}>
                <div className='npicker'>
                  <Select
                    styles={colorStyles}
                    options={this.state.name_suggestions}
                    isClearable={false}
                    isSearchable={true}
                    // defaultValue={{value: 'moonmoon', label: 'moonmoon'}}
                    onChange={n => this.fetchValidDates(n.label)}
                    placeholder={this.state.username}
                  />
                </div>
                <div className="dpicker" style={{'zIndex': 100}}>
                  <DatePicker
                    selected={this.state.date.date}
                    onChange={d => this.setDate(d)}
                    includeDates={this.state.validDates}
                  />
                </div>
              </div>
              <div className="epicker" id='emotePicker'>
                <ReactTags
                  allowNew={true}
                  selected={this.state.emotes}
                  suggestions={this.state.suggestions}
                  onDelete={this.onDelete.bind(this)}
                  onAdd={this.onAddition.bind(this)}
                  newOptionText={'Search for: %value%'}
                  placeholderText={'Search for anything!'}
                  delimiterKeys = {['Enter', 'Tab']}
                />
              </div>
            </div>
            <Collapse id='collapser' in={this.state.expanded} collapsedSize={this.state.collapsedSize} timeout={{'enter': '500ms', 'exit': '500ms'}}>
              <div id='graph' className='chart'>
                <Line
                  ref={this.chartRef}
                  onClick={(event) => this.chartSeek(event)}
                  options={options}
                  data={{labels:this.state.xlabels, datasets:this.state.chart}}
                />
              </div>
            </Collapse>
            <div className='container'>
              <button 
                id='vodToggle'
                className='collapseButton'
                onClick={() => {

                  if (this.state.expanded) {
                    if (window.innerWidth > 992) {
                      document.getElementById('graph').style.height='30vh'
                    } else { document.getElementById('graph').style.height='80vh'; }
                    document.getElementById('vodToggle').innerText = 'Hide vod replay';
                  } else {
                    document.getElementById('graph').style.height = '80vh';
                    document.getElementById('vodToggle').innerText = 'Show vod replay';
                  }
                  this.setState({expanded: !this.state.expanded})
                }}
              >
              Show vod replay
              </button>
            </div>
            <Collapse in={!this.state.expanded} >
              <div id='embed-player' className='react-player-container'>
                <ReactPlayer
                  id={'player'}
                  ref={this.ref}
                  playing={!this.state.expanded}
                  url={`https://www.twitch.tv/videos/${this.state.date.id}`} 
                  controls={true}
                  width={'100%'}
                  height={'100%'}
                  className={'react-player'} 
                  >
                </ReactPlayer>
              </div>
            </Collapse>
          </div>
        </div>
        <div style={{'flex': 2}}>
          <div id='stats' className='stats-box'>
            <header className='highlights-header' style={{'textAlign': 'center'}}>Stream Statistics</header>
            <hr></hr>
            <li id='total-msg'>Total Chat Messages:</li>
            <li id='unique-chatters'>Unique Chatters:</li>
          </div>
          <div className='highlights' id='highlights'>
            <header id='highlights-header' className='highlights-header'>Stream Highlights
              <sup id='highlight-tooltip-icon' href='#'> 🛈</sup>
              <span id='highlight-tooltip'>These highlights are automatically generated.
                <br></br>It may take up to 24 hours for them to appear.</span>
            </header>
            <hr></hr>
            <nav>
              <ul id='highlights-section'>
              </ul>
            </nav>
          </div>
        </div>
      </div>
    )
  };
  
};

export default App;
