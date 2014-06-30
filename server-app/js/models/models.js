window.Driver = Backbone.Model.extend({

    urlRoot:"../api/drivers",

    defaults: {
        id: null,
        firstName: "",
        lastName: "",
        carnum: "",
        lastModified: ""
    }


});

window.DriverCollection = Backbone.Collection.extend({

    model: Driver,

    url:"../api/drivers"

});