// ISI Mobile Marketing App
// We're going to use this to collect sales leads
// Copyright (c) 2013 Brandon Thomas 


/* ======================================================== *\
 *						STEP SCRIPTING						*
 * ======================================================== */

var StepView = Backbone.View.extend({
	model: null,

	tagName: 'div',
	className: 'stepView',

	// Overridable step configuration
	dynamicNextStep: function() {
		return window.steps.nextId();
	},

	dynamicPrevStep: function() {
		return window.steps.prevId();
	},

	render: function() {
		this.show();
	},

	show: function() {
		this.$el.show();
	},

	hide: function() {
		this.$el.hide();
	},

	fadeOut: function(time, callback) {
		this.$el.fadeOut(time, callback);
	},
});

var ItemStepView = StepView.extend({

	// XXX: model must be set
	initialize: function() {
		var that = this;

		// Static rendering
		this.$el.attr('id', this.cid);
		this.$el.html(
      		'<div class="row-fluid">' + 
				'<div class="span12 name">' +
					this.model.get('title') +
				'</div>' +
			'</div>' +
			'<div class="icons"></div>' + // XXX Important App Area!
			'<div class="buttons"></div>'
		);

		// Render items when the list is first added
		// (List doesn't exist yet!)
		this.model.on('change:items', function() {
			that.renderItems();
		});
	},

	// Semi-dynamic rendering -
	// Must wait to add items to DOM for when the list 
	// is first added to the model.
	renderItems: function() {
		var that = this,
			nItems = 0,
			nRows = 0,
			nPerRow = 0,
			$rowDiv = null,
			$icons = null;

		this.$el.find('.icons').html();

		nItems = this.model.get('items').length;
		nRows = Math.floor(Math.sqrt(nItems));
		nPerRow = Math.ceil(nItems/nRows);

		$icons = this.$el.find('.icons');

		_.each(this.model.get('items'), function(x, i, li) {
			if(i % nPerRow == 0) {
				$rowDiv = $(
					'<div class="row-fluid">' + 
						'<div class="span12">' +
						'</div>' +
					'</div>'
				);
				$icons.append($rowDiv);
				$rowDiv = $rowDiv.find('.span12');
			}
			$rowDiv.append(x.view.$el);
			x.view.render();
		});
	},
});

/* ======================================================== *\
 *					FORM STEP SCRIPTING						*
 * ======================================================== */

var FormStepView = StepView.extend({
	className: 'stepView formStepView',
	events: {
		'keypress input': 'supressEnter',
	},

	// XXX: model must be set
	initialize: function() {
	},

	submit: function() {
		// Open a modal 'Thanks' msg for about
		// 5 seconds then redirect to main page
		return false;
	},

	render: function() {
		this.$el.show();
	},

	// Turn <enter> into <tab> per Travis' request
	supressEnter: function(ev) {
		var els = null,
			i = 0,
			j = 0;
		if(ev.keyCode != 13) {
			return true;
		}
		els = $(ev.target).parents('form')
					 .eq(0)
					 .find('input');
					 //.find('input, button');
		i = els.index(ev.target);
		j = (i+1) % els.length;
		try {
			els[j].focus();
			els[j].select();
		}
		catch(e) {
		}
		return false;
	},

});

var FormOneStepView = FormStepView.extend({
	radio: null, 
	submitButton: null,

	// XXX: model must be set
	initialize: function() {
		var that = this;
		FormStepView.prototype.initialize.apply(this, arguments);

		// FIXME: Poor form to create these here
		this.radio = new RadioYesNo(), // FIXME
 		this.submitButton = new SubmitOrNext(), // FIXME

		// Already in the page. Excise it.
		this.$el = $('#form1').detach()
				.addClass(this.className);
				
		// Static rendering
		this.$el.find('.name')
				.html(this.model.get('title'));

		this.$el.find('.radio-attach')
				.append(this.radio.$el);

		window.form.on('change:email', function() { 
			that.syncEmail(); 
		});

		window.form.on('change:name', function() { 
			that.syncName(); 
		});

		window.form.on('clear', function() {
			that.resetForm();
		});

		window.form.on('change:stage1_filled', function() {
			that.radio.render();
			that.submitButton.render();
		});

		window.form.on('change:stage2', function() {
			that.render();
		});

		this.eventBind();
	},

	// Form Events must sadly be rebound each time 
	// jQuery redisplays the $el
	// TODO: Can these go in the events hash?
	eventBind: function() {
		var that = this;

		// Prevent double submission
		// Actually, may need to reapply to different event too
		// depending on stage2 state...
		this.$el.off('submit');

		if(window.form.get('stage2')) {
			this.$el.on('submit', function(ev) { 
				ev.preventDefault();
				return window.app.next();
			});
		}
		else {
			this.$el.on('submit', function(ev) { 
				ev.preventDefault();
				return that.submit(); 
			});
		}

		this.$el.find('#email1').change(function() {
			window.form.set('email', $(this).val());
		});

		this.$el.find('#name1').change(function() {
			window.form.set('name', $(this).val());
		});
	},

	// If email on one form changes, sync it.
	syncEmail: function() {
		var $email = this.$el.find('#email1'),
			em = window.form.get('email');
		if($email.val() != em) {
			$email.val(em);
			return false;
		}
	},

	// If name on one form changes, sync it.
	syncName: function() {
		var $name = this.$el.find('#name1'),
			nm = window.form.get('name');
		if($name.val() != nm) {
			$name.val(nm);
			return false;
		}
	},

	checkFilled: function() {
		var $email = this.$el.find('#email1'),
			em = window.form.get('email'),
			$name = this.$el.find('#name1'),
			nm = window.form.get('name');

	},

	resetForm: function() {
		this.$el.find('input').each(function() {
			$(this).val('');
		});
		this.radio.reset();
		this.submitButton.render();
	},

	submit: function() {
		window.form.set('items', window.itemList.addedString());
		window.form.upload(null, null);

		// Open a modal 'Thanks' msg for about
		// 5 seconds then redirect to main page
		window.thanks = new ThanksView();
		window.thanks.show();
		return false;
	},

	render: function() {
		this.$el.show();
		this.submitButton.render();
		this.eventBind();
	},
});


var FormTwoStepView = FormStepView.extend({
	// XXX: model must be set
	initialize: function() {
		var that = this;
		FormStepView.prototype.initialize.apply(this, arguments);

		// FIXME: Needed? 
		// this.$el.attr('id', this.cid);

		// Already in the page. Excise it.
		this.$el = $('#form2').detach()
				.addClass(this.className);

		// Static rendering
		this.$el.find('.name')
				.html(this.model.get('title'));
	
		window.form.on('change:email', function() { 
			that.syncEmail(); 
		});
	
		window.form.on('change:name', function() { 
			that.syncName(); 
		});

		window.form.on('clear', function() {
			that.resetForm();
		});

		this.eventBind();
	},

	// Form Events must sadly be rebound each time 
	// jQuery redisplays the $el
	// TODO: Can these go in the events hash?
	eventBind: function() {
		var that = this;

		// Prevent double submission
		this.$el.off('submit')
				.on('submit', function(ev) { 
					ev.preventDefault();
					return that.submit(); 
				});

		this.$el.find('#email2').change(function() {
			window.form.set('email', $(this).val());
			window.form.set('stage2', true);
		});
		this.$el.find('#school').change(function() {
			window.form.set('school', $(this).val());
			window.form.set('stage2', true);
		});
		this.$el.find('#name2').change(function() {
			window.form.set('name', $(this).val());
			window.form.set('stage2', true);
		});
		this.$el.find('#position').change(function() {
			window.form.set('position', $(this).val());
			window.form.set('stage2', true);
		});
		this.$el.find('#phone').change(function() {
			window.form.set('phone', $(this).val());
			window.form.set('stage2', true);
		});
		this.$el.find('#numKits').change(function() {
			window.form.set('numKits', $(this).val());
			window.form.set('stage2', true);
		});
		this.$el.find('#when').change(function() {
			window.form.set('when', $(this).val());
			window.form.set('stage2', true);
		});
	},

	// If email on one form changes, sync it.
	syncEmail: function() {
		var $email = this.$el.find('#email2'),
			em = window.form.get('email');
		if($email.val() != em) {
			$email.val(em);
			return false;
		}
	},

	// If name on one form changes, sync it.
	syncName: function() {
		var $name = this.$el.find('#name2'),
			nm = window.form.get('name');
		if($name.val() != nm) {
			$name.val(nm);
			return false;
		}
	},

	resetForm: function() {
		this.$el.find('input').each(function() {
			$(this).val('');
		});
	},

	submit: function() {
		window.form.set('items', window.itemList.addedString());
		window.form.upload(null, null);

		// Open a modal 'Thanks' msg for about
		// 5 seconds then redirect to main page
		window.thanks = new ThanksView();
		window.thanks.show();
		return false;
	},

	render: function() {
		this.$el.show();
		this.eventBind();
	},
});


/* ======================================================== *\
 *						ITEMS IN STEPS 						*
 * ======================================================== */

// TODO: Rename thingyView
// TODO: Create ItemStepView to script Items

var ItemView = Backbone.View.extend({
	model: null,

	tagName: 'div',
	className: 'thingyView',

	events: {
		'click ': 'toggleCart',
	},

	// XXX: model must be set
	initialize: function() {
		// Static render.
		// TODO: Remove 'thingy' class
		this.$el.html('<div class="thingy icon">' +
			'<div class="iconContainer">' +
			'<div class="iconInner"	style="background-image: ' +
				'url(\'/img/logos/ischool.png\')"></div>' +
			'</div>' +
			'<p>Icon Text</p>' +
			'</div>');

		this.$el.find('p').text(this.model.get('title'));
		this.$el.find('.iconInner').css({
			'background-image': 'url('+this.model.get('img')+')'
		});
		this.model.on('change:added', this.render, this);
	},

	render: function() {
		var btn = null;

		// TODO: COMMENTED OUT
		if(this.model.get('added')) {
			this.$el.addClass('added');
		}
		else {
			this.$el.removeClass('added');
		}

		// FIXME -- why do I have to do this!?
		this.delegateEvents();
	},

	toggleCart: function() {
		this.model.set('added', !this.model.get('added'));
	},

	show: function() {
		// XXX: show()/hide() mess up re-rendering in this case.
		this.$el.css('display', 'inline-block');
	},

	hide: function() {
		// XXX: show()/hide() mess up re-rendering in this case.
		this.$el.css('display', 'none');
	},
});


/* ======================================================== *\
 *					MODAL POPUP SCRIPTING					*
 * ======================================================== */

var ThanksView = Backbone.View.extend({
	model: null,

	tagName: 'div',
	className: 'thanksView avgrund-popup',

	initialize: function() {
		// Static rendering
		$('body').prepend(this.$el);
		this.$el.attr('id', 'thanks-'+this.cid)
			.html(
				'<h2>Thanks for your info!</h2>'
			);
	},

	render: function() {
	},

	restart: function() {
		if(window.app.isAnimating && this.tries > 0) {
			this.tries--;
			setTimeout(this.restart, 250);
			return;
		}

		this.hide(); 
		window.app.restart();
	},

	show: function() {
		var that = this;
		this.render();
		this.$el.show();
		Avgrund.show('#thanks-'+this.cid);
		setTimeout(function() { 
			that.restart();
		}, 1800);
	},

	hide: function() {
		this.$el.hide();
		Avgrund.hide();
	},
});


/* ======================================================== *\
 *			  BUTTON AND MISC ELEMENT SCRIPTING				*
 * ======================================================== */

var NavButton = Backbone.View.extend({
	// State:
	// enabled | disabled | finished
	state: 'enabled',

	imgEnabled: null,
	imgDisabled: null,
	imgFinished: null,

	callback: null,

	events: {
		'click': 'onclick',
	},

	initialize: function(args) {
		this.imgEnabled = args.imgEnabled;
		this.imgDisabled = args.imgDisabled;
		this.callback = args.callback;
	},

	onclick: function() {
		this.callback();
	},

	render: function() {
		var src = '';
		var able = false;

		switch(this.state) {
			case 'enabled':
				src = this.imgEnabled;
				able = true;
				break;
			case 'finished':
				src = this.imgFinished;
				able = true;
				break;
			case 'disabled':
			default:
				src = this.imgDisabled;
				able = false;
		}

		if(able) {
			this.$el.removeClass('disabled');
			this.$el.removeAttr('disabled');
			this.$el.css('cursor', 'pointer');
		}
		else {
			this.$el.addClass('disabled');
			this.$el.attr('disabled', 'disabled');
			this.$el.css('cursor', 'default');
		}

		this.$el.find('img').attr('src', src);
	},

	enable: function() {
		this.state = 'enabled';
		this.render();
	},

	disable: function() {
		this.state = 'disabled';
		this.render();
	},

	finish: function() {
		this.state = 'finished';
		this.render();
	}
});

// TODO TODO: Make final submit button a superclass of this so
// that I can disable it if critical name & email info not filled.
var SubmitOrNext = Backbone.View.extend({
	id: 'form1_submit',
	NEXT: 'Next <i class="icon-forward"></i>',
	SUBMIT: 'Submit <i class="icon-thumbs-up"></i>',

	initialize: function() {
		this.$el = $('#'+this.id); // FIXME: inconsist to not detach

		// FIXME UGLY AND GLOBALS, but too sleepy to write nice
		var that = this;
		window.form.on('change:stage2', function() { 
			that.render(); 
		});
		window.form.on('change:necessary_info', function() { 
			that.render(); 
		});
		window.form.on('change:yesno_clicked', function() { 
			that.render(); 
		});
	},

	render: function() {
		// Check model to see if incomplete 
		if(!window.form.get('necessary_info') || 
		   !window.form.get('yesno_clicked')) {
				this.$el.attr('disabled', 'disabled');
				this.$el.removeClass('btn-primary');
				this.$el.addClass('disabled');
				this.$el.find('i').removeClass('icon-white');
				return;
		}

		// Check model to update button text
		if(window.form.get('stage2')) {
			this.$el.html(this.NEXT);
		}
		else {
			this.$el.html(this.SUBMIT);
		}

		this.$el.removeAttr('disabled');
		this.$el.removeClass('disabled');
		this.$el.addClass('btn-primary');
		this.$el.find('i').addClass('icon-white');
	},
});

var RadioYesNo = Backbone.View.extend({
	id: 'radio-yesno',
	events: {
		'click button[value=yes]': 'clickYes',
		'click button[value=no]': 'clickNo',
	},
	initialize: function() {
		this.$el = $('#'+this.id).show().detach();
		this.$el.data('wasClicked', false); // 3rd state wrt yes|no
	},
	clickYes: function(ev) {
		window.form.set('yesno_clicked', true);
		window.form.set('yes_clicked', true);
		window.form.set('stage2', true);
		this.$el.data('wasClicked', true);

		this.$el.find('button[value=yes]').addClass('btn-success');
		this.$el.find('button[value=yes]')
				.removeClass('btn-inverse');
		this.$el.find('button[value=no]').addClass('btn-inverse');
		this.$el.find('button[value=no]').removeClass('btn-danger');
	},
	clickNo: function(ev) {
		window.form.set('yesno_clicked', true);
		window.form.set('yes_clicked', false);
		window.form.set('stage2', false);
		this.$el.data('wasClicked', true);

		this.$el.find('button[value=yes]')
				.removeClass('btn-success');
		this.$el.find('button[value=yes]').addClass('btn-inverse');
		this.$el.find('button[value=no]').removeClass('btn-inverse');
		this.$el.find('button[value=no]').addClass('btn-danger');
	},
	reset: function() {
		this.$el.data('wasClicked', false);
		window.form.set('yesno_clicked', false);
		window.form.set('yes_clicked', false);
		window.form.set('stage2', false);

		// Note: 'active' is bootstrap.js's managed, depressed state
		this.$el.find('button[value=yes]')
				.removeClass('active btn-success');
		this.$el.find('button[value=no]')
				.removeClass('active btn-danger');
		this.$el.find('button[value=yes]').addClass('btn-inverse');
		this.$el.find('button[value=no]').addClass('btn-inverse');
	},
});

