	require.config({
	paths: {
		jquery: "../vendor/bower/jquery/jquery",
		bootstrap: '../vendor/bower/bootstrap/dist/js/bootstrap',
		underscore: '../vendor/bower/underscore/underscore',
		backbone: '../vendor/bower/backbone/backbone',
		'd3-cloud': "../vendor/bower/d3-cloud/d3.layout.cloud"
	},
	shim: {
		backbone: {
			deps: [
				'jquery',
				'underscore'
			],
			exports: 'Backbone'
		},
		'd3-cloud': {
			deps: [
			'../vendor/bower/d3-cloud/lib/d3/d3'],
			exports: 'd3'
		},
	}
	});
	require(['main']);