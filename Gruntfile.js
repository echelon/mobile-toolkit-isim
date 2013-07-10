module.exports = function(grunt) {

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		meta: {
			copyright: 'Copyright (c) 2013 Brandon Thomas <bt@brand.io>',
		},

		less: {
			main: {
				src: 'css/design.less',
				dest: 'css/design.out.css',
				options: {
					yuicompress: true,
				},
			},
		},

		watch: {
			style: {
				files: ['css/*.less'],
				tasks: ['less'],
			},
		},
	});
 
	// TODO: Write these dependencies to package.json
	// TODO: Write jQuery, Backbone, etc. dependencies
	// TODO: Remove old dependencies that are no longer used
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-less');

	// TODO: jslint, build tests, etc.
	//grunt.registerTask('test', ['todo1', 'todo2']);
	//grunt.registerTask('default', ['neuter:production']);
	grunt.registerTask('default', ['less', 'watch']);
	grunt.registerTask('build', ['less']); // eg. for pre-commit hook
};
