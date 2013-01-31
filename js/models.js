// ISI Mobile Marketing App
// We're going to use this to collect sales leads
// Copyright (c) 2013 Brandon Thomas 


/* ======================================================== *\
 * 		[1/3] ITEM MODELS -- simple clickable buttons		*
\* ======================================================== */


/**
 * Item
 * Each clickable image or icon is an 'item'. These are added
 * to a 'cart', which is simply an iteration over the ItemList.
 */

var Item = Backbone.Model.extend({
	view: null,		 // ItemView
	modalView: null, // ModalView

	// Model data
	name: null,		// Short name
	title: null,	// Fuller title
	description: null,
	img: null,
	imgAdded: null, 
	added: false, // Whether user selected for 'cart'

	defaults: {
		name: 'noname',
		title: 'Untitled Item',
		description: 'Lorem ipsum dolor sit amet, consectetur ' +
			'adipiscing elit. Nulla imperdiet enim quis ' +
			'lorem pulvinar id tincidunt dolor porttitor.',
		img: 'http://placehold.it/120x120/ee66ff/ffffff',
		imgAdded: 'http://placehold.it/120x120/66eeff/ffffff',
	},
});


/**
 * ItemList
 * Can use as a 'cart' to see which items have been added.
 * Can serialize a string for submission to GDocs, etc.
 */

var ItemList = Backbone.Collection.extend({
	model: Item,

	// Makes a string of only the selected items that we 
	// can then submit to Google Docs.
	addedString: function() {
		var str = '';
		for(var i = 0; i < this.models.length; i++) {
			var mod = this.models[i];
			if(mod.get('added')) {
				str += mod.get('name') + ', ';
			}
		}
		return str;
	},
});


/* ======================================================== *\
 * 		[2/3] STEP MODELS -- each 'pane' in the app			*
\* ======================================================== */


/**
 * Step
 * Each pane in the application is a 'step'.
 * There are two step subtypes: ItemStep and FormStep.
 */

var Step = Backbone.Model.extend({
	view: null, // StepView

	// Model data
	title: null,
	urlhash: null, // TODO: URL NAVIGABLE
});

var ItemStep = Step.extend({
	items: [], // Items in the stage (TODO: ItemList instead! From default dict!!)
});

var FormStep = Step.extend({
	// TODO: Remove. No need, really.
});

/**
 * StepList
 * Responsible for navigation between steps or 'panes'.
 * Keeps track of the current position.
 */
var StepList = Backbone.Collection.extend({
	model: Step,

	// Pointer to last and current stage
	_cur: 0,
	_last: 0,

	current: function() { 
		return this.at(this._cur); 
	},

	/////////// POINTERS /////////////

	pos: function() { return this._cur; },
	end: function() { return this.length - 1; },

	/////////// NAVIGATION ///////////

	next: function() {
		if(this._cur >= this.length - 1) {
			return;
		}
		this._last = this._cur;
		this._cur += 1;
		this.trigger('steps:change');
	},

	prev: function() {
		if(this._cur <= 0) {
			return;
		}
		this._last = this._cur;
		this._cur -= 1;
		this.trigger('steps:change');
	},

	goto: function(n) {
		if(typeof(n) != 'number') {
			return;
		}
		if(n < 0 || n >= this.length) {
			return;
		}
		this._last = this._cur;
		this._cur = n;
		this.trigger('steps:change');
	},
});


/* ======================================================== *\
 * 		[3/3] FORM MODELS -- data we collect				*
\* ======================================================== */

/**
 * Form
 *
 * The form can be filled out in one of two ways:
 * 	1) Just collect email addresses.
 * 	2) Collect 'sales leads' that fill out the entire form.
 *
 * The completed forms are uploaded to Google Docs, and this
 * class actually scripts the submission process as GDocs is
 * considered the 'backend'.
 */
var Form = Backbone.Model.extend({
	// Model data
	email: '',		// Form Stage #1 ...
	items: '',		// 
	name: '',		// Form Stage #2 ...
	school: '',		//
	phone: '',		//
	numKits: 0,		//
	stage2: false,	// Switch for stages

	defaults: {
		email: '',
		items: '',
		name: '',
		school: '',
		phone: '',
		numKits: 0,
		stage2: false,
	},

	// Upload the form data to Google Docs
	upload: function(callback, errback) {
		var formkey = 'dEU4RjFZc2QwN2lfa1ZCeHowQ01qTWc6MQ',
			url = 'https://docs.google.com/spreadsheet/' +
					'formResponse?formkey=' + 
					formkey +
					'&embedded=true&ifq';

		// TODO
		var s2 = this.get('stage2')? 'True' : 'False';

		$.ajax({
			url: url,
			data: { 
				// Our data
				'entry.0.single': this.get('email'),
				'entry.5.single': this.get('items'),
				'entry.7.single': s2,
				'entry.1.single': this.get('name'),
				'entry.2.single': this.get('school'),
				'entry.3.single': this.get('phone'),
				'entry.4.single': this.get('numKits'),

				// Form junk Google expects
				pageNumber: 0,	
				backupCache: 0,
				submit: 'Submit',
			},
			type: 'POST',
			dataType: 'html',
			success: function(data, textStatus, xhr) {
				//callback();
			},
			error: function(xhr, textStatus, errorThrown) {
				//errback();
			},
		});

		return false;
	},

	doClear: function() {
		this.clear();
		this.trigger('clear');
	}
});

