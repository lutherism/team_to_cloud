define([
	'jquery',
	'underscore',
	'backbone',
	'd3-cloud'
	], function($, _, Backbone, d3) {
		var WikiCloudCanvas = Backbone.View.extend({
			events: {
				'click .colors': 'tryNewColors',
				'click .respin': 'render',
				'click .png': 'downloadPNG',
				'keydown input': 'wordEnter'
			},
			draw: function(input) {
			  this.cloudObj = d3.layout.cloud().size([this.sizeX, this.sizeY])
			      .words(this.wordObjects)
			      .padding(2)
			      .rotate(function() { return (Math.random() * 5) * 90 - 45; })
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
					.attr("width", this.sizeX)
					.attr("height", this.sizeY)
				.append("g")
					.attr("transform", "translate("+(this.sizeX/2)+","+(this.sizeY/2)+")")
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
			downloadPNG: function(scale) {
				scale = 2;
				var fill = _.bind(function() {
					if (this.lastcolor++ == this.colors.length) {
						this.lastcolor = 0;
					}
					return this.colors[this.lastcolor];
				}, this)
				var colors = this.colors;
				this.lastcolor = 0;
				 var canvas = document.createElement("canvas");
				 var c = canvas.getContext("2d");
				  canvas.width = parseInt(this.sizeX * scale);
				  canvas.height = parseInt(this.sizeY * scale);
				  c.translate(parseInt(this.sizeX * (scale / 2)), parseInt(this.sizeY * (scale / 2)));
				  c.scale(scale, scale);
				  this.cloudObj.words().forEach(function(word, i) {
				    c.save();
				    c.translate(word.x, word.y);
				    c.rotate(word.rotate * Math.PI / 180);
				    c.textAlign = "center";
				    c.fillStyle = '#'+fill();
				    c.font = word.size + "px " + word.font;
				    c.fillText(word.text, 0, 0);
				    c.restore();
				  });
				  window.open(canvas.toDataURL("image/png"));
			},
			wordEnter: function(e) {
				if (event.which == 13 || event.keyCode == 13) {
					this.banWords([$(e.currentTarget).val()])
				}
			},
			initialize: function(options) {
				WikiCloudCanvas.__super__.initialize.apply(this, arguments);
				this.colorOptions = options.colors;
				this.mixColors();
				this.team = options.team;
				this.sizeX = options.sizeX || 300;
				this.sizeY = options.sizeY || 300;
				this.words = options.words || 100;
				this.bannedWords = options.bannedWords;
				this.findPageId(this.team);
			},
			mixColors: function() {
				var bg = parseInt(Math.random() * this.colorOptions.length);
				this.colors = [].concat(this.colorOptions) || ["000080", "FF0000", "C0C0C0"];
				this.bgColor = this.colorOptions[bg];
				delete this.colors[bg];
				this.colors.sort();
			},
			tryNewColors: function() {
				this.mixColors();
				this.render();
			},
			render: function() {
				this.$el.html('<div class="cloud'+this.cid+'""></div><button class="png">.png</button><input type="text"><button class="colors">New Colors</button><button class="respin">Respin</button>');
				this.$el.attr('style', 'display:inline-block; background-color:'+this.bgColor);
				this.$el.prepend('<span style="background-color:black; color:white">' + this.bgColor + '</span>');
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
						this.bodyText = data.parse.text['*'].replace(/<(?:.|\n)*?>/gm, '').replace(/\{{(?:.|\n)*?}}/gm, '');
						this.getWordCount(this.bodyText);
					}, this)
				});
			},
			maybeRender: function() {
				return this.render();
			},
			banWords: function(words) {
				this.bannedWords = this.bannedWords.concat(words);
				this.getWordCount(this.bodyText);
			},
			getWordCount: function(text) {
				var sWords = text.split(/[\s\/]+/g).sort();
				var iWordsCount = sWords.length; // count w/ duplicates
			 
				// array of words to ignore
				var ignore = this.bannedWords;
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
					slWord = sWord.toLowerCase();
					if (!ignore[slWord]) {
						counts[slWord] = counts[slWord] || {frequency:0};
						if (slWord == sWord) {
							counts[slWord].text = counts[slWord].text || sWord;
						} else {
							counts[slWord].text = sWord;
						}
						counts[slWord].frequency++;
					}
				}
			 
				var arr = []; // an array of objects to return
				for (sWord in counts) {
					arr.push({
						text: counts[sWord].text,
						frequency: counts[sWord].frequency
					});
				}
			 
				// sort array by descending frequency | http://stackoverflow.com/a/8837505
				var words = arr.sort(function(a,b){
					return (a.frequency > b.frequency) ? -1 : ((a.frequency < b.frequency) ? 1 : 0);
				});
				this.wordObjects = words.slice(0, this.words)
				this.wordObjects = this.wordObjects.map(_.bind(function(d) {
			        return {text: d.text, size: 8 + (d.frequency / this.wordObjects[0].frequency) * 72};
			      }, this));
				this.render();
			}
		});

		return WikiCloudCanvas;
});