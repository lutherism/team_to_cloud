define([
	'jquery',
	'underscore',
	'backbone',
	'views/WikiCloudCanvas'
	], function($, _, Backbone, WikiCloudCanvas) {
	var App = Backbone.View.extend({
		initialize: function(options) {
			this.teamData = options.teamData;
			this.buildClouds();
			App.__super__.initialize.apply(this, arguments);
		},
		render: function() {
			this.$el.html('<div class="app"></div>');
			for (var i in this.teamData['NFL']) {
				this.clouds[i].maybeRender();
				this.$el.append(this.clouds[i].el);
			}
			App.__super__.render.apply(this, arguments);
			return this;
		},
		buildClouds: function() {
			this.clouds = this.clouds || {};
			for (var team in this.teamData['NFL']) {
				var colors = this.teamData['NFL'][team];
				var view = new WikiCloudCanvas({
					team: team,
					colors: colors,
					size: 600
				});
				this.clouds[team] = view;
			}
		}
	});
	return App;
});