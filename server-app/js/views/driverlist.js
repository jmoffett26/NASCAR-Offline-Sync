window.DriverListView = Backbone.View.extend({

    initialize:function () {
        var self = this;
        this.model.on("add", function (driver) {
            $(self.el).append(new DriverListItemView({model:driver}).render().el);
        });
        this.render();
    },

    render:function () {
        $(this.el).empty();
        _.each(this.model.models, function (driver) {
            $(this.el).append(new DriverListItemView({model:driver}).render().el);
        }, this);
        return this;
    }
});

window.DriverListItemView = Backbone.View.extend({

    tagName:"li",

    initialize:function () {
        this.model.on("change", this.render, this);
        this.model.on("destroy", this.destroyHandler, this);
    },

    render:function () {
        $(this.el).html(this.template(this.model.toJSON()));
        return this;
    },

    destroyHandler: function() {
        $(this.el).remove();
    }

});