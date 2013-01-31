// Copyright Brandon Thomas 2012
// http://brand.io
// https://github.com/echelon

var DEFAULT_TITLE = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.';

var DEFAULT_TEXT = 'Mauris in ipsum a mi feugiat bibendum et non dui. Maecenas sed fringilla est. Vestibulum commodo enim id mauris rhoncus sed euismod nunc venenatis. Sed non orci justo, nec auctor lorem. Vivamus fermentum auctor ante ut porta.';

/**
 * Step model
 * Each step in the marketing page has a rollover image,
 * a title, and some descriptive text.
 */
var Step = Backbone.Model.extend({
	
	defaults: {
		active: false, // rollover state
		title: DEFAULT_TITLE,
		text: DEFAULT_TEXT,

		// Images that represent the step. 
		// Rollover active and inactive image sources.
		activeSrc: 'example.png',
		inactiveSrc: 'example-active.png',
	},

	// Get the image source according to 
	// current rollover state.
	getSrc: function() {
		if(this.get('active')) {
			return this.get('activeSrc');
		}
		return this.get('inactiveSrc');
	}
});

var StepList = Backbone.Collection.extend({
	model: Step,

	// Turn all rollover states off
	deactivateAll: function() {
		this.each(function(mod) {
			mod.set('active', false);
		});
	},
});

/**
 * Text describing the step.
 */
var StepTextView = Backbone.View.extend({
	model: null,

	initialize: function() {
		this.$el = $('<div><h4>Title</h4><p>Text</p></div>');
		this.model.on('change', this.render, this);
	},

	render: function() {
		this.$el.find('h4')
				.html(this.model.get('title'));
		this.$el.find('p')
				.html(this.model.get('text'));

		if(this.model.get('active')) {
			this.show();
		}
		else {
			this.hide();
		}
	},

	show: function() {
		this.$el.stop().fadeIn('slow');
	},

	hide: function() {
		this.$el.stop().hide();
	}
});

/**
 * Step rollover image.
 */
var StepImgView = Backbone.View.extend({
	model: null,
	collection: null,

	events: {
		'mouseenter': 'enter',
	},

	// CTOR Args:
	//   $el -- the jQuery wrapped element.
	//   collection -- the collection to use.
	initialize: function() {
		this.$el = this.options['$el'];

		this.model.on('change', this.render, this);

		this.collection = this.options['collection'];
	},
	
	render: function() {
		this.$el.attr('src', this.model.getSrc());
	},

	enter: function() {
		this.collection.deactivateAll();
		this.model.set('active', true);
	},
});

var RolloverAppView = Backbone.View.extend({
	initialize: function()
	{
		var steps = new StepList();
	
		$('#rollover-text').empty();

		$('#rollovers img').each(function() {
			var inactive = $(this).attr('src'),
				active = inactive.replace(/\.png$/, '-hover.png');

			var step = new Step({
				inactiveSrc: inactive,
				activeSrc: active,
				title: $(this).data('title') || DEFAULT_TITLE,
				text: $(this).data('text') || DEFAULT_TEXT,
			});

			steps.push(step);

			var img = new StepImgView({
				model: step,
				collection: steps,
				$el: $(this),
			});
			
			var txt = new StepTextView({
				model: step,
				collection: steps,
			});

			$('#rollover-text').append(txt.$el);
			txt.hide();

			$(this).data('model', step);
			$(this).data('view', img);
		})

		steps.at(0).set('active', true);
		window.steps = steps;
	},
});

