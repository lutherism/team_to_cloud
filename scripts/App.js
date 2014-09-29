define([
	'jquery',
	'underscore',
	'backbone',
	'views/WikiCloudCanvas'
	], function($, _, Backbone, WikiCloudCanvas) {
	var App = Backbone.View.extend({
		events: {
			'click button.fullBan': 'banWords'
		},
		initialize: function(options) {
			this.teamData = options.teamData;
			this.buildClouds();
			App.__super__.initialize.apply(this, arguments);
		},
		render: function() {
			this.$el.html('<div class="app"><textarea placeholder="seperate words with , "></textarea><button class="fullBan">Ban Words</button></div>');
			//for (var league in this.teamData) {
			var league = 'NFL';
				for (var team in this.teamData[league]) {
				this.clouds[team].maybeRender();
				this.$el.append(this.clouds[team].el);
			}//}
			App.__super__.render.apply(this, arguments);
			return this;
		},
		banWords: function(e) {
			var val = this.$el.find('textarea').val();
			var words = val.split(", ");
			//for (var league in this.teamData) {
			var league = 'NFL';
				for (var i in this.teamData[league]) {
				this.clouds[i].banWords(words);
			}//}
		},
		buildClouds: function() {
			this.clouds = this.clouds || {};
			//for (var league in this.teamData) {
			var league = 'NFL';
				for (var team in this.teamData[league]) {
					var colors = this.teamData[league][team];
					var view = new WikiCloudCanvas({
						team: team,
						colors: colors,
						sizeX: 400,
						sizeY: 700,
						words: 250,
						bannedWords: ['and','the','to','a','of','for','as','i','with','it',
							'is','on','that','this','can','in','be','has','if', '^', '-',
							'by', 'i', '0', 'lost', 'they', 'their', 'at', '•', '–', 'who',
							't', 'from', 'was', '[am]', '1', 'he', 'pants', 'after']
					});
					this.clouds[team] = view;
				}
			//}
		}
	});
	return App;
});