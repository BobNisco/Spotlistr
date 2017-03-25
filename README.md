# [Spotlistr](http://spotlistr.herokuapp.com)
Spotlistr - Convert Anything to a Spotify Playlist!

[![Dependency Status](https://david-dm.org/BobNisco/Spotlistr.svg)](https://david-dm.org/BobNisco/Spotlistr) [![devDependency Status](https://david-dm.org/BobNisco/Spotlistr/dev-status.svg)](https://david-dm.org/BobNisco/Spotlistr#info=devDependencies)

## Features
* Multi-line textbox search! Input a huge list of tracks into the textbox and enjoy the must intuitive way to build a playlist!
* Subreddit playlist creation! Input your favorite subreddit and select the sorting criteria (hot/new/top) and easily create a playlist!
* Last.fm similar track search! Input a list of tracks and create a playlist based on Last.fm's similar tracks!
* Last.fm top tracks similar search! Input a Last.fm username, select the period criteria (7 days / 1 month / 3 months / 6 months / 12 months / overall) and create a playlist based on Last.fm's similar tracks!
* YouTube playlist search! Paste in a YouTube playlist URL and generate a playlist on the songs!
* SoundCloud playlist/set search! Paste in a SoundCloud playlist/set URL and generate a playlist on the songs!
* If a song is not found but it has a download available on SoundCloud, the link will be shown!
* Name your own playlists and set the visibility (public or private)

## Technologies Used
* [NodeJS](http://nodejs.org/)
* [AngularJS](https://angularjs.org/)
* [Spotify Web API](https://developer.spotify.com/web-api/)
* [Reddit API](http://www.reddit.com/dev/api)
* [Last.fm API](http://www.last.fm/api)
* [YouTube Data API (v3)](https://developers.google.com/youtube/v3/)
* [SoundCloud API / JS SDK](http://developers.soundcloud.com/docs/api/sdks)
* [GulpJS](http://gulpjs.com/)
* [Heroku](http://heroku.com)

## Want to contribute?
Here's how to easily spin up a development environment and get coding! Please ensure you have [npm](https://www.npmjs.org/) installed first, then ensure you have [bower](http://bower.io/) and [GulpJS](http://gulpjs.com/) installed through npm!
* `git clone git@github.com:BobNisco/Spotlistr.git`
* `cd Spotlistr`
* `npm install` - Also has a postinstall hook to install `bower` components
* `npm run dev-server` - this starts an auto-reloading Node backend (required for talking to Spotify Web API and to serve assets)
* `npm run dev-client` - this starts the Gulp task runner and will stay running so it can watch for changes to files and run the Gulp tasks on them
* Point your browser to `http://localhost:8888/` to view

Code locally, then send a pull request! It's that easy!

## License
Copyright 2014 Bob Nisco

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
