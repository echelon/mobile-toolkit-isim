// Copyright Brandon Thomas 2012-2013
// http://brand.io
// https://github.com/echelon

// Submit form to Google Docs
var form = function() {
	var formkey = 'dEU4RjFZc2QwN2lfa1ZCeHowQ01qTWc6MQ';
	var url = 'https://docs.google.com/spreadsheet/formResponse?' +
		'formkey=' + 
		formkey +
		'&embedded=true&ifq'

	var email = $.trim($('#email').val());
	var items = '';
	//items = window.dragDropApp.items.addedString();

	$.ajax({
		url: url,
		data: { 
			'entry.0.single': '',
			'entry.1.single': email,
			'entry.2.single': items,
			pageNumber: 0,
			backupCache: 0,
			submit: 'Submit'
		},
		type: 'POST',
		dataType: 'xml',
		success: function(data, textStatus, xhr) {
			window.location = './thanks.html';
		},
		error: function(xhr, textStatus, errorThrown) {
			window.location = './thanks.html';
		},
	});
}
