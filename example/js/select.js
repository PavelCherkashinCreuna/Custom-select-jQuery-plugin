'use strict'
;(function ($) {
	var Select = {
		init: function ( options , elem , selector ) {
			this.selector = selector;
			this.selectMarkup = '<div class="select"><div class="select-holder"><a class="select-inner" href="#"></a></div><ul class="select-drop dropdown-menu"></ul></div>';
			this.optionMarkup = '<li class="option-item" data-value={{value}}><a href="#">{{title}}</a></li>';
			this.onSelect = options.onSelect;
			this.$container = $(elem);
			if (this.$container[0].nodeName.toLowerCase() === 'select') {
				this.replaceSelect(this.$container);
				this.isSelect = true;
			} else {
				this.getDOM();	
				this.setInitial();
			}
			this.attachEvents();
			this.callbackEvent = this.animationEvent();
			return this;
		},
		getDOM: function () {
			this.$elem = this.$container.find('.select-inner');
			this.$optionsContainer = this.$container.find('.select-drop');
			this.$options = this.$optionsContainer.find('.option-item');
		},
		animationEvent: function () {
			var t,
				el = document.createElement('fakeelement'),
				transitions = {
					'transition':'transitionend',
					'OTransition':'oTransitionEnd',
					'MozTransition':'transitionend',
					'WebkitTransition':'webkitTransitionEnd'
				}

			for(t in transitions){
				if( el.style[t] !== undefined ){
					return transitions[t];
				}
			}
		},
		openCallback: function (elem) {
			this.bindCloseEvents();
		},
		toggleState: function () {
			var that = this;
			if (that.$container.hasClass('select-opened')) {
				that.$container.removeClass('select-opened');
			} else {
				that.$container.addClass('select-opened');
				if (this.callbackEvent) {
					that.$optionsContainer[0].addEventListener(that.callbackEvent, function callback(event) {
						if (event.propertyName == 'opacity') {
							that.$optionsContainer[0].removeEventListener(that.callbackEvent, callback , false);
							that.openCallback();
						}
					}, false);
				} else {
					setTimeout(function (){
						that.openCallback();
					},0);
				}
				
			}
		},
		close: function ( event , forceClose ) {
			var elem = $(event.target);
			if ( forceClose || !elem.parents(this.selector).length ) {
					this.$container.removeClass('select-opened');
					this.unbindCloseEvents();
			}
		},
		update: function ( $item ) {
			this.$options.filter('.active')
						.removeClass('active');
			$item.addClass('active');
			this.$elem.text($item.text());
			this.$container.data($item.data());
			if (this.isSelect) {
				this.select.val($item.data('value'));
				this.select.trigger('change');
			}
		},
		setInitial: function () {
			var $selected = this.getSelectedElement();
			if ($selected.length) {
				this.update($selected);
			} else {
				this.update(this.$options.eq(0));
			}
		},
		unbindCloseEvents: function () {
			$(document).off('click.select');
			$(document).off('keyup.select');
			this.kbControlEvents(false);
		},
		bindCloseEvents: function ( event ) {
			var that = this,
				text = '';

			$(document).on('keyup.select' , function (e) {
				if (e.which == '27' || e.which == '9') {
					that.close( e , true );
				}
				// TODO: implement search
			});
			$(document).on('click.select', function (e) {
				that.close(e);
			});
			that.kbControlEvents(true);
		},
		kbControlEvents: function ( bind ) {
			var that = this;
			$(document).off('keydown.select-control');
			if (bind) {
				$(document).on('keydown.select-control' , function (e) {
					if (e.which == '40') {
						that.updateByKeyboard('next');
					} else if (e.which == '38' ) {
						that.updateByKeyboard('prev');
					} 
				});
			}
		},
		updateByKeyboard: function ( direction ) {
			var current = this.getSelectedElement(),
				elem;
			if ( direction == 'next' ) {
				elem = current.next();
			} else {
				elem = current.prev();
			}
			if (elem.length) {
				this.update(elem);
			}
		},
		attachEvents: function () {
			var that = this;
			this.$elem.on('click' , function (e) {
				e.preventDefault();
				that.toggleState();
			});
			this.$optionsContainer.on('click', '.option-item' , function (e) {
				e.preventDefault();
				if (!$(this).hasClass('active')) {
					that.update($(this));
					if (typeof that.onSelect === 'function') {
						that.onSelect(e,$(this));
					}
				}
				that.close({});
			});
			this.$elem.on('focusin' , function () {
				that.$elem.addClass('focused');
				that.kbControlEvents(true);
			});
			this.$elem.on('focusout' , function () {
				that.$elem.removeClass('focused');
				that.kbControlEvents(false);
			});
		},
		get: function () {
			return this.$container.data('value');
		},
		getSelectedElement: function () {
			return this.$options.filter('.active');
		},
		setValue: function ( value ) {
			var that = this,
				selectedElem = this.$options.removeClass('active')
									.filter(function () {
											return value == $(this).data('value');
									});
			that.update(selectedElem);
			return that;
		},
		updateUI: function ( array ) {
			var markup = this.optionMarkup,
				options = $();

			for (var i = 0, len = array.length; i < len; i++) {
				if(typeof array[i] == 'object') {
					var opt = markup.replace('{{value}}', array[i].value);
					opt = opt.replace('{{title}}', array[i].title);
					options = options.add($(opt).data(array[i]));
				} else {
					var opt = markup.replace('{{value}}', array[i]);
					opt = opt.replace('{{title}}', array[i]);
					options = options.add($(opt));
				}
			}
			this.$optionsContainer.empty()
								  .append(options);

			this.$options = this.$optionsContainer.find('.option-item');
			this.setInitial();
		},
		replaceSelect: function ( select ) {
			var options = select.find('option'),
				newMarkup = [],
				container;

			options.each(function () {
				var $this = $(this);
				newMarkup.push({
					value: $this.val(),
					title: $this.text()
				})
			});
			container = $(this.selectMarkup);
			select.hide()
				  .after(container);
			this.$container = container;
			this.getDOM();
			this.select = select;
			this.updateUI(newMarkup);
		}
	}
	if ( typeof Object.create !== 'function' ) {
		Object.create = function (o) {
			function F() {}
			F.prototype = o;
			return new F();
		};
	}
	$.plugin = function( name, object ) {
		$.fn[name] = function( options ) {
			var selector = $(this).selector;
			return this.each(function() {
				if ( ! $.data( this, name ) ) {
					$.data( this, name, Object.create(object).init( options, this , selector ) );
				}
			});
		};
	};
	$.plugin('select', Select );
}(jQuery));