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
	added: false, // Whether user selected for 'cart'

	defaults: {
		name: 'noname',
		title: 'Untitled Item',
		description: 'Lorem ipsum dolor sit amet, consectetur ' +
			'adipiscing elit. Nulla imperdiet enim quis ' +
			'lorem pulvinar id tincidunt dolor porttitor.',
		img: 'http://placehold.it/120x120/ee66ff/ffffff',
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
	position: '',	//
	school: '',		//
	phone: '',		//
	numKits: 0,		//
	when: '',		//

	// Model calculated metadata for the view to use
	necessary_info: false, // Switch for 'submitable' form
	yesno_clicked: false, // Meh... Yes/No Radio Travis wanted...
	yes_clicked: false, // Double meh. Getting too tired to maintain
	stage2: false,	// Switch for enabling form stage #2 

	defaults: {
		email: '',
		items: '',
		name: '',
		position: '',
		school: '',
		phone: '',
		numKits: 0,
		when: '',
		necessary_info: false,
		yesno_clicked: false,
		yes_clicked: false,
		stage2: false,
	},

	initialize: function() {
		this.bind('change:name', this.checkNecessary);
		this.bind('change:email', this.checkNecessary);
	},
	
	checkNecessary: function() {
		var name = this.get('name'),
			email = this.get('email');
		if(name && email) {
			this.set('necessary_info', true);
		}
		else {
			this.set('necessary_info', false);
		}
	},

	// Upload the form data to Google Docs
	upload: function(callback, errback) {
		var key = '00D50000000JLJt',
			url = 'https://www.salesforce.com/servlet/' +
				  'servlet.WebToLead?encoding=UTF-8';

		// TODO: Less awkward progress indication
		var s2 = this.get('stage2')? 'True' : 'False';

		$.ajax({
			url: url,
			data: { 
				// Our data
				'email': this.get('email'),
				'00N50000002qXdY': this.get('items'),
				'00N50000002qXdd': s2,
				'last_name': this.get('name'),
				'00N50000002qXay': this.get('position'),
				'00N50000002qXdT': this.get('school'),
				'phone': this.get('phone'),
				'00N50000002qXbX': this.get('numKits'),
				'00N50000002qXbS': this.get('when'),

				// Form metadata Salesforce expects
				'oid': key,
				submit: 'submit',
				retUrl: '',
				//debug: 1,
				//debugEmail: 'echelon@gmail.com',
			},
			type: 'POST',
			dataType: 'html',
			success: function(data, textStatus, xhr) {
				console.log('POST success');
			},
			error: function(xhr, textStatus, errorThrown) {
				console.log('POST error');
			},
		});

		return false;
	},

	doClear: function() {
		this.clear();
		this.trigger('clear');
	}
});

