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


/* ======================================================== *\
 *					FORM STEP SCRIPTING						*
 * ======================================================== */

var FormStepView = StepView.extend({
	model: null,
	className: 'stepView formStepView',

	// XXX: model must be set
	initialize: function() {
	},

	submit: function() {
		// TODO: Redirect. 
		// Perhaps open a modal 'Thanks' msg for about
		// 5 seconds then redirect to main page
		return false;
	},

	render: function() {
		this.$el.show();
	},
});

// TODO TODO: Make final submit button a superclass of this so
// that I can disable it if critical name & email info not filled.
var SubmitOrNext = Backbone.View.extend({
	id: 'form1_submit',
	NEXT: 'Next <i class="icon-forward"></i>',
	SUBMIT: 'Submit <i class="icon-thumbs-up"></i>',

	initialize: function() {
		this.$el = $('#'+this.id); // FIXME: inconsistent to not detach

		// FIXME UGLY AND GLOBALS, but too sleepy to write nice
		var that = this;
		window.form.on('change:stage2', function() { that.render(); });
		window.form.on('change:necessary_info', function() { that.render(); });
		window.form.on('change:yesno_clicked', function() { that.render(); });
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
		this.$el.data('wasClicked', false); // 3rd state aside from yes|no
	},
	clickYes: function(ev) {
		window.form.set('yesno_clicked', true);
		window.form.set('stage2', true);
		this.$el.data('wasClicked', true);

		this.$el.find('button[value=yes]').addClass('btn-success');
		this.$el.find('button[value=yes]').removeClass('btn-inverse');
		this.$el.find('button[value=no]').addClass('btn-inverse');
		this.$el.find('button[value=no]').removeClass('btn-danger');
	},
	clickNo: function(ev) {
		window.form.set('yesno_clicked', true);
		window.form.set('stage2', false);
		this.$el.data('wasClicked', true);

		this.$el.find('button[value=yes]').removeClass('btn-success');
		this.$el.find('button[value=yes]').addClass('btn-inverse');
		this.$el.find('button[value=no]').removeClass('btn-inverse');
		this.$el.find('button[value=no]').addClass('btn-danger');
	},
	reset: function() {
		this.$el.data('wasClicked', false);
		window.form.set('yesno_clicked', false);
		window.form.set('stage2', false);

		// Note: 'active' is bootstrap.js's managed, depressed state
		this.$el.find('button[value=yes]').removeClass('active btn-success');
		this.$el.find('button[value=no]').removeClass('active btn-danger');
		this.$el.find('button[value=yes]').addClass('btn-inverse');
		this.$el.find('button[value=no]').addClass('btn-inverse');
	},
});

var FormOneStepView = FormStepView.extend({
	model: null,
	className: 'stepView formStepView',
	radio: null, 
	submitButton: null,

	// XXX: model must be set
	initialize: function() {
		var that = this;

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

		// TODO: Redirect. 
		// Perhaps open a modal 'Thanks' msg for about
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
	model: null,
	className: 'stepView formStepView',

	// XXX: model must be set
	initialize: function() {
		var that = this;

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

		// TODO: Redirect. 
		// Perhaps open a modal 'Thanks' msg for about
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

	placeholder: 'http://placehold.it/80x80',

	placeholder1: 'http://placehold.it/80x80/dd00dd/ffffff',
	placeholder2: 'http://placehold.it/125x125/dd00dd/ffffff',
	placeholder3: 'http://placehold.it/175x175/dd00dd/ffffff',
	placeholder4: 'http://placehold.it/200x200/dd00dd/ffffff',
	placeholder5: 'http://placehold.it/250x250/dd00dd/ffffff',

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
				/*'<img src="' + 
					this.placeholder1 + '" class="size1">' +
				'<img src="' + 
					this.placeholder2 + '" class="size2">' +
				'<img src="' + 
					this.placeholder3 + '" class="size3">' +
				'<img src="' + 
					this.placeholder4 + '" class="size4">' +
				'<img src="' + 
					this.placeholder5 + '" class="size5">' +*/
				
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

		/*src = this.placeholder; // TODO

		this.$el.find('img').attr('src', src);*/

		// FIXME -- why do I have to do this!?
		this.delegateEvents();
	},

	toggleCart: function() {
		this.model.set('added', !this.model.get('added'));
	},

	launchModal: function() {
		this.model.modalView.show();
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

var ModalView = Backbone.View.extend({
	model: null,

	tagName: 'div',
	className: 'modalView avgrund-popup',

	events: {
		'click .addCart': 'addCart',
		'click .removeCart': 'removeCart',
		'click .closeCart': 'hide',
	},

	initialize: function() {
		// Static rendering
		$('body').prepend(this.$el);
		this.$el.attr('id', 'modal-'+this.model.cid)
			.html(
				'<h2>' +
					this.model.get('title')+
				'</h2>' +
				'<p>' +
					this.model.get('description') +
				'</p>' +
				'<div class="modal-buttons row-fluid"></div>'
			);

	},

	render: function() {
		var btn = '<div class="modal-buttons-left">';
		if(this.model.get('added')) {
			btn += '<button class="btn btn-primary ' +
					'removeCart">Remove</button>';
		}
		else {
			btn += '<button class="btn btn-primary ' +
					'addCart">Add</button>';
		}
		this.$el.find('.modal-buttons').html(
				btn + 
				'</div>' +
				'<div class="modal-buttons-right">' +
					'<button class="btn btn-primary ' +
						'closeCart">Close</button>' +
				'</div>' +
            	'<div class="clearfix"></div>'
			);
	},

	show: function() {
		this.render();
		this.$el.show();
		Avgrund.show('#modal-'+this.model.cid);
	},

	addCart: function() {
		this.model.set('added', true);
		this.hide();
	},

	removeCart: function() {
		this.model.set('added', false);
		this.hide();
	},

	hide: function() {
		this.$el.hide();
		Avgrund.hide();
	},
});

// TODO: Convert to ModalView subclass
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
 *					BUTTON ELEMENT SCRIPTING				*
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


/* ======================================================== *\
 *					MAIN APP SCRIPTING						*
 * ======================================================== */

var AppView = Backbone.View.extend({

	// Animation used to switch stages.
	// Options: fade | none | ...?
	animation: 'fade',

	steps: null,
	curStep: null,

	nextButton: null,
	backButton: null,
	restartButton: null,

	tagName: 'div',
	id: 'AppView',

	// XXX: Lock on animation / events
	isAnimating: false,

	initialize: function(args)
	{
		var that = this;

		$(args.bind).html(this.$el);

		var itemlist = new ItemList();
		var steps = new StepList();

		window.itemList = itemlist; // TODO: Higher visibility
		window.form = new Form(); // TODO: Higher visibility

		this.backButton = new NavButton({
			el: '#nav-back',
			imgEnabled: 'img/back.png',
			imgDisabled: 'img/back-disabled.png',
			callback: function() { that.prev(); },
		});
		
		this.nextButton = new NavButton({
			el: '#nav-next',
			imgEnabled: 'img/next.png',
			imgDisabled: 'img/next-disabled.png',
			callback: function() { that.next(); },
		});

		this.restartButton = new NavButton({
			el: '#nav-restart',
			imgEnabled: 'img/restart.png',
			callback: function() { that.restart(); },
		});
	
		// FIXME: This is horrible code.
		var makeStep = function(title, items) {
			var step = new ItemStep({
				title: title,
				items: [],
			});

			var sv = new StepView({
				model: step,
			});

			var ths = []; // new ItemList();

			step.view = sv; // FIXME: Wrong?
			steps.push(step);

			for(var i = 0; i < items.length; i++) {
				var it = items[i];
				var t = new Item({
					name: it.name,
					title: it.title,
					description: it.descr,
					img: it.img,
				});
				var tv = new ItemView({
					model: t,
				});
				// XXX: No modal views.
				//var mv = new ModalView({
				//		model: t,
				//});

				t.view = tv;
				//t.modalView = mv; // XXX: No modal views
			
				itemlist.push(t);
				ths.push(t);
			}
			step.set('items', ths);
			return step;
		}
		
		// icon-ok
		// icon-remove

		makeStep('Select your platform.', [
			{
				name: 'ios',
				title: 'iOS',
				descr: 'iOS is the foundation of iPad, and iPod touch devices and fits perfectly in the education space. Unsurpassed content creation ability, mixed with simplicity and stability, make iOS devices a common choice for mobile learning.',
				img: 'img/logos/apple.png',
			}, 
			{
				name: 'android',
				title: 'Android',
				descr: 'A customizable, open source OS that is run on a variety of education ready devices such as Galaxy Tab series, and the Nexus series. Android OS allows for versatile and economical choices to fit any classroom.',
				img: 'img/logos/android.png',
			}, 
			{
				name: 'windows',
				title: 'Windows',
				descr: 'Windows 8 OS is comfortable and sleek and works on Microsoft Surface tablet. Microsoft office and USB input make PC to tablet conversions seamless.',
				img: 'img/logos/windows.png',
			}, 
		]);

		makeStep('Choose your solution.', [
			{
				name: 'pd',
				title: 'Professional Development',
				descr: 'Learn how to use your new mobile toolkits effectively with exciting and interactive professional development for teachers, students, and administrators. Content comes from the innovative minds at iSchool Initiative; a not-for-profit organization.',
				img: 'img/logos/ischool.png',
			},
			{
				name: 'tech',
				title: 'Tech Support',
				descr: 'Resolve technical issues immediately without long holds with tech support. isi simplify provides live, on the spot, education specific support for students and teachers.',
				img: 'img/logos/isis.png',
			},
			{
				name: 'management',
				title: 'Device Management',
				descr: 'Mobile device management allows for a higher level of control in regards to content and application distribution, as well as security for multiple device operating systems and is perfect for BYOT. Airwatch has the infrastructure to handle both large and small deployments including the massive iPad initiative at McAllen ISD. They also offer additional solutions designed to fit the education space.',
				img: 'img/logos/airwatch.png',
			}, 
			{
				name: 'assessment',
				title: 'Online Assessment',
				descr: 'Excelegrade makes K-12 classroom assessments digital by replacing paper-based tests with assessments on tablets, smart phones, and laptops. By accommodating both free response and multiple choice questions while capturing students\' work, they allow teachers and schools to capture more data than ever before.',
				img: 'img/logos/excelegrade.png',
			},
			{
				name: 'cases',
				title: 'Cases',
				descr: 'The current leader in protective casing, Otter Box\'s quality products are designed to fit almost any mobile device. They are your first, best and cheapest insurance policy.',
				img: 'img/logos/otterbox.png',
			}, 
			{
				name: 'social',
				title: 'Social Learning Platform',
				img: 'img/logos/edmodo.png',
			}, 
			{
				name: 'texting',
				title: 'Student-Teacher Texting',
				img: 'img/logos/remind101.png',
			}, 
			{
				name: 'resources',
				title: 'STEM Materials',
				img: 'img/logos/definedstem.png',
			}, 

		]);


		///////// FORM ONE
		
		// Last Stage -- form.
		// TODO: new FormStage
		var s = new FormStep({
			title: 'Let\'s get in touch.',
		});
		var sv = new FormOneStepView({
			model: s,
		});
		
		s.view = sv;
		steps.push(s);


		///////// FORM TWO
	
		var s2 = new FormStep({
			title: 'Let us help with your rollout.',
		});
		var sv2 = new FormTwoStepView({
			model: s2,
		});
		
		s2.view = sv2;
		steps.push(s2);


		this.items = itemlist;
		this.steps = steps;

		this.curStepView = this.steps.current().view;

		// Setup static HTML (don't re-render)

		this.render();

		// EVENTS !
		// EVENTS EVENTS !!
		// EVENTS EVENTS EVENTS !!!
		// EVENTS EVENTS EVENTS EVENTS !!!!
		// EVENTS EVENTS EVENTS !!!
		// EVENTS EVENTS !!
		// EVENTS !

		// Hashchange events that haven't been handled will 
		// redirect us to the appropriate stage.
		// TODO: Make nice with keys instead of numbers.
		$(window).on('hashchange', function() {
			var m = null,
				num = null;
			if(!window.location.hash) {
				return;
			}
			m = window.location.hash.match(/^#?(\d+)/)
			if(!m || m.length < 2) {
				return;
			}
			num = parseInt(m[1]);
			if(num == that.steps.pos()) {
				return;
			}
			if(that.isAnimating) {
				return;
			}
			that.isAnimating = true;
			that.steps.goto(num);
		});

		this.steps.on('steps:change', function() { 
			that.transition(); // Only call; does not need lock
		}, this);

		window.form.on('change:stage2', function() {
			that.render();
		});

		// Force hashchange if hash exists when page is
		// initially loaded (ie. a direct HTTP GET)
		if(window.location.hash) {
			var hash = window.location.hash;
			window.location.hash = -1;
			window.location.hash = hash;
		}
	},

	// Render the current stage
	render: function() {
		this.curStepView.render();

		if(this.steps.pos() == 0) {
			this.backButton.disable();
		}
		else {
			this.backButton.enable();
		}

		if(this.steps.pos() == this.steps.end() ||
		   (this.steps.pos() == this.steps.end()-1 && 
			!window.form.get('stage2'))) {
				this.nextButton.disable();
		}
		else {
			this.nextButton.enable();
		}

		this.$el.append(this.curStepView.$el);
	},

	restart: function() {
		if(this.isAnimating) {
			return;
		}
		this.isAnimating = true;

		// Clear selected items
		this.items.each(function(item) {
			item.set('added', false);
		});

		// Clear form model!
		window.form.doClear();

		// Navigate to start...
		this.steps.goto(0);
		window.location.hash = this.steps.pos();
		window.location.hash = ''; // Harsher...

		// TODO: RESET FORM ENTIRELY.
		// TODO: Reset form DOM elegantly!
	},

	next: function() {
		if(this.isAnimating) {
			return;
		}
		this.isAnimating = true;

		this.steps.next();
		window.location.hash = this.steps.pos();
	},

	prev: function() {
		if(this.isAnimating) {
			return;
		}
		this.isAnimating = true;

		this.steps.prev();
		window.location.hash = this.steps.pos();
	},

	// XXX: Loc determines 'direction' 
	// TODO: Use pos() and last to determine direction...
	transition: function()
	{
		var loc = 8000;
		var speed = 800;
		var that = this;
	
		// Be really careful with this flag...
		if(!this.isAnimating) {
			this.isAnimating = true;
		}

		// The incoming step height won't exist on the first render
		var height = this.steps.current().view.$el.height();
		if(!height) {
			height = $('#AppView').height();
		}

		// XXX XXX -- probable danger point -- XXX XXX
		//
		// 					height:
		// IF the height gets set by unloaded images,
		// entire region might be unviewable. 
		// Set in CSS!
		// 					width: 
		// Fixes ugly reflowing during each step of the 
		// animation due to dynamic width during the 
		// animation.
		//
	
		$('#AppView').css({
			height: height,
			maxHeight: height,
			width: $('#AppView').width(),
		});

		this.curStepView.fadeOut(200, function() {
			that.curStepView = that.steps.current().view;

			$('#AppView').css({
				'margin-left': loc + 'px',
				'overflow': 'hidden',
				'visibility': 'visible',
			});

			that.render();

			// Slide animation
			$('#AppView').animate({
				marginLeft: '0px',
				visibility: 'visible',
			}, speed, 'easeOutExpo', function() {
				// Prevent animations from queueing up 
				// and stalling. Typically occurs when 
				// 'rapidly' paging through slides
				$(this).stop(true); 

				// XXX
				// Clear height fixation once animation 
				// finishes. Allows div to reflow again.
				$('#AppView').css({
					height: '',
					maxHeight: '',
					width: '',
				}); 

				// Sometimes the animation still queues up and
				// two children show. This is a hack attempt
				// to fix such events if they happen. 
				$('#AppView').children().hide();
				that.curStepView.show();

				// Clear flag.
				that.isAnimating = false;
			});
		});
	}, 
});

