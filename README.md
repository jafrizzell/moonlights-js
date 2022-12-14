# MOONLIGHTS

This project replaces the previous version of [MOONLIGHTS](https://github.com/jafrizzell/moonlights) which was written in python.

## Overview

MOONLIGHTS is a Twitch Chat analytics tool that tracks the usage of any emote, phrase, or sentence throughout a twitch stream.

## Features (2022-12-13)
- Datepicker dropdown
- Embedded Twitch vod player. Click on the chart to seek the vod to that time!
- A real timeseries database [questdb.io](https://questdb.io)
- Embedded Twitch.tc player
- Improved load and response times
- Hosted on DigitalOcean & Netlify

## Planned Features
- UI improvements, specifically in:
    - Consistent colors in the chart
- Auto-refresh graph during livestreams

## Nerd Stuff

 MOONLIGHTS is written with the React, using a nodejs backend to deliver content from a QuestDB database. The server and database are hosted on DigitalOcean Droplets, and the frontend is hosted on a Netlify app. You can clone both the [moonlights-js](https://github.com/jafrizzell/moonlights-js) and [moonlights-server](https://github.com/jafrizzell/moonlights-server) repos to make custom changes. Note that you will need a Twitch API Client ID, Client Secret, and Database Public IPV4 address stored in "./moonlights-server/secrets/secrets.js". You will also need to generate your own SSL key & cert if hosting on an https server.
