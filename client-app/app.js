window.dao =  {

    syncURL: "../api/drivers",

    initialize: function(callback) {
        var self = this;
        this.db = window.openDatabase("driversdb", "1.0", "Sync Demo DB", 200000);

        // Testing if the table exists is not needed and is here for logging purpose only. We can invoke createTable
        // no matter what. The 'IF NOT EXISTS' clause will make sure the CREATE statement is issued only if the table
        // does not already exist.
        this.db.transaction(
            function(tx) {
                tx.executeSql("SELECT name FROM sqlite_master WHERE type='table' AND name='driver'", this.txErrorHandler,
                    function(tx, results) {
                        if (results.rows.length == 1) {
                            log('Using existing Driver table in local SQLite database');
                        }
                        else
                        {
                            log('Driver table does not exist in local SQLite database');
                            self.createTable(callback);
                        }
                    });
            }
        )

    },
        
    createTable: function(callback) {
        this.db.transaction(
            function(tx) {
                var sql =
                    "CREATE TABLE IF NOT EXISTS driver ( " +
                    "id INTEGER PRIMARY KEY AUTOINCREMENT, " +
                    "firstName VARCHAR(50), " +
                    "lastName VARCHAR(50), " +
                    "carnum INTEGER(3), " +
                    //"officePhone VARCHAR(50), " +
                    "deleted INTEGER, " +
                    "lastModified VARCHAR(50))";
                tx.executeSql(sql);
            },
            this.txErrorHandler,
            function() {
                log('Table driver successfully CREATED in local SQLite database');
                callback();
            }
        );
    },

    dropTable: function(callback) {
        this.db.transaction(
            function(tx) {
                tx.executeSql('DROP TABLE IF EXISTS driver');
            },
            this.txErrorHandler,
            function() {
                log('Table driver successfully DROPPED in local SQLite database');
                callback();
            }
        );
    },

    findAll: function(callback) {
        this.db.transaction(
            function(tx) {
                var sql = "SELECT * FROM DRIVER ORDER BY carnum ASC";
                log('Local SQLite database: "SELECT * FROM DRIVER"');
                tx.executeSql(sql, this.txErrorHandler,
                    function(tx, results) {
                        var len = results.rows.length,
                            drivers = [],
                            i = 0;
                        for (; i < len; i = i + 1) {
                            drivers[i] = results.rows.item(i);
                        }
                        log(len + ' rows found');
                        callback(drivers);
                    }
                );
            }
        );
    },

    getLastSync: function(callback) {
        this.db.transaction(
            function(tx) {
                var sql = "SELECT MAX(lastModified) as lastSync FROM driver";
                tx.executeSql(sql, this.txErrorHandler,
                    function(tx, results) {
                        var lastSync = results.rows.item(0).lastSync;
                        log('Last local timestamp is ' + lastSync);
                        callback(lastSync);
                    }
                );
            }
        );
    },

    sync: function(callback) {

        var self = this;
        log('Starting synchronization...');
        this.getLastSync(function(lastSync){
            self.getChanges(self.syncURL, lastSync,
                function (changes) {
                    if (changes.length > 0) {
                        self.applyChanges(changes, callback);
                    } else {
                        log('Nothing to synchronize');
                        callback();
                    }
                }
            );
        });

    },

    getChanges: function(syncURL, modifiedSince, callback) {

        $.ajax({
            url: syncURL,
            data: {modifiedSince: modifiedSince},
            dataType:"json",
            success:function (data) {
                log("The server returned " + data.length + " changes that occurred after " + modifiedSince);
                callback(data);
            },
            error: function(model, response) {
                alert(response.responseText);
            }
        });

    },

    applyChanges: function(drivers, callback) {
        this.db.transaction(
            function(tx) {
                var l = drivers.length;
                var sql =
                    "INSERT OR REPLACE INTO driver (id, firstName, lastName, carnum, deleted, lastModified) " +
                    "VALUES (?, ?, ?, ?, ?, ?)";
                log('Inserting or Updating in local database:');
                var e;
                for (var i = 0; i < l; i++) {
                    e = drivers[i];
                    log(e.id + ' ' + e.firstName + ' ' + e.lastName + ' ' + e.carnum + ' ' + e.deleted + ' ' + e.lastModified);
                    var params = [e.id, e.firstName, e.lastName, e.carnum, e.deleted, e.lastModified];
                    tx.executeSql(sql, params);
                }
                log('Synchronization complete (' + l + ' items synchronized)');
            },
            this.txErrorHandler,
            function(tx) {
                callback();
            }
        );
    },

    txErrorHandler: function(tx) {
        alert(tx.message);
    }
};

dao.initialize(function() {
    console.log('database initialized');
});

$('#reset').on('click', function() {
    dao.dropTable(function() {
       dao.createTable();
    });
});


$('#sync').on('click', function() {
    dao.sync(renderList);
});

$('#render').on('click', function() {
    renderList();
});

$('#clearLog').on('click', function() {
    $('#log').val('');
});

function renderList(drivers) {
    log('Rendering list using local SQLite data...');
    dao.findAll(function(drivers) {
        $('#list').empty();
        var l = drivers.length;
        for (var i = 0; i < l; i++) {
            var driver = drivers[i];
            $('#list').append('<tr>' +
                '<td>' + driver.id + '</td>' +
                '<td>' +driver.firstName + '</td>' +
                '<td>' + driver.lastName + '</td>' +
                '<td>' + driver.carnum + '</td>' +
                '<td>' + driver.deleted + '</td>' +
                '<td>' + driver.lastModified + '</td></tr>');
        }
    });
}

function log(msg) {
    $('#log').val($('#log').val() + msg + '\n');
}
