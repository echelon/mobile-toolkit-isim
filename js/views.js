// ISI Mobile Marketing App
// We're going to use this to collect sales leads
// Copyright (c) 2013 Brandon Thomas 


/******************* THINGY VIEW *****************/

var ItemView = Backbone.View.extend({
	model: null,

	tagName: 'div',
	className: 'thingyView',

	events: {
		'click img': 'launchModal',
		'click button': 'toggleCart',
	},

	// XXX: model must be set
	initialize: function() {
		// Static render.
		this.$el.html('<div class="thingy">' +
				'<img src="' + 
					this.model.get('img') + 
				'">' +
				'<div class="btns">'+ 
					'<button class="btn btn-primary addCart ">' +
					'Add ' +
					this.model.get('title') +
					'</button>' +
				'</div></div>');

		this.model.on('change:added', this.render, this);
	},

	render: function() {
		var src = null,
			btn = null,
			text = '';

		if(this.model.get('added')) {
			src = this.model.get('imgAdded');
			text = 'Remove ' + this.model.get('title');
		}
		else {
			src = this.model.get('img');
			text = 'Add ' + this.model.get('title');
		}

		this.$el.find('img').attr('src', src);
		this.$el.find('button').html(text);

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


/******************* MODAL VIEW *****************/



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

/******************* STEP VIEW *********************/

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
		var that = this;
		this.$el.find('.icons').html();
		_.each(this.model.get('items'), function(x) {
			that.$el.find('.icons').append(x.view.$el);
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


var FormOneStepView = FormStepView.extend({
	model: null,
	className: 'stepView formStepView',

	// XXX: model must be set
	initialize: function() {
		var that = this;

		// FIXME: Needed? 
		// this.$el.attr('id', this.cid);

		// Already in the page. Excise it.
		this.$el = $('#form1').detach()
				.addClass(this.className);
				
		// Static rendering
		this.$el.find('.name')
				.html(this.model.get('title'));

		window.form.on('change:email', function() { 
			that.syncEmail(); 
		});

		window.form.on('clear', function() {
			that.resetForm();
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

		this.$el.find('#enableMore').change(function() {
			window.form.set('stage2', 
				Boolean($(this).attr('checked'))
			);
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

	resetForm: function() {
		this.$el.find('input').each(function() {
			$(this).val('');
		});
		this.$el.find('#enableMore').removeAttr('checked');
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
		var text = '';
		this.$el.show();
		this.eventBind();

		if(window.form.get('stage2')) {
			text = 'Next <i class="icon-forward icon-white"></i>';
		}
		else {
			text = 'Submit <i class="icon-thumbs-up icon-white"></i>';
		}

		this.$el.find('button').html(text);
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
		this.$el.find('#name').change(function() {
			window.form.set('name', $(this).val());
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



/* ************************************************** */


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
					imgAdded: it.imgAdded,
				});
				var tv = new ItemView({
					model: t,
				});
				var mv = new ModalView({
					model: t,
				});

				t.view = tv;
				t.modalView = mv;
			
				itemlist.push(t);
				ths.push(t);
			}
			step.set('items', ths);
			return step;
		}

		makeStep('Select your platform.', [
			{
				name: 'ios',
				title: 'iOS',
				descr: 'iOS is the foundation of iPad, and iPod touch devices and fits perfectly in the education space. Unsurpassed content creation ability, mixed with simplicity and stability, make iOS devices a common choice for mobile learning.',
				img: 'img/items/apple-off.png',
				imgAdded: 'img/items/apple-on.png',
			}, 
			{
				name: 'android',
				title: 'Android',
				descr: 'A customizable, open source OS that is run on a variety of education ready devices such as Galaxy Tab series, and the Nexus series. Android OS allows for versatile and economical choices to fit any classroom.',
				img: 'img/items/android-off.png',
				imgAdded: 'img/items/android-on.png',
			}, 
			{
				name: 'windows',
				title: 'Windows',
				descr: 'Windows 8 OS is comfortable and sleek and works on Microsoft Surface tablet. Microsoft office and USB input make PC to tablet conversions seamless.',
				img: 'img/items/windows-off.png',
				imgAdded: 'img/items/windows-on.png',
			}, 
		]);

		makeStep('Choose your accessories.', [
			{
				name: 'cases',
				title: 'Cases',
				descr: 'The current leader in protective casing, Otter Box\'s quality products are designed to fit almost any mobile device. They are your first, best and cheapest insurance policy.',
				img: 'img/accessory/cases-off.png',
				imgAdded: 'img/accessory/cases-on.png',
			}, 
			{
				name: 'cloth',
				title: 'Microfiber Cloth',
				descr: 'Nobody likes a smudgy screen. Keep it clean while at the same time supporting iSchool Initiative and the movement for mobile learning.',
				img: 'img/accessory/mf-cloth-off.png',
				imgAdded: 'img/accessory/mf-cloth-on.png',
			},
			{
				name: 'stylus',
				title: 'Styluses',
				descr: 'Using a stylus helps students in many areas including note taking, art, math and content creation. Make every detail perfect.',
				img: 'img/accessory/stylus-off.png',
				imgAdded: 'img/accessory/stylus-on.png',
			}
		]);

		makeStep('Choose your services.', [
			{
				name: 'pd',
				title: 'Professional Development',
				descr: 'Learn how to use your new mobile toolkits effectively with exciting and interactive professional development for teachers, students, and administrators. Content comes from the innovative minds at iSchool Initiative; a not-for-profit organization.',
				img: 'img/services/professional-development-off.png',
				imgAdded: 
					 'img/services/professional-development-on.png',
			},
			{
				name: 'tech',
				title: 'Tech Support',
				descr: 'Resolve technical issues immediately without long holds with tech support. isi simplify provides live, on the spot, education specific support for students and teachers.',
				img: 'img/services/tech-support-off.png',
				imgAdded: 'img/services/tech-support-on.png',
			},
			{
				name: 'management',
				title: 'Management',
				descr: 'Mobile device management allows for a higher level of control in regards to content and application distribution, as well as security for multiple device operating systems and is perfect for BYOT. Airwatch has the infrastructure to handle both large and small deployments including the massive iPad initiative at McAllen ISD. They also offer additional solutions designed to fit the education space.',
				img: 'img/services/device-management-off.png',
				imgAdded: 'img/services/device-management-on.png',
			}, 
			{
				name: 'assessment',
				title: 'Online Assessment',
				descr: 'Excelegrade makes K-12 classroom assessments digital by replacing paper-based tests with assessments on tablets, smart phones, and laptops. By accommodating both free response and multiple choice questions while capturing students\' work, they allow teachers and schools to capture more data than ever before.',
				img: 'img/services/online-assessment-off.png',
				imgAdded: 'img/services/online-assessment-on.png',
			}

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
