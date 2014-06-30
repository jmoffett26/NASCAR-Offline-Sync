<?php

/*
 * RESTFul API for an driver directory application. Sandbox for offline-sync experimentation. Maintain a session-based
 * and updatable driver list that mimics a real-life database-powered backend while enabling multiple users to
 * experiment with CRUD operations on their isolated data set without compromising the integrity of a central database.
 */

require 'Slim/Slim.php';

session_start();

if (!isset($_SESSION['drivers'])) {
    $_SESSION['drivers'] = array(
        (object) array("id" => 1, "firstName" => "Jimmie", "lastName" => "Johnson", "title" => "CEO", "officePhone" => "617-321-4567", "lastModified" => "2008-01-01 00:00:00", "deleted" => false)/*,
        (object) array("id" => 2, "firstName" => "Lisa", "lastName" => "Taylor", "title" => "VP of Marketing", "officePhone" => "617-522-5588", "lastModified" => "2011-06-01 01:00:00", "deleted" => false),
        (object) array("id" => 3, "firstName" => "James", "lastName" => "Jones", "title" => "VP of Sales", "officePhone" => "617-589-9977", "lastModified" => "2009-08-01 16:30:24", "deleted" => false),
        (object) array("id" => 4, "firstName" => "Paul", "lastName" => "Wong", "title" => "VP of Engineering", "officePhone" => "617-245-9785", "lastModified" => "2012-05-01 08:22:10", "deleted" => false),
        (object) array("id" => 5, "firstName" => "Alice", "lastName" => "King", "title" => "Architect", "officePhone" => "617-744-1177", "lastModified" => "2012-02-10 22:58:37", "deleted" => false),
        (object) array("id" => 6, "firstName" => "Jen", "lastName" => "Brown", "title" => "Software Engineer", "officePhone" => "617-568-9863", "lastModified" => "2010-01-15 11:17:45", "deleted" => false),
        (object) array("id" => 7, "firstName" => "Amy", "lastName" => "Garcia", "title" => "Software Engineer", "officePhone" => "617-327-9966", "lastModified" => "2011-07-03 14:24:50", "deleted" => false),
        (object) array("id" => 8, "firstName" => "Jack", "lastName" => "Green", "title" => "Software Engineer", "officePhone" => "617-565-9966", "lastModified" => "2012-04-28 10:25:56", "deleted" => false)*/
    );
}

$app = new Slim(array(
    'debug' => false
));

$app->error(function ( Exception $e ) use ($app) {
    echo $e->getMessage();
});

$app->get('/drivers',         'getDrivers');
$app->post('/drivers',        'addDriver');
$app->put('/drivers/:id',     'updateDriver');
$app->delete('/drivers/:id',  'deleteDriver');

$app->run();

function getDrivers() {
    if (isset($_GET['modifiedSince'])) {
        getModifiedDrivers($_GET['modifiedSince']);
        return;
    }
    $drivers = $_SESSION['drivers'];
    $result = array();
    foreach ($drivers as $driver) {
        if (!$driver->deleted) {
            $result[] = $driver;
        }
    }
    echo json_encode($result);
}

// Get the drivers that have been modified since the specified timestamp
// This is the cornerstone of this data sync solution
function getModifiedDrivers($modifiedSince) {
    if ($modifiedSince == 'null') {
        $modifiedSince = "1000-01-01";
    }
    $drivers = $_SESSION['drivers'];
    $result = array();
    foreach ($drivers as $driver) {
        if ($driver->lastModified > $modifiedSince) {
            $result[] = $driver;
        }
    }
    echo json_encode($result);
}

// Add an driver to the session's driver list
function addDriver() {
    $drivers = $_SESSION['drivers'];
    $l = sizeof($drivers);
    // We don't allow more than 20 drivers in this sandbox
    if ($l>19) {
        throw new Exception("You can only have 20 drivers in this sandbox");
        return;
    }
    $request = Slim::getInstance()->request();
   	$body = $request->getBody();
   	$driver = json_decode($body);
    $driver->lastModified = date('Y-m-d H:i:s');
    $driver->deleted = false;
    $driver->id = sizeof($drivers) + 1;
    $drivers[] = $driver;
    $_SESSION['drivers'] = $drivers;
    echo json_encode($driver);
}

// Update an driver in the session's driver list
function updateDriver($id) {
    $request = Slim::getInstance()->request();
   	$body = $request->getBody();
   	$driver = json_decode($body);
    $driver->lastModified = date('Y-m-d H:i:s');
    $driver->deleted = false;

    $drivers = $_SESSION['drivers'];
    $l = sizeof($drivers);

    for($i = 0; $i < $l; ++$i)
    {
        if ($drivers[$i]->id == $id) {
            array_splice($drivers, $i, 1, array($driver));
            $_SESSION['drivers'] = $drivers;
            echo json_encode($driver);
            return;
        }
    }
}

// Delete the specified driver from the session's driver list
function deleteDriver($id) {
    $drivers = $_SESSION['drivers'];
    $l = sizeof($drivers);
    for($i = 0; $i < $l; ++$i)
    {
        if ($drivers[$i]->id == $id) {
            $drivers[$i]->lastModified = date('Y-m-d H:i:s');
            $drivers[$i]->deleted = true;
            $_SESSION['drivers'] = $drivers;
            echo json_encode($drivers[$i]);
            return;
        }
    }
}

?>