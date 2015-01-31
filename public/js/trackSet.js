function TrackSet(tracks) {
	this.tracks = tracks || [];
};

TrackSet.prototype.getDownloadableTracksUrl = function(soundCloudClientId) {
	var downloadableTracksUrl = [];
	for (var i = 0; i < this.tracks.length; i++) {
		if (this.tracks[i].downloadUrl) {
			downloadableTracksUrl.push(this.tracks[i]);
		}
	}
	return downloadableTracksUrl;
};

TrackSet.prototype.downloadAllAvailableTracks = function(soundCloudClientId) {
	alert('This will open up a bunch of windows and automatically close them as the downloads start. Please be sure to allow popups from this website.');
	var downloadableTracksUrl = this.getDownloadableTracksUrl(soundCloudClientId);
	var body = document.getElementsByTagName('body')[0];

	for(var i = 0; i < downloadableTracksUrl.length; i++) {
		window.open(downloadableTracksUrl[i].generateSoundcloudDownloadUrl(soundCloudClientId));
	}
}
