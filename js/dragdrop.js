// Copyright Brandon Thomas 2012
// http://brand.io
// https://github.com/echelon

// Draggable items
// XXX: This was originally planned to have 'stages',
// but that never came around to be implemented.
// This code is terrible. Please ignore it.

var IT = [
	[
		'assessments',
		'casing',
		'management',
		'development', 
		'support', 
	],
];

var Item = Backbone.Model.extend({
	// Model data
	name: null,
	description: null,
	imgSrc: null, 
	added: false,

	initialize: function() {
	},
});

var ItemView = Backbone.View.extend({
	model: null,

	tagName: "span",
	className: "draggable2",

	// Image storage
	img: null,
	grayImg: null,

	// Drag state
	state: 'none',
	
	initialize: function()
	{
		var img = new Image(),
			that = this;

		this.img = img;

		// Make a grayscale copy 
		img.onload  = function() {
			var canvas = document.createElement('canvas');
			var ctx = canvas.getContext('2d');

			canvas.width = img.width;
			canvas.height = img.height;

			ctx.drawImage(img, 0, 0); 

			var pix = ctx.getImageData(0, 0, 
						img.width,
						img.height);

			for(var y = 0; y < img.height; y++) {
				for(var x = 0; x < img.width; x++) {
					var i = (y*4)* img.width + x*4;
					var avg = (pix.data[i] + 
								pix.data[i+1] +
								pix.data[i+2]) / 3;
					
					pix.data[i] = avg; 
					pix.data[i+1] = avg; 
					pix.data[i+2] = avg;
				}
			}
			
			ctx.putImageData(pix, 0, 0, 0, 0, 
					img.width, img.height);

			that.grayImg = canvas;

			that.render(); // Just in case.
		};

		// XXX: Must specify model & its image source!
		this.img.src = this.model.get('imgSrc');

		// Configure element, make draggable, etc.
		this.$el.data('obj', this)
			.addClass('drag')
			.attr('title', this.model.get('name'))
			.draggable({
				//containment: '#main',
				cursor: 'move',
				clone: true,
				helper: function(ev) {
					return $.clone(that.img);
				},
				// events
				start: function(ev, ui) {
					// XXX: Bad place to save!
					ui.helper.obj = that; 

					if(that.state != 'added') {
						that.state = 'drag';
					}
					that.render();
				},
				drag: function(ev) {
				},
				stop: function(ev) {
					if(that.state != 'added') {
						that.state = 'none';
					}
					that.render();
				},
			})
			.bind('dragstart', function(ev, ui) {
				ev.stopPropagation();
			});
	},

	render: function() {
		var img = null;

		switch(this.state) {
			case 'added':
			case 'drag':
				img = this.grayImg;
				break;
			case 'none':
			default:
				img = $.clone(this.img);
				break;
		}

		this.$el.html(img);
	}
});

var ItemList = Backbone.Collection.extend({
	model: Item,

	/**
	 * A string to submit to Google Docs forms
	 * indicating which images were added to the form.
	 */
	addedString: function() {
		var str = '';

		for(var i = 0; i < this.models.length; i++) {
			var mod = this.models[i];
			
			if(!mod.get('added')) {
				continue;
			}
			
			str += mod.get('name') + ', ';
		}
		return str;
	}
});


var Stage = Backbone.Model.extend({
	view: null,

	// Model data
	name: null,
	description: null,

	// Items in the stage
	items: null,

	initialize: function() {
	},
});

var StageView = Backbone.View.extend({
	model: null,

 	// TODO: Pass collection instead, then: views[item->view]
	itemViews: null,

	tagName: 'div',
	className: 'noClassYet',


	// XXX: model & itemViews must be set
	initialize: function() {
		var that = this;

		// XXX: Blah!
		this.itemViews = this.options.itemViews;

		_.each(this.itemViews, function(v) {
			that.$el.append(v.$el);
		});
	},

	render: function()
	{
		//var slide = this.collection.current();
		//var slide = this.items.current();

		_.each(this.itemViews, function(el) {
			el.render();
		});

		this.show();
	},

	show: function() {
		this.$el.show();
	},

	hide: function() {
		this.$el.hide();
	},
});


var StageList = Backbone.Collection.extend({
	model: Stage,

	// Pointer to last and current stage
	_cur: 0,
	_last: 0,

	initialize: function() {
	},

	current: function() {
		return this.at(this._cur);
	},

	next: function() {
		console.log('next');
		if(this._cur >= this.length - 1) {
			return;
		}
		this._last = this._cur;
		this._cur += 1;
		this.trigger('stages:change');
	},

	prev: function() {
		console.log('prev');
		if(this._cur <= 0) {
			return;
		}
		this._last = this._cur;
		this._cur -= 1;
		this.trigger('stages:change');
	},

	view: function(n) {
		if(typeof(n) != "number") {
			return;
		}
		if(n < 0 || n >= this.length) {
			return;
		}
		this._last = this._cur;
		this._cur = n;
		this.trigger('stages:change');
	}
});


/* ================= APPLICATION ================= */

var DragDropAppView = Backbone.View.extend({

	// Animation used to switch stages.
	// Options: fade | none | ...?
	animation: 'fade',

	initialize: function()
	{
		var items = new ItemList(); // *All* items
		var stages = new StageList();
		var that = this;

		this.stages = stages;
		this.items = items;

		// Setup models

		for(var i = 0; i < IT.length; i++) {
			var stage = new Stage();
			var stageView = null;
			var stageItems = new ItemList();
			var itemViews = [];

			for(var j = 0; j < IT[i].length; j++) {
				var m = new Item({
					name: IT[i][j],
					imgSrc: 'img/drag/'+IT[i][j]+'.png',
					added: false,
				});
				var v = new ItemView({model: m});

				m.view = v; // TODO: Make better

				items.push(m);
				stageItems.push(m);
				itemViews.push(v);
			}
			stage.set('items', stageItems);
			stages.push(stage);

			stageView = new StageView({
				model: stage,
				itemViews: itemViews, // TODO: Not the way to pass
			});

			stage.view = stageView; // TODO: Make better
		}

		//
		// Box animation controls
		//

		var timer = null;

		var size = {
			width: $('#drop img').width(),
			height: $('#drop img').height(),
		}

		var animTime = 200;
		var animFunc = 'easeInOutSine';

		var animBig = function() {
			$('#drop img').animate({
					width: size.width * 1.2,
					height: size.height * 1.2,
				}, 
				animTime, animFunc, function() {
					$(this).data('state', 'big');
			});
		};

		var animNorm = function() {
			$('#drop img').animate({
					width: size.width,
					height: size.height,
				}, 
				animTime, animFunc, function() {
					$(this).data('state', 'norm');
			});
		};

		var animate = function() {
			switch($('#drop img').data('state')) {
				case 'big':
					animNorm();
					break;
				case 'norm':
				default:
					animBig();
					break;
			}
		};

		var animateReset = function() {
			switch($('#drop img').data('state')) {
				case 'norm':
				case 'big':
				default:
					animNorm();
					break;
			}
		};


		// Setup dropable
		//

		$('#drop img').droppable({
			hoverClass: 'hover',
			drop: function(ev, ui) {
				clearInterval($(this).data('timer'));
				animateReset();

				// Register added.
				var d = ui.helper.obj; // XXX: Bad place to store
				d.state = 'added';
				d.model.set('added', true);
				d.render();
			},
			over: function(ev, ui) {
				var $el = $(this);
				animate();
				$el.data('timer', setInterval(function() {
					animate();
				}, animTime+100));
			},
			out: function(ev, ui) {
				clearInterval($(this).data('timer'));
				animateReset();
			},
		});

		// Handle stage change
		this.stages.bind('stages:change', this.transition, this);

		// Install stage DOMs
		this.stages.each(function(el) {
			$('#staging').prepend(el.view.$el);
			el.view.$el.hide();
		});

		this.render();
	},

	// Render the current stage
	render: function() {
		// TODO: Render cascade needed?
		this.stages.current().view.render();
	},

	/**
	 * Switch stages and handle the animation/transition
	 */
	transition: function() 
	{
		console.log('AppView.transition()');

		var moveRight = true;

		// TODO: Pub api for cur pointer
		if(this.stages._cur - this.stages._last < 0) {
			moveRight = false;
		}

		switch(this.animation) {
			case 'fade':
				this.render();
				this.$el.hide();
				this.$el.fadeIn(100);
				break;

			default:
				this.render();
		}
	}, 
});

