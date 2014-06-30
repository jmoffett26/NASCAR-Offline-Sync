var AppRouter = Backbone.Router.extend({

    routes: {
        "drivers/add"         : "addDriver",
        "drivers/:id"         : "editDriver"
    },

    initialize: function(options) {
        this.drivers = options.drivers;
    },

    editDriver: function (id) {
        var driver = this.drivers.get(id);
        if (this.currentView) {
            this.currentView.undelegateEvents();
            $(this.currentView.el).empty();
        }
        this.currentView = new DriverView({model: driver, el: "#content"});
    },

	addDriver: function() {
        var driver = new Driver();
        if (this.currentView) {
            this.currentView.undelegateEvents();
            $(this.currentView.el).empty();
        }
        this.currentView = new DriverView({model: driver, el: "#content"});
	}

});

utils.loadTemplate(['HeaderView', 'DriverView', 'DriverListItemView'], function() {
    var headerView = new HeaderView({el: '.header'});
    var drivers = new DriverCollection();
    drivers.fetch({success: function(){
        var listView = new DriverListView({model: drivers, el: "#list"});
        this.app = new AppRouter({drivers: drivers});
        Backbone.history.start();
    }});
});