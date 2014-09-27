define([
	'jquery',
	'underscore',
	'backbone',
	'd3-cloud'
	], function($, _, Backbone, d3) {
		var WikiCloudCanvas = Backbone.View.extend( {
			draw: function(input) {
			  d3.layout.cloud().size([this.size, this.size])
			      .words(this.wordObjects)
			      .padding(2)
			      .rotate(function() { return ~~(Math.random() * 2) * 90; })
			      .font("Impact")
			      .fontSize(function(d) { return d.size; })
			      .on("end", _.bind(this.layout, this))
			      .start();
			  },
			layout: function(words) {
				var fill = function() {
					if (lastcolor++ == colors.length) {
						lastcolor = 0;
					}
					return colors[lastcolor];
				}
				var colors = this.colors;
				var lastcolor = 0;
				d3.select('.cloud'+this.cid, this.$el).append("svg")
					.attr("width", this.size)
					.attr("height", this.size)
				.append("g")
					.attr("transform", "translate("+(this.size/2)+","+(this.size/2)+")")
				.selectAll("text")
					.data(words)
				.enter().append("text")
					.style("font-size", function(d) { return d.size + "px"; })
					.style("font-family", "Impact")
					.style("fill", function(d, i) {return fill();})
					.attr("text-anchor", "middle")
					.attr("transform", function(d) {
						return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
					})
					.text(function(d) { return d.text; });
			},
			initialize: function(options) {
				WikiCloudCanvas.__super__.initialize.apply(this, arguments);
				this.colors = options.colors || ["000080", "FF0000", "C0C0C0"];
				this.team = options.team;
				this.size = options.size;
				this.findPageId(this.team);
			},
			render: function() {
				this.$el.html('<div class="cloud'+this.cid+'""></div><button>Respin</button>');
				this.$el.attr('style', 'display:inline-block;');
				this.$el.find('button').on('click',_.bind(function() {
					this.render();
				}, this));
				if (this.wordObjects) {
					this.draw(this.wordObjects);
				}
				/*this.draw(this.words || [
				        "Hello", "world", "normally", "you", "want", "more", "words",
				        "than", "this"]);*/
				//this.$el.append(this.bodyText);
				WikiCloudCanvas.__super__.render.apply(this, arguments);
				return this;
			},
			findPageId: function(teamName) {
				$.ajax( {
					url: "http://en.wikipedia.org/w/api.php?format=json&action=query&titles=" + teamName + "&rvprop=content&prop=revisions",
					success: _.bind(function(data) {
						for (var j in data.query.pages) {
							this.pageId = j;
						}
						this.getWikiText();
					}, this)
				})
			},
			getWikiText: function() {
				$.ajax({
					url: "http://en.wikipedia.org/w/api.php?format=json&action=parse&pageid=" + this.pageId + "&prop=text&contentmodel=text",
					success: _.bind(function(data) {
						this.bodyText = data.parse.text['*'].replace(/<(?:.|\n)*?>/gm, '');
						this.getWordCount(this.bodyText);
					}, this)
				});
			},
			maybeRender: function() {
				return this.render();
			},
			getWordCount: function(text) {
				var sWords = text.split(/[\s\/]+/g).sort();
				var iWordsCount = sWords.length; // count w/ duplicates
			 
				// array of words to ignore
				var ignore = ['and','the','to','a','of','for','as','i','with','it','is','on','that','this','can','in','be','has','if', '^', '-'];
				ignore = (function(){
					var o = {}; // object prop checking > in array checking
					var iCount = ignore.length;
					for (var i=0;i<iCount;i++){
						o[ignore[i]] = true;
					}
					return o;
				}());
			 
				var counts = {}; // object for math
				for (var i=0; i<iWordsCount; i++) {
					var sWord = sWords[i];
					if (!ignore[sWord]) {
						counts[sWord] = counts[sWord] || 0;
						counts[sWord]++;
					}
				}
			 
				var arr = []; // an array of objects to return
				for (sWord in counts) {
					arr.push({
						text: sWord,
						frequency: counts[sWord]
					});
				}
			 
				// sort array by descending frequency | http://stackoverflow.com/a/8837505
				var words = arr.sort(function(a,b){
					return (a.frequency > b.frequency) ? -1 : ((a.frequency < b.frequency) ? 1 : 0);
				});
				this.wordObjects = words.slice(0, 50)
				this.wordObjects = this.wordObjects.map(_.bind(function(d) {
			        return {text: d.text, size: 10 + (d.frequency / this.wordObjects[0].frequency) * 90};
			      }, this));
				this.render();
			}
		});

		return WikiCloudCanvas;
});