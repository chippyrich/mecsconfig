(function() {
  
  var circuitStore = function($http) {
    var factory = {};

    var circuits = [
      
    ];
    var circuit = {
      name: '',
      active: "no",
      output: "",
      nodes: [],
      inputs: []
    };

    factory.getCircuits = function() {
      return $http.get("/circuits.json");
    }

    factory.create = function(newCirc) {
      /*
      var c = {
        name: newCirc.name,
        active: newCirc.active,
        nodes: [],
        inputs: []
      }
      circuits.push(newCirc);
      */
      circuit = newCirc;
    };
    
    factory.getActiveCircuit = function() {
      return circuit;
    };

    return factory;
  };
  
  angular.module('mecs').factory('circuitStore', circuitStore);
}());