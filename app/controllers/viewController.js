(function() {
  var app = angular.module('mecs');
  app.controller('viewCntl', ['$location', '$route', 'circuitStore', 'drawUtils', function($location, $route, circuitStore, drawUtils) {
    var view = this;
    view.nhaserror = false;
    view.errormsg = "";
    view.circuit = {};

    view.showCancel = function() {
      $("#dialog-confirm").dialog({
        resizable: false,
        height: 140,
        modal: true,
        buttons: {
          Yes: function() {
            $(this).dialog("close");
            $(this).dialog("destroy");
            window.location = "#/select";
          },
          Cancel: function() {
            $(this).dialog("close");
          }
        }
      });
    }

    view.cancel = function() {
      $location.path('/select');
      $route.reload();
    };

    view.closeAdd = function() {
      $('#addNode').dialog("close");
      $('#addNode').dialog("destroy");
    }

    view.addNode = function() {
      var nm = $('#addnodename').val()
      if (nm === "") {
        view.nhaserror = true;
        view.errormsg = "No node name provided";
        return;
      }
      for (var i = 0; i < view.circuit.nodes.length; i+=1) {
        if (view.circuit.nodes[i].name === nm) {
        view.nhaserror = true;
        view.errormsg = "Duplicate Node Name";
        return;
        }
      }
      view.nhaserror = false;
      var node = {};
      node.name = nm;
      node.type = $('#selnodetype').val();
      node.column = $('#selcol').val();
      node.ypos = 150;
      if (node.type === "filter") {
        node.hasfail = true;
      } else {
        node.hasfail = false;
      }
      if (node.type === 'input') {
        node.column = 1;
      }
      view.circuit.nodes.push(node);
      drawUtils.addNode(node);
      drawUtils.drawNode(node);
      view.closeAdd();
    }

    function init() {
      view.circuit = circuitStore.getActiveCircuit();
      drawUtils.init(view.circuit);
      $('#showAdd').click(function(evt) {
        evt.preventDefault();
        showAdd();
      });

    }

    init();

    function showAdd() {
      $('#addNode').dialog({
        title: "Add New Node"
      }).dialog("option", "width", 400).dialog("open");
    }

  }]);
}());