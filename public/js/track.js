function Track(query) {
	this.originalQuery = query;
	this.cleanedQuery = this.normalizeSearchQuery(query);
	/* spotifyMatches is an array of 0-n songs on Spotify that matched the given query
	   There are 3 cases for data in this array
	   1. 0 items - this query returned no results on Spotify
	   2. 1 item - there was an exact match on Spotify
	   3. n items (where n > 0) - there were multiple matches on Spotify
	*/
	this.spotifyMatches = [];
	this.selectedMatch = -1;
};

Track.prototype.setSelectedMatch = function(index) {
	if (index < 0 || index > this.spotifyMatches.length - 1) {
		throw new Error('Selected Match out of bounds');
	}
	this.selectedMatch = index;
}

Track.prototype.normalizeSearchQuery = function(query) {
	var normalized = query;
	// Remove any genre tags in the formation [genre]
	// NOTE: This is pretty naive
	normalized = normalized.replace(/\[(\w*|\s*|\/|-)+\]/gi, '');
	// Remove the time listings in the format [hh:mm:ss]
	normalized = normalized.replace(/(\[(\d*)?:?\d+:\d+\])/, '');
	// Remove the year tags in the format [yyyy] or (yyyy)
	normalized = normalized.replace(/(\[|\()+\d*(\]|\))+/, '');
	// Remove all the extraneous stuff
	normalized = normalized.replace(/[^\w\s]/gi, '');
	return normalized;
};

Track.prototype.createDisplayName = function(track) {
	var result = '';
	for (var i = 0; i < track.artists.length; i += 1) {
		if (i < track.artists.length - 1) {
			result += track.artists[i].name + ', ';
		} else {
			result += track.artists[i].name;
		}
	}
	result += ' - ' + track.name;
	return result;
};

Track.prototype.createSpotifyUriFromTrackId = function(id) {
	return 'spotify:track:' + id;
};

Track.prototype.addSpotifyMatches = function(matches) {
	for (var i = 0; i < matches.length; i += 1) {
		this.spotifyMatches.push(matches[i]);
	}
	if (this.spotifyMatches.length > 1) {
		this.selectedMatch = 0;
	}
}
