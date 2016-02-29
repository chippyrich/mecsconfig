(function() {
  var app = angular.module('mecs');

  app.controller('selCntl', ['$location', '$route', 'circuitStore', function($location, $route, circuitStore) {
    var select = this;
    select.circuits = [];
    select.errormsg = "";
    select.chaserror = false;

    function showDialog() {
      $('#newCircuit').dialog({
        title: "New Circuit",
        modal: true
      }).dialog("option", "width", 400).dialog("open");
    }

    select.editCircuit = function() {
      var name = $('#circselect').val();
      console.log("Editing " + name);
      for (var i = 0; i < select.circuits.length; i += 1) {
        if (name === select.circuits[i].name) {
          circuitStore.create(select.circuits[i]);
          $location.path('/view');
          $route.reload();
        }
      }
    }

    function circIsValid() {
      var name = $('#circuitname').val();
      if (name === "") {
        select.errormsg = "No Circuit Name provided";
        select.chaserror = true;
        return false;
      }
      for (var i = 0; i < select.circuits.length; i += 1) {
        if (select.circuits[i].name === name) {
          select.errormsg = "Duplicate Circuit Name";
          select.chaserror = true;
          return false;
        }
      }
      return true;
    }

    function createCircuit() {
      var c = {
        name: $('#circuitname').val(),
        output: $('#circuitSubject').val(),
        active: $('#selIsActive').val(),
        inputs: [],
        nodes: []
      };
      circuitStore.create(c);
      select.circuits.push(c);
      console.log("OK done. There are " + select.circuits.length + " circuits");
    }

    select.newCircuit = function() {
      showDialog();
    };

    select.closeMe = function() {
      $('#newCircuit').dialog("close");
    }

    select.createCirc = function() {
      if (circIsValid()) {
        createCircuit();
        $('#newCircuit').dialog("close");
        $('#newCircuit').dialog("destroy");
        $location.path('/view');
        $route.reload();
      }
    }

    function init() {
      circuitStore.getCircuits()
        .success(function(circs) {
          for (var i = 0; i < circs.length; i += 1) {
            select.circuits.push(circs[i]);
          }
        })
        .error(function(data, status, headers, config) {
          console.log("error");
        });
    }

    init();

  }]);
}());