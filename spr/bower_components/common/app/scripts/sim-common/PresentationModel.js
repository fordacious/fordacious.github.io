/*globals setInterval*/
define (function(require){

    var _ = require('underscore');
    var Backbone = require('backbone');

	/*
		Base PM class. Responible for redrawing the view.

		Note: The PM does redraw the view straight away.
		It sets a flag saying that it needs to be redrawn 
		and the interval will redraw it. 
	*/
	var PM = Backbone.Model.extend({
		view: null,
		invalid: false,

		/*
		* params
		*      view - the view related to this PM
		*/
		initialize: function(params)
		{	
			_.bindAll(this, 'invalidate', 'dataChange', 'updateDisplay');
			this.view = params.view;
			
			this.bind("change", this.invalidate);

			setInterval(this.dataChange, 20);
		},

		invalidate: function()
		{
			this.invalid = true;
		},

		dataChange: function()
		{
			//if view hasn't been set yet
			if(this.invalid && this.view !=null){
				this.updateDisplay();
				this.invalid = false;
			}
		},

		updateDisplay: function() 
		{
			if(this.view !=null){
				this.view.render();
			}
		}
	});

	return PM;
});