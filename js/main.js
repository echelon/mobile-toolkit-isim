/* ======================================================== *\
 *					MAIN APP SCRIPTING						*
 * ======================================================== */

window.itemList = null; // TODO: rename window.items

var make_step_with_control = 
  function(stepModel, items, nextFn, prevFn) {
	var items = [],
		sv = new ItemStepView({
			model: stepModel,
		});

	stepModel.view = sv; // FIXME: Wrong?
	steps.push(step);

	for(var i = 0; i < items.length; i++) {
		var x = items[i];
		var it = new Item({
			name: x.name,
			title: x.title,
			description: x.descr,
			img: x.img,
		});
		var itv = new ItemView({
			model: t,
		});
				
		it.view = itv;
			
		window.itemList.push(it); // TODO rename window.items
		items.push(it);
	}

	step.set('items', items);
	return step;
};

var create_steps = function() {

	var step1 = new ItemStep({
		title: 'Choose Your Deployment',
		items: [],
	});

	var sv = new ItemStepView({
		model: step1,
	});

	var ths = []; // new ItemList();

	step.view = sv; // FIXME: Wrong?
	steps.push(step);
};

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

		window.steps = steps; // TODO: Higher visibility
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

			var sv = new ItemStepView({
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
				
				t.view = tv;
			
				itemlist.push(t);
				ths.push(t);
			}
			step.set('items', ths);
			return step;
		}
		
		// icon-ok
		// icon-remove




		makeStep('Deployment type.', [
			{
				name: 'byod',
				title: 'Bring Your Own Device',
				img: 'img/logos/byod_175.png',
			}, 
			{
				name: 'onetoone',
				title: 'One-to-One',
				// XXX: one_to_one_175.png padding is off
				img: 'img/logos/one_to_one.png', 
			}, 
		]);


		makeStep('Select your devices.', [
			{
				name: 'ios',
				title: 'iOS',
				img: 'img/logos/apple.png',
			}, 
			{
				name: 'android',
				title: 'Android',
				img: 'img/logos/android_175.png',
			}, 
			{
				name: 'windows',
				title: 'Windows',
				img: 'img/logos/windows.png',
			}, 
		]);

		makeStep('Build your mobile infrastructure.', [
			{
				name: 'ruckus',
				title: 'Wireless Solutions',
				img: 'img/logos/ruckus_175.png',
			},
			{
				name: 'spectrum',
				title: 'Carts & Lockers',
				img: 'img/logos/spectrum_industries_175.png',
			},
			{
				name: 'airwatch',
				title: 'Airwatch',
				img: 'img/logos/airwatch_175.png',
			}, 
			{
				name: 'otterbox',
				title: 'Casing',
				img: 'img/logos/otterbox_yellow_175.png',
			}, 
			{
				name: 'promethean_hw',
				title: 'Boards & Tables',
				img: 'img/logos/promethean_no_text_175.png',
			}, 
		]);

		makeStep('Choose your software & services.', [
			{
				name: 'ischoolpd',
				title: 'Professional Development',
				img: 'img/logos/ischool.png',
			},
			{
				name: 'nettext',
				title: 'Digital Textbooks',
				img: 'img/logos/nettexts_175.png',
			},
			{
				name: 'excelegrade',
				title: 'Online Assessment',
				img: 'img/logos/excelegrade_175.png',
			},
			{
				name: 'edmodo',
				title: 'Social Learning Platform',
				img: 'img/logos/edmodo_175.png',
			}, 
			{
				name: 'promethean_sw',
				title: 'Collaborative Software',
				img: 'img/logos/promethean_no_text_175.png',
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

		window.form.on('change:stage2', function() { that.render(); });
		window.form.on('change:yes_clicked', function() { that.render(); });
		window.form.on('change:necessary_info', function() { that.render(); });

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
			(!window.form.get('necessary_info') || 
			 !window.form.get('yes_clicked')))) {
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

