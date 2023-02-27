import React from 'react';
import {ReactTags} from 'react-tag-autocomplete'
import DatePicker from 'react-datepicker';
import {getElementAtEvent, Line} from 'react-chartjs-2';
import ReactPlayer from 'react-player';
import Select from 'react-select';
import Collapse from '@material-ui/core/Collapse';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import './react-tabs.scss';
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

export var pageTheme = '#adace5';
export var hoverText = '#121212';
export var smallScreen = false;
var reloadWindow;

function adjust(color, amount) {
  return '#' + color.replace(/^#/, '').replace(/../g, color => ('0'+Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(16)).substr(-2));
}

function WelcomePopup(props) {
  return (
    <div id='welcomePopup' className='welcomePopup' style={{'visibility': props.visible}}>
      <div>
        <h1>Welcome to Twitchlights!</h1>
        <h2>Here are a few tips to help you get the most out of this dashboard</h2>
        <nav>
          <ol>
            <li style={{'fontWeight': 'bold'}}>Select top used emotes, or search for anything you are interested in!
              <ul>
                <br></br>
                <li>Want to find when a song was played? Try searching the name of the song - it might show up on the graph!</li>
                <br></br>
                <li>Dev tip #1: Search for .* to see all chat messages</li>
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
        <hr style={{'paddingRight': '2px', 'border': '1px solid #12121290'}}></hr>
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
    return <WelcomePopup visible={'hidden'}/>;
  }
  if (isFirstVisit) {
    localStorage.setItem('firstVisit', 'false')
    return <WelcomePopup visible={'visible'}/>;
  }
}

function LegalPopup(props) {
  return (
    <div id='legalPopup' className='welcomePopup' style={{'visibility': props.visible}}>
      <div>
        <h1>Legal Disclaimer</h1>
        <hr style={{'paddingRight': '2px', 'border': '1px solid #12121290'}}></hr>
        <nav className='legal-popup-text'>
          <p>
            Twitchlights.com ("the Website") aggregates and displays chat messages sent during live streams on Twitch.tv, and provides users with trends of the chatroom. Additionally, we provide transcriptions of livestreams. These transcriptions are imperfect and do not reflect the entirety of what was said during the stream.
            <br></br>
            <br></br>
            We take user privacy very seriously and are fully compliant with EU General Data Protection Regulations (GDPR) laws. As such, any user who wishes to have their data anonymized may submit a request to us via Discord DM to "@Me actually#8806" via the links provided on the Website. Upon receiving the request, we will make reasonable efforts to scrub the user's username from our database as soon as possible.
            <br></br>
            <br></br>
            Please note that the data shown on the Website is intended for entertainment purposes only. It should not be relied upon as a reliable source of information. While we strive to provide accurate and up-to-date information, we cannot guarantee the accuracy or completeness of the information displayed on the Website. Users should refer to the video on demand (VOD) found on Twitch.tv for an accurate reflection of the events of the stream. Our transcriptions are provided solely as a convenience to users and should not be relied upon as a substitute for watching the VOD.
            <br></br>
            <br></br>
            By using the Website, you acknowledge and agree that we shall not be liable for any direct, indirect, incidental, consequential, or exemplary damages, including but not limited to damages for loss of profits, goodwill, use, data, or other intangible losses (even if we have been advised of the possibility of such damages), resulting from the use or inability to use the Website or any content or services provided through it.
            <br></br>
            <br></br>
            Your use of the Website is entirely at your own risk, and you assume full responsibility for any and all risks associated with the use of our Website. We reserve the right to modify, suspend, or discontinue any part of the Website at any time without prior notice.
          </p>
        </nav>
        <button 
          onClick={() => document.getElementById('legalPopup').style.visibility = 'hidden'}>
            I understand
        </button>
        <hr style={{'paddingRight': '2px', 'border': '1px solid #12121290', 'animation': 'rainbow-border 5s linear infinite'}}></hr>
        <h4>
          Submit GDPR requests via Discord:&nbsp;
          <a href='https://www.discord.com/users/151913358889713667'
            target="_blank" 
            rel="noopener noreferrer">Me actually#8806
          </a>
        </h4>
      </div>
    </div>
  )
}

function DisclaimerPopup(props) {
  if (props.show) {
    return <LegalPopup visible={'visible'}/>
  } else {
    return <LegalPopup visible={'hidden'}/>
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
      openColors: [...Array(10).keys()],
      usedColors: [],
      liveStream: false,
      username: localStorage.getItem('username')||'MOONMOON',
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
    this.updateDimensions = this.updateDimensions.bind(this);
    this.searchTranscript = this.searchTranscript.bind(this);
    this.searchHighlight = this.searchHighlight.bind(this);
    this.toggleSearch = this.toggleSearch.bind(this);
    this.reactTags = React.createRef();
    this.playerRef = React.createRef();
    this.chartRef = React.createRef();
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
      var savedState = data.names.indexOf(this.state.username);
      if (savedState === -1) {
        savedState = 0;
      }
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
        theme.style.setProperty('--darker-accent-color', adjust(data.accentColor, -70))
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
              // if (this.state.liveStream) {
              //   this.setDate(new Date(data.maxDate[0].stream_date+"T00:00:00"))
              // }
          } catch { this.setDate(new Date())}
          }
      });
    })
  }

  setEmotes(e) {
    if (e.length === 0) {
      e = [{value: 101, label: 'All Chat Messages'}];
    }

    this.setState({emotes: [].concat(this.state.emotes, e)}, () => 
    {
      this.fetchEmotes(e, this.state.date)
    });
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
    let dates_index;

    if (d) {
      this.state.validDates.findIndex((val, idx) => {if (val.toISOString() === d.toISOString()) {vod = this.state.validIDs[idx]; dates_index = idx} return null});
      this.setState({
        date: {date: d, id: vod},
        emotes: [],
        openColors: [...Array(10).keys()],
        usedColors: [],
        chart: [],
        xlabels: [],
        expanded: true,
      }, () => {
        this.fetchTopEmotes(d)
        if (dates_index === 0 && this.state.liveStream) {
          reloadWindow = setInterval(() => {
            this.fetchTopEmotes(d)
          }, 60000)
        } 
        else {
          clearInterval(reloadWindow)
        }
      });
    }
  };
  
  fetchTopEmotes(d) {
    fetch(BASE_URL+'/topEmotes',
      {
        method: "POST",
        body: JSON.stringify({
          date: (d.toISOString().split('T')[0]), 
          "username": '#'.concat(this.state.username)
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )
      .then((res) => res.json())
      .then((data) => {
        document.getElementById('total-msg').innerText = `Total Chat Messages: ${data.numMsg}`
        document.getElementById('unique-chatters').innerText = `Number of Chatters: ${data.numChatters}`
        
        // Add calculated highlights to ul list of highlights
        var ul = document.getElementById('highlights-section');
        while (ul.firstChild) {
          ul.removeChild(ul.firstChild);
        };

        let li;
        let t_span;
        let m_span;
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

          var h_search = document.createElement('li');
          h_search.id = 'highlight-search-item';
          h_search.className = 'transcript-search-item';
          var search_box = document.createElement('input')
          search_box.disabled = false;
          search_box.id = 'highlight-search';
          search_box.style.display = 'block';
          search_box.className = 'transcript-search';
          search_box.placeholder = 'Search highlights';
          search_box.addEventListener('input', this.searchHighlight);
          var search_toggle = document.createElement('span')
          search_toggle.appendChild(document.createTextNode('⬆️'))
          search_toggle.addEventListener('click', this.toggleSearch)
          search_toggle.className = 'search-toggle';
          h_search.appendChild(search_box)
          h_search.appendChild(search_toggle)
          ul.appendChild(h_search) 

          for (let k = 0; k < data.highlights.length; k++) {
            li = document.createElement('li');
            li.addEventListener('click', this.highlightSeek, false);
            li.addEventListener('mouseover', this.drawLine);
            li.className = 'highlight-item';
            li.id = `li-${k}`;
            var k_time = data.highlights[k].timestamp;
            
            t_span = document.createElement('span');
            t_span.className = 'highlight-item-time';
            t_span.appendChild(document.createTextNode(k_time.split('T')[1].split('.')[0]));
            m_span = document.createElement('span');
            m_span.className = 'highlight-item-content';
            m_span.appendChild(document.createTextNode(data.highlights[k].trigger));
            
            li.appendChild(t_span);
            li.appendChild(m_span);
            ul.appendChild(li);
          }
        }

        //  transcription 
        
        ul = document.getElementById('transcript-section');
        while (ul.firstChild) {
            ul.removeChild(ul.firstChild);
        };
        if (data.transcript.length === 0) {
          li = document.createElement('li');
          li.className = 'highlight-item--invalid'
          li.appendChild(document.createTextNode('Transcript is not available for this stream'))
          ul.appendChild(li)
        }
        else {

          var t_search = document.createElement('li');
          t_search.id = 'transcript-search-item';
          t_search.className = 'transcript-search-item';
          var search = document.createElement('input')
          search.disabled = false;
          search.id = 'transcript-search';
          search.style.display = 'block';
          search.className = 'transcript-search';
          search.placeholder = 'Search transcript';
          search.addEventListener('input', this.searchTranscript);
          t_search.appendChild(search);
          var num_results = document.createElement('span');
          num_results.className = 'transcript-search-results';
          num_results.id = 'transcript-results'
          num_results.appendChild(document.createTextNode(`(${data.transcript.length} results)`));
          t_search.appendChild(num_results);
          ul.appendChild(t_search);

          for (let k = 0; k < data.transcript.length; k++) {
            li = document.createElement('li');
            li.addEventListener('click', this.highlightSeek, false);
            li.addEventListener('mouseover', this.drawLine);
            li.className = 'highlight-item';
            li.id = `tran-${k}`;
            k_time = data.transcript[k].timestamp;
            
            t_span = document.createElement('span');
            t_span.className = 'highlight-item-time';
            t_span.appendChild(document.createTextNode(k_time.split('T')[1].split('.')[0]));
            m_span = document.createElement('span');
            m_span.className = 'highlight-item-content';
            m_span.appendChild(document.createTextNode(data.transcript[k].transcript));
            
            li.appendChild(t_span);
            li.appendChild(m_span);
            ul.appendChild(li);
          }
        }
        ul.scrollTop = ul.scrollHeight;
        const elist = [];
        for (let i = 0; i < data.topEmotes.length; i++) {
          elist.push({value:i, label: data.topEmotes[i]})
        }
        this.setState(
          {
            suggestions: elist, 
            emotes: [], 
            chart: [],
            xlabels: [],
            openColors: [...Array(10).keys()],
            usedColors: [],
          }, () => this.setEmotes(elist.slice(0, 5)));

      })
  };

  drawLine(loc) {
    for (let c = 0; c < this.state.chart.length; c++) {
      if (this.state.chart[c].label === 'Highlight') {
        this.killLine(c);
      }
    }
    let yMax;
    var xLoc = loc.target.firstChild.innerText;
    if (xLoc === undefined) {
      try {
        xLoc = loc.target.previousSibling.innerText;
      } catch {
        xLoc = loc.target.innerText
      }
    }
    
    if (this.state.xlabels.includes(xLoc)) {
      if (xLoc.split(':')[2] === '00') {
        xLoc = xLoc.slice(0, -2).concat(parseInt(xLoc.split(':')[2])+1)
      } else {
        xLoc = xLoc.slice(0, -2).concat(parseInt(xLoc.split(':')[2])-1)

      }
    }
    if (TESTING) {
      yMax = ChartJS.instances['1'].scales.yAxes.end;
    } else {
      yMax = ChartJS.instances['0'].scales.yAxes.end;
    }
    const newLine = [{
      label: 'Highlight', 
      type: 'line', 
      backgroundColor: '#eaeef2', 
      borderColor: '#eaeef2',
      data: [{x: xLoc, y: 0}, {x: xLoc, y: yMax}]
    }];

    const xlabels = this.state.xlabels;
    if (!xlabels.includes(xLoc)) {
      xlabels.push(xLoc)
    }

    for (let i = xlabels.length - 1; i > 0 && xlabels[i] <= xlabels[i-1]; i--) {
        var tmp = xlabels[i];
        xlabels[i] = xlabels[i-1];
        xlabels[i-1] = tmp;
    }
    // }
    this.setState({
      chart: [].concat(this.state.chart, newLine),
      xlabels: xlabels
    }, () => {}   
  )}

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
    var xLoc = event.target.firstChild.innerText;
    if (xLoc === undefined) {
      try {
        xLoc = event.target.previousSibling.innerText;
      } catch {
        xLoc = event.target.innerText
      }
    }
    if (this.state.expanded) {
      this.setState({expanded: false});
    }
    document.getElementById('vodToggle').innerText = 'Hide vod replay'
    if (window.innerWidth > 992) {
      document.getElementById('graph').style.height = '30vh';
    }
    const clickedTime = xLoc.split(' ')[0].split(':');
    var adjTime = (+clickedTime[0]) * 60 * 60 + (+clickedTime[1]) * 60 + (+clickedTime[2])
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

  searchTranscript(term) {
    var search_phrase = term.target.value.toLowerCase();
    var ul_items = document.getElementById('transcript-section').childNodes;
    var show_count = 0;
    for (let l = 1; l < ul_items.length; l++) {
      if (!ul_items[l].innerText.toLowerCase().includes(search_phrase)) {
        ul_items[l].style.display = 'none';
      } else {
        show_count += 1
        ul_items[l].style.display = 'flex';
      }
    }
    document.getElementById('transcript-results').innerText = `(${show_count} results)`
  }

  searchHighlight(term) {
    var search_phrase = term.target.value.toLowerCase();
    var ul_items = document.getElementById('highlights-section').childNodes;
    for (let l = 1; l < ul_items.length; l++) {
      if (!ul_items[l].innerText.toLowerCase().includes(search_phrase)) {
        ul_items[l].style.display = 'none';
      } else {
        ul_items[l].style.display = 'flex';
      }
    }
  }

  toggleSearch(mode) {
    var highlight_ul = document.getElementById('highlights-section')
    const liArray = Array.from(highlight_ul.querySelectorAll('li'));

    if (mode.target.innerText === '⬆️') {
      mode.target.innerText = '🕘';
      liArray.sort(function(a, b) {
        if (a.id !== 'highlight-search-item') {
          const aText = a.querySelector('span').innerText.split(':')
          const bText = b.querySelector('span').innerText.split(':')
          const aTime = 3600 * parseInt(aText[0]) + 60 * parseInt(aText[1]) + parseInt(aText[2])
          const bTime = 3600 * parseInt(bText[0]) + 60 * parseInt(bText[1]) + parseInt(bText[2])
          return aTime - bTime;
        }
        else {
          return null
        }
      });
      highlight_ul.innerHTML = '';
      liArray.forEach(function(li) {
        highlight_ul.appendChild(li);
      });
    }
    else {
      mode.target.innerText = '⬆️';
      liArray.sort(function(a, b) {
        if (a.id !== 'highlight-search-item') {
          const aText = parseInt(a.id.slice(3));
          const bText = parseInt(b.id.slice(3));
          return aText - bText;
        }
        else {
          return null
        }
      });
      highlight_ul.innerHTML = '';
      liArray.forEach(function(li) {
        highlight_ul.appendChild(li);
      });
    }
  }

  render = () => {
    return (
      <div className='page'>
        <Popup firstVisit={this.state.firstVisit}/>
        <DisclaimerPopup show={false}/>
        <div id='menu-bar' className='menu-bar'>
          <img src='icon_3color_2.png' alt='Twitchlights logo' className='menu-bar-icon'></img>
          <div id='menu-bar-items' className='menu-bar-items'>
            <div className='menu-bar-item-bg'>
              <img 
                src='help_icon.png' 
                id='menu-bar-help-1' 
                className='menu-bar-help' 
                alt='help button' 
                onClick={() => document.getElementById('welcomePopup').style.visibility = 'visible'}
              ></img>
            </div>    
            <div className='menu-bar-item-bg'>
              <img 
                src='security_policy.png' 
                id='menu-bar-help-2' 
                className='menu-bar-help' 
                alt='privacy policy button' 
                onClick={() => document.getElementById('legalPopup').style.visibility = 'visible'}
              ></img>
            </div>         
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
                    maxMenuHeight={250}
                    styles={colorStyles}
                    options={this.state.name_suggestions}
                    isClearable={false}
                    isSearchable={true}
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
        <div style={{'flex': 2, maxWidth: smallScreen? '100vw': '21vw'}}>
          <div id='stats' className='stats-box'>
            <header className='highlights-header' style={{'textAlign': 'center'}}>Stream Statistics</header>
            <hr></hr>
            <li id='total-msg'>Total Chat Messages:</li>
            <li id='unique-chatters'>Number of Chatters:</li>
          </div>
          <Tabs
            forceRenderTabPanel 
            className='highlights' 
            id='highlights'>
            <TabList style={{'border': 'none', 'margin': '0 0 0px'}}>
              <Tab 
                // className='highlights-header' 
                id='highlights-header'
                key='highlights'>
                  Stream Highlights
                <sup id='highlight-tooltip-icon' href='#'> 🛈</sup>
                <span id='highlight-tooltip'>These highlights are automatically generated.
                  <br></br>It may take up to 24 hours for them to appear.</span>
                {/* <div className='highlights' id='highlights'>
                  <header id='highlights-header' className='highlights-header'>Stream Highlights
                  </header>
                  <hr></hr>
                  <nav>
                    <ul id='highlights-section'>
                    </ul>
                  </nav>
                </div> */}
              </Tab>
              <Tab 
                // className='highlights-header' 
                key='transcript'
                id='transcript-header'
                >
                Stream Transcript
                <sup id='transcript-tooltip-icon' href='#'> 🛈</sup>
                <span id='transcript-tooltip'>This is an experimental feature.
                  <br></br>Transcription will not be available for most streams.</span>
                
              </Tab>
            </TabList>
            <hr style={{marginTop: '0px', height: '2px', border: 'none', backgroundColor: pageTheme, color: pageTheme}}></hr>
            <TabPanel>
              <nav>
                <ul id='highlights-section'>
                </ul>
              </nav>
            </TabPanel>
            <TabPanel>
              <nav>
                  <ul id='transcript-section'>
                    <li className='transcript-search-item' id='transcript-search-item'>
                      <input 
                        disabled={false} 
                        id='transcript-search' 
                        placeholder='Search transcript' 
                        className='transcript-search'>  
                      </input>
                    </li>
                    <li className='highlight-item'>
                      <span className='highlight-item-time'>00:00:00</span>
                      <span className='highlight-item-content'>So anyways chat I was talking with my wife yesterday and she said "Why are you talking to yourself? I'm a figment of your imagination." Which I though was pretty funny, because she is definitely real.</span>
                    </li>
                  </ul>
                </nav>
            </TabPanel>
          </Tabs>
        </div>
      </div>
    )
  };
  
};

export default App;
