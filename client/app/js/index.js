const root = document.getElementById('app');

m.route.prefix = "";

m.route(root, '/', {
	'/': { view: function() { m('span', {}, 'Home view') } },
	'/message/:id': { view: function() { m('span', {}, 'Message view') } },
	'/:404': { view: function() { m('span', {}, 'Error view') } }
});