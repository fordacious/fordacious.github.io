/*global console, window */
define(function(require){

	var _ = require('underscore');
	var Backbone = require('backbone');
	var $ = require('jquery');

	require('jquery-ui-slider');
	require('touch-punch');

	var NumberFormatter = require('../helpers/NumberFormatter');

	//shim request animation frame with setTimeout fallback (for IE9)
	window.requestAnimFrame = (function(){
		return (
			window.requestAnimationFrame       ||
			window.webkitRequestAnimationFrame ||
			window.mozRequestAnimationFrame    ||
			window.oRequestAnimationFrame      ||
			window.msRequestAnimationFrame     ||
			function( callback ){
				window.setTimeout( callback , 1000 / 60 );
			}
		);
	})();

	/*
	 *   Template of the slider input view
	 */
	var template ='<div class="slider"></div>';

	var inputTemplate = '<input type="text"/>';

	var SliderInput = Backbone.Model.extend({
		defaults: {
			value: 0,

			enabled: true
		},

		initialize: function(){
			_.bindAll(this);
		},

		getValue: function(){
			return this.get('value');
		},

		setValue: function(value){
			this.set('value', value);
		},

		isEnabled: function(){
			return this.get('enabled');
		},

		setEnabled: function(v){
			this.set('enabled', v);
		}
	});


	// Calculates the position of the slider if the slider is a log
	var logposition = function (sliderView, value) {

		var minv = isFinite(Math.log(sliderView.min))? Math.log(sliderView.min) : 0;
		var maxv = Math.log(sliderView.max);

		// calculate adjustment factor
		var scale = (maxv-minv) / (sliderView.sliderMax-sliderView.sliderMin);

		var sliderPosition = (Math.log(value)-minv) / scale + sliderView.sliderMin;

		return sliderPosition;
	};

	var SliderInputView = Backbone.View.extend({

		className: "sliderInputView",

		initialize: function(params){
			_.bindAll(this);

			var self = this;

			this.log = params.log || false;
			this.min = params.min || 0;
			this.max = params.max || 100;
			this.step = params.step || 1;

			this.hideInput = params.hideInput || false;


			this.initialValue = params.initialValue || this.min;

			this.inputDomElement = params.inputDomElement || null;

			this.format = params.format || NumberFormatter.AstroFormat;

			this.$el.html(_.template(template));
			this.$input = $(inputTemplate);

			if(this.inputDomElement){
				this.inputDomElement.append(this.$input);
			}
			else{
				this.$el.append(this.$input);
			}

			this.$input.css('display', this.hideInput ? 'none' : 'auto');

			if(this.log){
				this.sliderMin = 0;
				this.sliderMax = 100;

				if(params.min <=0){
					throw new Error ('Slider min can not be less than or equal 0 in log mode');
				}

				//must set the initial value first
				this.$input.val(this.format(this.initialValue));

				//initial value now holds the position of the slider
				// in log mode.
				this.initialValue = logposition(this, this.initialValue);

			}
			else{
				this.sliderMin = this.min;
				this.sliderMax = this.max;

				this.$input.val(this.format(this.initialValue));
			}


			//activate the slider
			this.sliderElement = this.$('.slider');
			this.sliderElement.slider( {
				min: this.sliderMin,
				max: this.sliderMax,
				value: this.initialValue,
				step: this.step,
				start: this.startPropagation,
				stop: this.stopPropagation,
				slide: this.slide
			});

			var enabled = params.enabled !== undefined ? params.enabled : true;

			//creates the model
			this.model = new SliderInput({
				value: parseFloat(this.$input.val()),
				enabled: enabled
			});

			this.model.on('change:value', function(m, newValue){
				self.$input.val(self.format(newValue));
				if(self.log){
					newValue = logposition(self, newValue);
				}

				self.getSlider().slider("option", "value", newValue);
			});

			this.model.on('change:enabled', function(m, newValue){
				self.setEnabled(newValue);
			});

			/*
			 *   Listens to the keys typed in the text field.
			 *   Updates value onces Enter is pressed.
			 *   Only added valid numeric values to the text field.
			 */
			this.$input.keypress(function(event){

				var charCode = event.charCode || event.keyCode;

				//restrict characters
				// if 0, allows the character to pass through
				// its because charCode in FF is 0 for Enter, Space and Backspace
				if(charCode !== 0 && charCode !== 13 /*Enter*/&& charCode !== 69  /*E*/ && charCode !== 101 /*e*/ &&
					charCode !== 46 /*.*/ && (charCode < 48 /*0*/|| charCode >57 /*9*/) &&
					charCode !== 43 /*+*/ && charCode !== 45 /*-*/){
					return false;
				}

				if(event.which === 13){ // if enter
					self.commitValue();
				}

				return true;
			});

			this.$input.focusout(function(){
				self.commitValue();
			});

			/*
			 *   Listens for arrow keys and increments or decements the text
			 *   field. Which in turn updates the slider.
			 */
			this.$input.keydown(function(event){

				if(event.which === 38 || event.which === 40){

					var value = parseFloat(self.$input.val());

					//if the up arrow key was pressed
					if(event.which === 38){
						value += self.step;
					}
					else if(event.which === 40){
						value -= self.step;
					}

					value = self.sliderRangedValue(value);

					self.$input.val(self.format(value));
					self.model.set('value', parseFloat(self.format(value)));

					if(self.log){
						value = logposition(self, parseFloat(value));
					}

					self.getSlider().slider("option", "value", value);

				}
			});

			this.setEnabled(enabled);
		},

		startPropagation: function(){
			this.propagating = true;
			this.propagateValue();
		},

		stopPropagation: function(){
			this.propagating = false;
		},

		propagateValue: function(){
			this.model.set( 'value' , parseFloat( this.$input.val() ) );
			if( this.propagating ){ window.requestAnimFrame( $.proxy( this.propagateValue , this ) ); }
		},

		//when enter is press or focus is lost
		commitValue: function(){
			var value = parseFloat(this.$input.val());

			value = this.sliderRangedValue(value);

			this.model.set('value', value);
			this.$input.val(this.format(value));

			if(this.log){
				value = logposition(this, value);
			}

			this.getSlider().slider("option", "value", value);
		},

		/*
		 * @private
		 */
		slide : function(event, ui){

			var minv = isFinite(Math.log(this.min))? Math.log(this.min) : 0;
			var maxv = Math.log(this.max);

			// calculate adjustment factor
			var scale = (maxv-minv) / (this.sliderMax-this.sliderMin);

			var value = ui.value;

			if(this.log){
				value = Math.exp(minv + scale*(value-this.sliderMin));
			}

			this.$input.val(this.format(value));

			// if an event was given, then we've manually called
			//this function, needing the result
			if(!event){
				return value;
			}

		},

		getSlider: function(){
			return this.$('.ui-slider');
		},

		/*
		 *   Returns the value  of {value} withn the range of the slider.
		 *   I.e. if max is 100 and {value} is 101, this returns 100.
		 *
		 *   This also handles when in log mode
		 *   @param {Number}  value - value to set
		 *   @return {Number} the value of the slider
		 */
		sliderRangedValue: function(value){
			if(this.log){
				var logPosition = logposition(this, value);

				if(logPosition> 100){
					value = this.slide(null, {value:100});
				}
				else if(logPosition< 0){
					value = this.slide(null, {value:0});
				}
				else{
					value = this.slide(null, {value:logPosition});
				}
			}
			else{
				if(value> this.getSlider().slider("option", 'max')){
					value = this.getSlider().slider("option", 'max');
				}
				else if(value< this.getSlider().slider("option", 'min')){
					value = this.getSlider().slider("option", 'min');
				}
			}

			return value;
		},

		isEnabled: function(){
			return this.enabled;
		},

		setEnabled: function(v){
			this.model.setEnabled(v);

			this.getSlider().slider('option', "disabled", !this.model.isEnabled());
			this.$input.prop('disabled', !this.model.isEnabled());

			if(!v){
				this.$el.addClass('disabled');
			}
			else{
				this.$el.removeClass('disabled');
			}

		}

	});

	return SliderInputView;

});