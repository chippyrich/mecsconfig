(function() {
  var drawUtils = function() {
    var factory = {},
      nodecols = [],
      nodes = [],
      inputs = [],
      canvas,
      maxcols = 8,
      c,
      snapshot,
      dragging = false,
      startpoint = {},
      width = 80,
      height = 120;

    factory.init = function(n) {
      var i;
      for (i = 0; i <= maxcols; i += 1) {
        nodecols[i] = 0;
      }
      canvas = document.getElementById('configstage');
      if (canvas === null) {
        console.log("No canvas found");
      }
      c = canvas.getContext('2d');
      nodes = n.nodes;
      inputs = n.inputs;
      canvas.addEventListener("mousedown", startDrag, false);
      canvas.addEventListener("mouseup", endDrag, false);
      //canvas.addEventListener("click", identify, false);
      canvas.addEventListener("dblclick", editnode, false);
      canvas.addEventListener("mousemove", doDrag, false);
      initCanvas();
      drawCircuit();
      console.log("drawUtils initialized");
    }

    function editnode(event) {
      var x = event.clientX - canvas.getBoundingClientRect().left;
      var y = event.clientY - canvas.getBoundingClientRect().top;
      for (var i = 0; i < nodes.length; i += 1) {
        if (x >= nodes[i].xpos && x <= nodes[i].xpos + width && y >= nodes[i].ypos && y <= nodes[i].ypos + height) {
          showEdit(nodes[i]);
        }
      }
    }

    function showEdit(node) {
      $('#nodename').val(node.name);
      $('#nodetype').val(node.type);
      if (node.next) {
        $('#nodenext').val(node.next);
      }
      $('#editNode').dialog({
        title: "Edit Node " + node.name,
        buttons: {
          OK: function() {
            $(this).dialog("close");
          }
        }
      }).dialog("option", "width", 400).dialog("open");
    }

    function initCanvas() {
      c.clearRect(0, 0, canvas.width, canvas.height);
      c.beginPath();
      c.strokeStyle = "lightgrey";
      for (i = 170; i < 1200; i += 150) {
        c.moveTo(i, 0);
        c.lineTo(i, canvas.getBoundingClientRect().bottom);
      }
      for (i = 185; i < 800; i += 150) {
        c.moveTo(0, i);
        c.lineTo(canvas.getBoundingClientRect().right, i);
      }
      c.stroke();
    }

    function drawCircuit() {
      var i;
      for (i = 0; i < nodes.length; i += 1) {
        nodes[i].rendered = false;
      }
      for (i = 0; i < inputs.length; i += 1) {
        //inputs[i].column = i + 1;
        inputs[i].column = 1;
        drawNode(inputs[i]);
        if (initNode(inputs[i].passTo, i + 1)) {
          console.log("Drawing from " + inputs[i].name + " to " + nodes[i].passTo);
          console.log("XPOS = " + nodes[i].xpos);
          ip = findInputPoint(inputs[i].passTo);
          op = findOutputPoint(inputs[i]);
          c.beginPath();
          c.strokeStyle = "blue";
          c.lineWidth = 3;
          c.moveTo(op.xpos, op.ypos);
          c.lineTo(ip.xpos, ip.ypos);
          c.stroke();
          //TODO Draw the connector
        }
      }
    }

    function initNode(nname, col) {
      console.log("Passed " + nname + " to initNode with col " + col);
      for (var i = 0; i < nodes.length; i += 1) {
        if (nodes[i].name === nname) {
          var node = nodes[i];
          console.log("Node " + node.name + " type " + node.type);
          if (node.rendered) {
            console.log("Already rendered");
            return true;
          }
          node.column = col + 1;
          drawNode(node);
          node.rendered = true;
          if (node.type === 'output' || nodes[i].type === 'drop') {
            console.log("Output/Drop node. At the end of the chain.");
            return true;
          }
          var ip, op;
          if (initNode(node.passTo, col + 1)) {
            console.log("Drawing from " + node.name + " to " + node.passTo);
            console.log("XPOS = " + nodes[i].xpos);
            ip = findInputPoint(node.passTo);
            op = findOutputPoint(node);
            c.beginPath();
            c.strokeStyle = "blue";
            c.lineWidth = 3;
            c.moveTo(op.xpos, op.ypos);
            c.lineTo(ip.xpos, ip.ypos);
            c.stroke();
            //TODO draw connector
          }
          if (node.hasfail) {
            if (initNode(node.failTo, col + 1)) {
              //TODO draw fail connector
              console.log("Drawing from " + node.name + " to " + node.passTo);
              console.log("XPOS = " + node.xpos);
              ip = findInputPoint(node.failTo);
              op = findOutputPoint(node);
              c.beginPath();
              c.strokeStyle = "blue";
              c.lineWidth = 3;
              c.moveTo(op.xpos, op.ypos + (height / 4));
              c.lineTo(ip.xpos, ip.ypos);
              c.stroke();
            }
          }
          return true;
        }
      }
      console.log("Didn't find node " + nname);
      return false;
    }

    factory.addNode = function(node) {
      console.log("There are " + nodes.length + " nodes. Adding another.");
      nodes.push(node);
    }

    factory.drawNode = function(node) {
      console.log("Running 'drawNode'");
      drawNode(node);
    }

    function doDrag(event) {
      var pos;
      if (dragging) {
        restoreSnapshot();
        pos = getcoords(event);
        drawLine(pos);
      }
    }

    function getcoords(event) {
      var x = event.clientX - canvas.getBoundingClientRect().left;
      var y = event.clientY - canvas.getBoundingClientRect().top;
      return {
        xpos: x,
        ypos: y
      };
    }

    function drawLine(position) {
      c.beginPath();
      c.moveTo(startPoint.xpos, startPoint.ypos);
      c.lineTo(position.xpos, position.ypos);
      c.stroke();
    }

    function findOutputPoint(node) {
      if (node.xpos && node.ypos) {
        var spos = {
          xpos: node.xpos + width - 10,
          ypos: node.ypos + (height / 2)
        }
        return spos;
      }
    }

    function findInputPoint(noden) {
      console.log("Input point for " + noden + "...");
      var node;
      for (var i = 0; i < nodes.length; i += 1) {
        if (noden === nodes[i].name) {
          node = nodes[i];
          console.log("Found node type " + node.type);
        }
      }
      if (node.xpos && node.ypos) {
        var epos = {
          xpos: node.xpos + 5,
          ypos: node.ypos + (height / 2)
        }
        return epos;
      } else {
        console.log("No xpos/ypos found");
      }
    }

    function startDrag(event) {
      console.log("Starting drag");
      dragging = false;
      var x = event.clientX - canvas.getBoundingClientRect().left;
      var y = event.clientY - canvas.getBoundingClientRect().top;
      console.log("X = " + x + ", Y = " + y + ". There are " + nodes.length + " nodes");
      for (var i = 0; i < nodes.length; i += 1) {
        console.log("Testing node " + nodes[i].name + " type " + nodes[i].type);
        if (nodes[i].type !== "output" && nodes[i].type !== "drop") {
          var xp = nodes[i].xpos + width - 15;
          var yp = nodes[i].ypos + (height / 2) - 5;
          if (x >= xp - 5 && x <= xp + 15 && y >= yp - 5 && y <= yp + 15) {
            console.log("In dragging point");
            startPoint = {
              xpos: xp + 5,
              ypos: yp + 5,
              node: nodes[i].name
            };
            dragging = true;
            takeSnapshot();
            return;
          }
          if (nodes[i].hasfail) {
            yp = nodes[i].ypos + (3 * height / 4) - 5;
            if (x >= xp - 5 && x <= xp + 15 && y >= yp - 5 && y <= yp + 15) {
              console.log("In fail dragging point");
              startPoint = {
                xpos: xp + 5,
                ypos: yp + 5,
                node: nodes[i].name
              };
              takeSnapshot();
              dragging = true;
              return;
            }
          }
        }
      }
    }

    function endDrag(event) {
      var x = event.clientX - canvas.getBoundingClientRect().left;
      var y = event.clientY - canvas.getBoundingClientRect().top;
      if (!dragging) {
        return;
      }
      if (!startPoint || !dragging) {
        return;
      }
      if (x <= startPoint.xpos) {
        console.log("Can't drag R to L");
        dragging = false;
        return;
      }
      for (var i = 0; i < nodes.length; i += 1) {
        var xp = nodes[i].xpos + 5;
        var yp = nodes[i].ypos + (height / 2) - 5;
        if (x >= xp && x <= xp + 10 && y >= yp && y <= yp + 10) {
          console.log("In dragging point finish");
          c.beginPath();
          c.lineWidth = 3;
          c.strokeStyle = "blue";
          restoreSnapshot();
          c.moveTo(startPoint.xpos, startPoint.ypos);
          c.lineTo(xp + 5, yp + 5);
          c.stroke();
          console.log("Line from " + startPoint.node + " to " + nodes[i].name);
          for (var j = 0; j < nodes.length; j += 1) {
            if (nodes[j].name === startPoint.node) {
              nodes[j].passTo = nodes[i].name;
            }
          }
          dragging = false;
          return;
        }
      }
    }

    function addIcon(x, y, type) {
      console.log("Drawing icon for " + type);
      c.lineJoin = "round";
      if (type === "input") {
        c.strokeStyle = "black";
        c.fillStyle = "green";
        c.beginPath();
        c.moveTo(x + 20, y + 20);
        c.lineTo(x + 20, y + 100);
        c.lineTo(x + 50, y + 60);
        c.closePath();
        c.stroke();
        c.fill();
      } else if (type === "passthrough") {
        c.strokeStyle = "black";
        c.fillStyle = "lightblue";
        c.beginPath();
        c.moveTo(x + 20, y + 50);
        c.lineTo(x + 35, y + 50);
        c.lineTo(x + 35, y + 20);
        c.lineTo(x + 60, y + 60);
        c.lineTo(x + 35, y + 100);
        c.lineTo(x + 35, y + 70);
        c.lineTo(x + 20, y + 70);
        c.closePath();
        c.stroke();
        c.fill();
      } else if (type === "output") {
        c.strokeStyle = "black";
        c.fillStyle = "red";
        c.beginPath();
        c.moveTo(x + 25, y + 20);
        c.lineTo(x + 35, y + 20);
        c.lineTo(x + 35, y + 100);
        c.lineTo(x + 25, y + 100);
        c.closePath();
        c.stroke();
        c.fill();
        c.beginPath();
        c.moveTo(x + 45, y + 20);
        c.lineTo(x + 55, y + 20);
        c.lineTo(x + 55, y + 100);
        c.lineTo(x + 45, y + 100);
        c.closePath();
        c.stroke();
        c.fill();
      } else if (type === "filter") {
        c.strokeStyle = "black";
        c.fillStyle = "grey";
        c.beginPath();
        c.moveTo(x + 20, y + 30);
        c.lineTo(x + 60, y + 30);
        c.lineTo(x + 43, y + 60);
        c.lineTo(x + 43, y + 93);
        c.lineTo(x + 37, y + 90);
        c.lineTo(x + 37, y + 60);
        c.closePath();
        c.stroke();
        c.fill();
      } else if (type === "database") {
        c.strokeStyle = "black";
        c.fillStyle = "grey";
        c.lineWidth = 2;
        c.beginPath();
        c.moveTo(x + 20, y + 90);
        c.lineTo(x + 20, y + 30);
        c.quadraticCurveTo(x + 40, y + 15, x + 60, y + 30);
        c.moveTo(x + 20, y + 30);
        c.quadraticCurveTo(x + 40, y + 45, x + 60, y + 30);
        c.lineTo(x + 60, y + 90);
        c.quadraticCurveTo(x + 40, y + 105, x + 20, y + 90);
        c.stroke();
        c.fill();
        c.beginPath();
        for (var i = 0; i < 30; i += 5) {
          c.moveTo(x + 20, y + 30 + i);
          c.quadraticCurveTo(x + 40, y + 45 + i, x + 60, y + 30 + i);
        }
        c.stroke();
      } else if (type === "drop") {
        c.strokeStyle = "black";
        c.fillStyle = "lightgreen";
        c.lineWidth = 2;
        c.beginPath();
        c.moveTo(x + 28, y + 90);
        c.lineTo(x + 20, y + 30);
        c.quadraticCurveTo(x + 45, y + 15, x + 70, y + 30);
        c.moveTo(x + 20, y + 30);
        c.quadraticCurveTo(x + 45, y + 45, x + 70, y + 30);
        c.lineTo(x + 62, y + 90);
        c.quadraticCurveTo(x + 45, y + 105, x + 28, y + 90);
        c.stroke();
        c.fill();
        c.stroke();
      } else if (type === "stringsplit") {
        c.strokeStyle = "grey";
        c.fillStyle = "grey";
        c.lineWidth = 5;
        c.beginPath();
        c.moveTo(x + 20, y + 25);
        c.arcTo(x + 40, y + 25, x + 40, y + 100, 10);
        c.arcTo(x + 40, y + 100, x + 70, y + 100, 10);
        c.lineTo(x + 60, y + 100);
        c.stroke();
        c.beginPath();
        c.strokeStyle = "black";
        c.lineWidth = 3;
        c.moveTo(x + 30, y + 50);
        c.lineTo(x + 50, y + 50);
        c.moveTo(x + 30, y + 75);
        c.lineTo(x + 50, y + 75);
        c.stroke();
      } else {
        c.beginPath();
        c.fillStyle = "blue";
        c.font = 'normal bold 7em courier';
        c.fillText("?", x + 8, y + 88);
      }
    }

    function drawNode(node) {
      console.log("Drawing node " + node.name);
      c.beginPath();
      var col = node.column;
      var x = 50 + ((col - 1) * 150);
      var y = 50 + (nodecols[col] * 150);
      nodecols[col] += 1;
      console.log("Putting in column " + col + ", position " + x + "," + y);
      //var x = node.xpos;
      //var y = node.ypos;
      node.xpos = x;
      node.ypos = y;
      c.strokeStyle = "grey";
      c.lineWidth = 6;
      c.lineCap = 'round';
      c.moveTo(x + (width / 2), y);
      c.arcTo(x + width, y, x + width, y + height, 10);
      c.arcTo(x + width, y + height, x, y + height, 10);
      c.arcTo(x, y + height, x, y, 10);
      c.arcTo(x, y, x + width, y, 10);
      c.closePath();
      c.stroke();
      if (node.type && node.type !== "input") {
        c.beginPath();
        c.lineWidth = 4;
        c.strokeStyle = "blue";
        var xp = x + 5;
        c.moveTo(xp, (y + (height / 2) - 5));
        c.lineTo(xp + 10, (y + (height / 2) - 5));
        c.lineTo(xp + 10, (y + (height / 2) + 5));
        c.lineTo(xp, (y + (height / 2) + 5));
        c.closePath();
        c.stroke();
      }
      if (node.type && node.type !== "output" && node.type !== "drop") {
        c.beginPath();
        c.lineWidth = 4;
        c.strokeStyle = "green";
        var xp = x + width - 15;
        c.moveTo(xp, (y + (height / 2) - 5));
        c.lineTo(xp + 10, (y + (height / 2) - 5));
        c.lineTo(xp + 10, (y + (height / 2) + 5));
        c.lineTo(xp, (y + (height / 2) + 5));
        c.closePath();
        c.stroke();
        if (node.hasfail) {
          c.beginPath();
          c.lineWidth = 4;
          c.strokeStyle = "red";
          var xp = x + width - 15;
          var yp = y + (height / 4);
          c.moveTo(xp, (yp + (height / 2) - 5));
          c.lineTo(xp + 10, (yp + (height / 2) - 5));
          c.lineTo(xp + 10, (yp + (height / 2) + 5));
          c.lineTo(xp, (yp + (height / 2) + 5));
          c.closePath();
          c.stroke();
        }
      }
      addIcon(x, y, node.type);
      takeSnapshot();
    }

    function takeSnapshot() {
      snapshot = c.getImageData(0, 0, canvas.width, canvas.height);
    }

    function restoreSnapshot() {
      c.putImageData(snapshot, 0, 0);
    }


    return factory;
  }

  angular.module('mecs').factory('drawUtils', drawUtils);
}());