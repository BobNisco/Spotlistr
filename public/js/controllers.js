'use strict';

/* Controllers */

angular.module('spotlistr.controllers', [])
	.controller('Splash', ['$scope', '$routeParams', 'UserFactory', function($scope, $routeParams, UserFactory) {
		if ($routeParams.accessToken && $routeParams.refreshToken) {
			UserFactory.setTokensAndPullUserInfo($routeParams.accessToken, $routeParams.refreshToken);
		}
		$scope.userFactory = UserFactory;
	}])
	.controller('Textbox', ['$scope', '$routeParams', 'UserFactory', 'SpotifySearchFactory', 'SpotifyPlaylistFactory', 'QueryFactory', function($scope, $routeParams, UserFactory, SpotifySearchFactory, SpotifyPlaylistFactory, QueryFactory) {
		if ($routeParams.accessToken && $routeParams.refreshToken) {
			UserFactory.setTokensAndPullUserInfo($routeParams.accessToken, $routeParams.refreshToken);
		}
		$scope.userFactory = UserFactory;
		// The data in the text area
		$scope.taData = '';
		// The name of the playlist
		$scope.playlistName = '';
		// Boolean for if the playlist will be public or nah
		$scope.publicPlaylist = true;
		// Messages to the user
		$scope.messages = [];
		// Bool flag for if search is running
		$scope.searching = false;
		// The tracks
		$scope.trackArr = [];

		$scope.performSearch = function() {
			$scope.searching = true;
			QueryFactory.clearResults($scope.trackArr, $scope.messages);
			var rawInputByLine = $scope.taData.split('\n');
			for (var i = 0; i < rawInputByLine.length; i += 1) {
				$scope.trackArr.push(new Track(rawInputByLine[i]));
			}
			QueryFactory.performSearch($scope.trackArr);
			$scope.searching = false;
		};

		$scope.assignSelectedTrack = function(track, index) {
			QueryFactory.assignSelectedTrack(track, index);
		};

		$scope.createPlaylist = function(name, isPublic) {
			SpotifyPlaylistFactory.createPlaylist(name, isPublic, $scope.trackArr, $scope.messages);
		};

	}])
	.controller('Subreddit', ['$scope', '$q', 'UserFactory', 'SpotifySearchFactory', 'SpotifyPlaylistFactory', 'RedditFactory', 'QueryFactory', 'SoundCloudFactory', function($scope, $q, UserFactory, SpotifySearchFactory, SpotifyPlaylistFactory, RedditFactory, QueryFactory, SoundCloudFactory) {
		$scope.userFactory = UserFactory;

		$scope.subredditSortBy = [
			{name: 'hot', id: 'hot'},
			{name: 'top - hour', id: 'top', sort: 't=hour'},
			{name: 'top - day', id: 'top', sort: 't=day'},
			{name: 'top - week', id: 'top', sort: 't=week'},
			{name: 'top - month', id: 'top', sort: 't=month'},
			{name: 'top - year', id: 'top', sort: 't=year'},
			{name: 'top - all', id: 'top', sort: 't=all'},
			{name: 'new', id: 'new'}
		];
		$scope.selectedSortBy = $scope.subredditSortBy[0];
		$scope.subredditInput = '';

		// The tracks
		$scope.trackSet = new TrackSet();
		// The name of the playlist
		$scope.playlistName = '';
		// Boolean for if the playlist will be public or nah
		$scope.publicPlaylist = true;
		// Messages to the user
		$scope.messages = [];
		// Bool flag for if search is running
		$scope.searching = false;
		// How many results to fetch from Reddit (multiples of 25)
		$scope.fetchAmounts = [25, 50, 75, 100];
		// The selected fetch amount
		$scope.selectedFetchAmounts = $scope.fetchAmounts[0];
		// A list of popular music Subreddits
		$scope.popularSubreddits = [
			'Or Select a Popular Subreddit!',
			'50sMusic',
			'60sMusic',
			'70sMusic',
			'80sMusic',
			'90sAlternative',
			'90sHipHop',
			'90sMusic',
			'90sPunk',
			'2000sMusic',
			'2010sMusic',
			'Acapella',
			'AcidHouse',
			'AcousticOriginals',
			'AltCountry',
			'AlternativeRock',
			'AltRap',
			'Ambient',
			'AmbientMusic',
			'AsianRap',
			'AStateOfTrance',
			'AtmosphericDnB',
			'BigRoom',
			'BlackMetal',
			'Bluegrass',
			'Blues',
			'BluesRock',
			'Boneyard',
			'BoogieMusic',
			'Breakbeat',
			'Breakcore',
			'Brostep',
			'CanadianMusic',
			'ChillMusic',
			'Chillout',
			'ChillStep',
			'Chillwave',
			'Chiptunes',
			'ChoralMusic',
			'Christcore',
			'ChristianMusic',
			'CircleMusic',
			'ClassicalMusic',
			'ClassicMetal',
			'ClassicRock',
			'Complextro',
			'Country',
			'CoverSongs',
			'CPop',
			'CrateDigging',
			'Crustpunk',
			'Cyberpunk_Music',
			'DanceParty',
			'Deathcore',
			'DeathMetal',
			'Deathstep',
			'DeepHouse',
			'Disco',
			'Djent',
			'DnB',
			'DoomMetal',
			'Dub',
			'Dubstep',
			'Early2000sjams',
			'EDM',
			'Electro',
			'ElectroHouse',
			'Electronica',
			'ElectronicMagic',
			'ElectronicMusic',
			'ElectroPop',
			'ElectroSwing',
			'ElitistClassical',
			'EmoScreamo',
			'EpicMetal',
			'EsoteroFunk',
			'Folk',
			'FolkMetal',
			'FolkPunk',
			'FrenchHouse',
			'Funk',
			'FutureBeats',
			'FutureFunkAirlines',
			'FutureGarage',
			'FuturePopMusic',
			'FutureSynth',
			'Gabber',
			'GameMusic',
			'GaragePunk',
			'GayMusic',
			'GermanRap',
			'Germusic',
			'Glitch',
			'Glitchhop',
			'Grime',
			'Grindcore',
			'Grunge',
			'HappyHardcore',
			'Hardcore',
			'HardRock',
			'Hardstyle',
			'HeadBangToThis',
			'HipHop',
			'HipHopHeads',
			'House',
			'IDM',
			'Indie',
			'IndieWok',
			'Indie_Rock',
			'IndustrialMusic',
			'JamBands',
			'Jazz',
			'JPop',
			'Juke',
			'Jungle',
			'KPop',
			'LiftingMusic',
			'LiquidAndChillstep',
			'LiquidDnB',
			'LiquidDubstep',
			'ListenToThis',
			'ListenToUs',
			'LoFi',
			'MathRock',
			'MelodicDeathMetal',
			'MelodicHardcore',
			'Metal',
			'Minimal',
			'MonsterFuzz',
			'Moombahcore',
			'Moombahton',
			'Music',
			'MusicForConcentration',
			'NeuroFunk',
			'NewGrass',
			'NoiseMusic',
			'NoiseRock',
			'NOLAMusic',
			'NuDisco',
			'ObscureMusic',
			'OldieMusic',
			'Opera',
			'Orchestra',
			'OutlawCountry',
			'Outrun',
			'PartyMusic',
			'PartyMusicStation',
			'PopPunkers',
			'PostHardcore',
			'PostMetal',
			'PostRock',
			'PowerMetal',
			'ProgHouse',
			'ProgMetal',
			'ProgRockMusic',
			'Psybient',
			'PsychadelicRock',
			'PsyTrance',
			'Punk',
			'PunkSkaHardcore',
			'Punk_Rock',
			'RaggaJungle',
			'Rap',
			'RealDubstep',
			'RealProgHouse',
			'RepublicOfMusic',
			'SampleBliss',
			'ShallowHouse',
			'Shoegaze',
			'Ska',
			'Sludge',
			'SoundsVintage',
			'Soundtracks',
			'StonerRock',
			'SwingHouse',
			'SymphonicMetal',
			'Synthwave',
			'TechnicalDeathMetal',
			'Techno',
			'Tech_House',
			'ThisIsOurMusic',
			'Trance',
			'Trap',
			'TrapMuzik',
			'TreeMusic',
			'TripHop',
			'TripTrap',
			'TrueBlackMetal',
			'TrueMusic',
			'Under10k',
			'VintageObscura',
			'WitchHouse',
			'WorldMusic',
		];
		$scope.selectedPopularSubreddits = $scope.popularSubreddits[0];

		$scope.searchType = 'Subreddit';

		$scope.soundCloudClientId = SoundCloudFactory.apiKey;

		$scope.performSearch = function() {
			var _trackArr = $scope.trackSet.tracks,
				_subredditInput = $scope.subredditInput;
			$scope.searching = true;
			QueryFactory.clearResults($scope.trackSet.tracks, $scope.messages);
			RedditFactory.getSubreddit($scope.subredditInput, $scope.selectedSortBy.id, $scope.selectedSortBy.sort, $scope.selectedFetchAmounts, function(response) {

				RedditFactory.putAllTracksIntoArray(response, response.data.children, _trackArr, _subredditInput, function(e) {
					// 2. Search Spotify
					QueryFactory.performSearch($scope.trackSet.tracks);
					$scope.searching = false;
				});
			});
		};

		$scope.popularSubredditOnChange = function() {
			if ($scope.selectedPopularSubreddits === $scope.popularSubreddits[0]) {
				$scope.subredditInput = '';
			} else {
				$scope.subredditInput = $scope.selectedPopularSubreddits;
			}
		}

		$scope.assignSelectedTrack = function(track, index) {
			QueryFactory.assignSelectedTrack(track, index);
		};

		$scope.createPlaylist = function(name, isPublic) {
			SpotifyPlaylistFactory.createPlaylist(name, isPublic, $scope.trackSet.tracks, $scope.messages);
		};
	}])
.controller('Multireddit', ['$scope', 'UserFactory', 'SpotifySearchFactory', 'SpotifyPlaylistFactory', 'RedditFactory', 'QueryFactory', 'RedditUserFactory', '$routeParams', '$q', '$http', 'SoundCloudFactory', function($scope, UserFactory, SpotifySearchFactory, SpotifyPlaylistFactory, RedditFactory, QueryFactory, RedditUserFactory, $routeParams, $q, $http, SoundCloudFactory) {

		if ($routeParams.access_token && $routeParams.refresh_token) {
			// Save the access token into local storage
			RedditUserFactory.setAccessToken($routeParams.access_token);
			// Save the refresh token into local storage
			RedditUserFactory.setRefreshToken($routeParams.refresh_token);
		}
		// Reddit Authentication Info
		$scope.redditUserFactory = RedditUserFactory;
		$scope.userFactory = UserFactory;
		// The tracks
		$scope.trackArr = [];

		$scope.subredditSortBy = [
			{name: 'hot', id: 'hot'},
			{name: 'top - hour', id: 'top', sort: 't=hour'},
			{name: 'top - day', id: 'top', sort: 't=day'},
			{name: 'top - week', id: 'top', sort: 't=week'},
			{name: 'top - month', id: 'top', sort: 't=month'},
			{name: 'top - year', id: 'top', sort: 't=year'},
			{name: 'top - all', id: 'top', sort: 't=all'},
			{name: 'new', id: 'new'}
		];
		$scope.selectedSortBy = $scope.subredditSortBy[0];
		$scope.subredditInput = '';
		$scope.multireddits = [];
		$scope.selectedMultireddit = 0;

		// The name of the playlist
		$scope.playlistName = '';
		// Boolean for if the playlist will be public or nah
		$scope.publicPlaylist = true;
		// Messages to the user
		$scope.messages = [];
		// Bool flag for if search is running
		$scope.searching = false;
		// How many results to fetch per each subreddit
		$scope.fetchAmounts = [5, 10, 25];
		// The selected fetch amount
		$scope.selectedFetchAmounts = $scope.fetchAmounts[0];
		$scope.searchType = 'Multireddit';

		$scope.soundCloudClientId = SoundCloudFactory.apiKey;

		RedditFactory.getUsersMultiReddits(function(response) {
			if (response.error === 401) {
				// Need to get a new token
				$http.get('/reddit/refresh_token/' +
					RedditUserFactory.getAccessToken() + '/' +
					RedditUserFactory.getRefreshToken()
				).success(function(response) {
					RedditUserFactory.setAccessToken(response.access_token);
					RedditFactory.getUsersMultiReddits(onSuccessGetUsersMultiReddits);
				});
			} else {
				onSuccessGetUsersMultiReddits(response);
			}
		});

		var onSuccessGetUsersMultiReddits = function(response) {
			for (var i = 0; i < response.length; i += 1) {
				$scope.multireddits.push(response[i]);
			}
			if ($scope.multireddits.length > 0) {
				$scope.selectedMultireddit = $scope.multireddits[0];
			}
		};

		$scope.performSearch = function() {
			var _trackArr = $scope.trackArr;
			$scope.searching = true;
			QueryFactory.clearResults($scope.trackArr, $scope.messages);
			// Get all of the subreddits to search through
			var subreddits = [];
			for (var i = 0; i < $scope.selectedMultireddit.data.subreddits.length; i += 1) {
				subreddits.push($scope.selectedMultireddit.data.subreddits[i].name);
			}

			// Map over each of the subreddits to fire the async event to get the data
			var promises = subreddits.map(function(subreddit) {
				var deferred = $q.defer();
				// Async task
				RedditFactory.getSubreddit(subreddit, $scope.selectedSortBy.id, $scope.selectedSortBy.sort, $scope.selectedFetchAmounts, function(response) {
					RedditFactory.putAllTracksIntoArray(response, response.data.children, _trackArr, null, function(ev) {
						deferred.resolve(response);
					});

				});
				return deferred.promise;
			});

			$q.all(promises).then(function(e) {
				// 2. Search Spotify
				QueryFactory.performSearch(_trackArr);
				$scope.searching = false;
			});
		};

		$scope.assignSelectedTrack = function(track, index) {
			QueryFactory.assignSelectedTrack(track, index);
		};

		$scope.createPlaylist = function(name, isPublic) {
			SpotifyPlaylistFactory.createPlaylist(name, isPublic, $scope.trackArr, $scope.messages);
		};
	}])
	.controller('LastfmSimilar', ['$scope', 'UserFactory', 'SpotifySearchFactory', 'SpotifyPlaylistFactory', 'QueryFactory', 'LastfmFactory', function($scope, UserFactory, SpotifySearchFactory, SpotifyPlaylistFactory, QueryFactory, LastfmFactory) {

		$scope.userFactory = UserFactory;
		// The tracks
		$scope.trackArr = [];
		// The data in the text area
		$scope.taData = '';
		// The selected indexes of the review tracks
		$scope.selectedReviewedTracks = {};
		// The name of the playlist
		$scope.playlistName = '';
		// Boolean for if the playlist will be public or nah
		$scope.publicPlaylist = true;
		// Messages to the user
		$scope.messages = [];
		// Bool flag for if search is running
		$scope.searching = false;
		// Amount of similar tracks per track
		$scope.similarCount = 10;
		$scope.searchType = 'Last.fm Similar Tracks';

		$scope.performSearch = function() {
			$scope.searching = true;
			QueryFactory.clearResults($scope.trackArr, $scope.messages);
			var inputByLine = $scope.taData.split('\n'),
				splitTrack = [];

			LastfmFactory.getSimilarTracksAndExtractInfo(inputByLine, $scope.similarCount, function(lastfmSimilarTracks) {
				LastfmFactory.extractQueriesFromLastfmSimilarTracks(lastfmSimilarTracks, $scope.trackArr);
				QueryFactory.performSearch($scope.trackArr);
				$scope.searching = false;
			});
		};

		$scope.assignSelectedTrack = function(track, index) {
			QueryFactory.assignSelectedTrack(track, index);
		};

		$scope.createPlaylist = function(name, isPublic) {
			SpotifyPlaylistFactory.createPlaylist(name, isPublic, $scope.trackArr, $scope.messages);
		};
	}])
.controller('LastfmToptracksSimilar', ['$scope', 'UserFactory', 'SpotifySearchFactory', 'SpotifyPlaylistFactory', 'QueryFactory', 'LastfmFactory', function($scope, UserFactory, SpotifySearchFactory, SpotifyPlaylistFactory, QueryFactory, LastfmFactory) {

		$scope.userFactory = UserFactory;
		// The tracks
		$scope.trackArr = [];
		// The name of the playlist
		$scope.playlistName = '';
		// Boolean for if the playlist will be public or nah
		$scope.publicPlaylist = true;
		// Messages to the user
		$scope.messages = [];
		// Bool flag for if search is running
		$scope.searching = false;
		// Amount of similar tracks per track
		$scope.similarCount = 5;
		// Inputted Last.fm username
		$scope.lastfmUsername = '';
		// Sort by options
		$scope.lastfmPeriodOptions = [
			{name: '7 Days', id: '7day'},
			//{name: '1 Month', id: '1month'},
			{name: '3 Months', id: '3month'},
			{name: '6 Months', id: '6month'},
			{name: '12 Months', id: '12month'},
			{name: 'Overall', id: 'overall'},
		];
		$scope.searchType = 'Last.fm Top Tracks Similar';
		// Selected sort option
		$scope.selectedLastfmPeriodOption = $scope.lastfmPeriodOptions[0];

		$scope.performSearch = function() {
			$scope.searching = true;
			QueryFactory.clearResults($scope.trackArr, $scope.messages);

			// 1. Grab the tracks from the Last.fm user's profile
			LastfmFactory.getUserTopTracks($scope.lastfmUsername, $scope.selectedLastfmPeriodOption.id, function(response) {
				// 2. Extract the Artist - Track Title from the results
				var topTracks = LastfmFactory.extractInfoFromLastfmResults(response.toptracks);
				// 3. For each Top Track, find similar tracks and produce results
				LastfmFactory.getSimilarTracksAndExtractInfo(topTracks, $scope.similarCount, function(lastfmSimilarTracks) {
					LastfmFactory.extractQueriesFromLastfmSimilarTracks(lastfmSimilarTracks, $scope.trackArr);
					QueryFactory.performSearch($scope.trackArr);
					$scope.searching = false;
				});
			});
		};

		$scope.assignSelectedTrack = function(track, index) {
			QueryFactory.assignSelectedTrack(track, index);
		};

		$scope.createPlaylist = function(name, isPublic) {
			SpotifyPlaylistFactory.createPlaylist(name, isPublic, $scope.trackArr, $scope.messages);
		};
	}])
	.controller('YouTube', ['$scope', 'UserFactory', 'SpotifySearchFactory', 'SpotifyPlaylistFactory', 'QueryFactory', 'YouTubeFactory', function($scope, UserFactory, SpotifySearchFactory, SpotifyPlaylistFactory, QueryFactory, YouTubeFactory) {
		$scope.userFactory = UserFactory;
		// The tracks
		$scope.trackArr = [];
		// The selected indexes of the review tracks
		$scope.selectedReviewedTracks = {};
		// The name of the playlist
		$scope.playlistName = '';
		// Boolean for if the playlist will be public or nah
		$scope.publicPlaylist = true;
		// Messages to the user
		$scope.messages = [];
		// Bool flag for if search is running
		$scope.searching = false;

		$scope.playlistId = '';

		$scope.searchType = 'YouTube';

		$scope.performSearch = function() {
			$scope.searching = true;
			QueryFactory.clearResults($scope.trackArr, $scope.messages);
			YouTubeFactory.getPlaylist(getPlaylistIdFromUrl(), function(items) {
				for (var i = 0; i < items.length; i += 1) {
					var newTrack = new Track(items[i].snippet.title);
					newTrack.sourceUrl = 'http://youtube.com/watch?v=' + items[i].snippet.resourceId.videoId;
					$scope.trackArr.push(newTrack);
				}
				QueryFactory.performSearch($scope.trackArr);
				$scope.searching = false;
			});
		};

		var getPlaylistIdFromUrl = function() {
			var name = 'list';
			// http://stackoverflow.com/a/901144/877117
			name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
		    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
		        results = regex.exec($scope.playlistId);
		    return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
		}

		$scope.assignSelectedTrack = function(track, index) {
			QueryFactory.assignSelectedTrack(track, index);
		};

		$scope.createPlaylist = function(name, isPublic) {
			SpotifyPlaylistFactory.createPlaylist(name, isPublic, $scope.trackArr, $scope.messages);
		};
	}])
	.controller('SoundCloud', ['$scope', 'UserFactory', 'SpotifySearchFactory', 'SpotifyPlaylistFactory', 'QueryFactory', 'SoundCloudFactory', function($scope, UserFactory, SpotifySearchFactory, SpotifyPlaylistFactory, QueryFactory, SoundCloudFactory) {
		$scope.userFactory = UserFactory;
		// The tracks
		$scope.trackArr = [];
		// The selected indexes of the review tracks
		$scope.selectedReviewedTracks = {};
		// The name of the playlist
		$scope.playlistName = '';
		// Boolean for if the playlist will be public or nah
		$scope.publicPlaylist = true;
		// Messages to the user
		$scope.messages = [];
		// Bool flag for if search is running
		$scope.searching = false;

		$scope.playlistId = '';

		$scope.searchType = 'SoundCloud';

		$scope.soundCloudClientId = SoundCloudFactory.apiKey;

		$scope.performSearch = function() {
			$scope.searching = true;
			QueryFactory.clearResults($scope.trackArr, $scope.messages);
			var url = '/resolve.json?url=' + $scope.playlistId + '&client_id=' + $scope.soundCloudClientId;
			SC.get(url, function(playlist) {
				for (var i = 0; i < playlist.tracks.length; i++) {
					var newTrack = new Track(playlist.tracks[i].title);
					if (playlist.tracks[i].downloadable) {
						newTrack.downloadUrl = playlist.tracks[i].download_url;
					}
					$scope.trackArr.push(newTrack);
				}
				QueryFactory.performSearch($scope.trackArr);
				$scope.searching = false;
			});
		};

		var getPlaylistIdFromUrl = function() {
			var name = 'list';
			// http://stackoverflow.com/a/901144/877117
			name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
		    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
		        results = regex.exec($scope.playlistId);
		    return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
		}

		$scope.createDisplayName = QueryFactory.createDisplayName;

		$scope.assignSelectedTrack = function(track, index) {
			QueryFactory.assignSelectedTrack(track, index);
		};

		$scope.createPlaylist = function(name, isPublic) {
			SpotifyPlaylistFactory.createPlaylist(name, isPublic, $scope.trackArr, $scope.messages);
		};
	}])
	.controller('ExportSpotifyPlaylist', ['$scope', 'UserFactory', 'SpotifySearchFactory', 'SpotifyPlaylistFactory', 'QueryFactory', function($scope, UserFactory, SpotifySearchFactory, SpotifyPlaylistFactory, QueryFactory) {
		$scope.userFactory = UserFactory;
		// Messages to the user
		$scope.messages = [];
		// Bool flag for if search is running
		$scope.searching = false;
		// The Spotify URI
		$scope.spotifyUri = '';
		// The tracks
		$scope.trackArr = [];

		$scope.performSearch = function() {
			$scope.searching = true;
			QueryFactory.clearResults($scope.trackArr, $scope.messages);
			// Reset the messages array
			$scope.messages.length = 0;
			var playlistData = SpotifyPlaylistFactory.extractUserIdAndPlaylistIdFromSpotifyUri($scope.spotifyUri);
			if (playlistData === null) {
				SpotifyPlaylistFactory.addError($scope.messages, 'Please input a valid Spotify URI. Example: spotify:user:bobnisco:playlist:2prZEZ7nNZf9xeikRqB4NG');
				$scope.searching = false;
				return false;
			}
			SpotifyPlaylistFactory.getPlaylistTracks(playlistData.userId, playlistData.playlistId, $scope.trackArr, $scope.messages, function(response) {
				$scope.searching = false;
			});
		};
	}])
	.controller('DedupePlaylist', ['$scope', 'UserFactory', 'SpotifySearchFactory', 'SpotifyPlaylistFactory', 'QueryFactory', function($scope, UserFactory, SpotifySearchFactory, SpotifyPlaylistFactory, QueryFactory) {
		$scope.userFactory = UserFactory;
		// Messages to the user
		$scope.messages = [];
		// Bool flag for if search is running
		$scope.searching = false;
		// The Spotify URI
		$scope.spotifyUri = '';
		// The tracks
		$scope.trackArr = [];

		$scope.performSearch = function() {
			$scope.searching = true;
			QueryFactory.clearResults($scope.trackArr, $scope.messages);
			// Reset the messages array
			$scope.messages.length = 0;
			var playlistData = SpotifyPlaylistFactory.extractUserIdAndPlaylistIdFromSpotifyUri($scope.spotifyUri);
			if (playlistData === null) {
				SpotifyPlaylistFactory.addError($scope.messages, 'Please input a valid Spotify URI. Example: spotify:user:bobnisco:playlist:2prZEZ7nNZf9xeikRqB4NG');
				$scope.searching = false;
				return false;
			}
			SpotifyPlaylistFactory.getPlaylistTracks(playlistData.userId, playlistData.playlistId, $scope.trackArr, $scope.messages, function(response) {
				$scope.searching = false;
				var found = {};
				var dupes = {};
				for (var i = 0; i < $scope.trackArr.length; i++) {
					var currentTrack = $scope.trackArr[i];
					if (!currentTrack.spotifyMatches.length) {
						return;
					}
					var trackId = currentTrack.spotifyMatches[0].id;
					if (found[trackId]) {
						// It's a dupe!
						if (dupes[trackId]) {
							dupes[trackId].positions.push(i);
						} else {
							dupes[trackId] = {
								uri: QueryFactory.createSpotifyUriFromTrackId(trackId),
								positions: [i]
							};
						}
					} else {
						found[trackId] = currentTrack;
					}
				}
				var dupesArr = [];
				for (var i in dupes) {
					if (dupes.hasOwnProperty(i)) {
						dupesArr.push(dupes[i]);
					}
				}
				if (dupesArr.length) {
					SpotifyPlaylistFactory.deleteTracks(playlistData.userId, playlistData.playlistId, UserFactory.getAccessToken(), dupesArr, function(response) {
						$scope.searching = false;
						SpotifyPlaylistFactory.addSuccess($scope.messages, 'Nice! Playlist has been removed of duplicates! Check it out in your Spotify client.');
					});
				} else {
					SpotifyPlaylistFactory.addSuccess($scope.messages, 'Your playlist has no duplicates to remove! Sweet!');
				}
			});
		};
	}])
	.controller('User', ['$scope', 'UserFactory', function($scope, UserFactory) {
		$scope.userFactory = UserFactory;
	}])
	.controller('UsersLogOut', ['$scope', '$location', 'UserFactory', function($scope, $location, UserFactory, RedditUserFactory) {
		UserFactory.clearUserData();
		RedditUserFactory.clearUserData();
		$location.path('#/splash')
	}]);
