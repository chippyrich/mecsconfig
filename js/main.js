(function () {
    var maxcols = 8,
        nodecols = [],
        canvas,
        c,
        dragging = false,
        startPoint,
        snapshot,
        width = 80,
        height = 120,
        nodes = [{
            id: 1,
            type: "input",
            name: "Input 1",
            xpos: 100,
            ypos: 100,
            column: 1,
            hasfail: false
        }, {
            id: 2,
            type: "filter",
            name: "Filter 1",
            xpos: 250,
            ypos: 130,
            column: 2,
            hasfail: true
        }, {
            id: 3,
            type: "database",
            name: "DB 1",
            xpos: 400,
            ypos: 100,
            column: 3,
            hasfail: false
        }, {
            id: 4,
            type: "output",
            name: "Output 1",
            xpos: 550,
            ypos: 100,
            column: 5,
            hasfail: false
        }, {
            id: 5,
            type: "drop",
            name: "Drop 1",
            xpos: 550,
            ypos: 250,
            column: 5,
            hasfail: false
        }, {
            id: 6,
            type: "stringsplit",
            name: "Split 1",
            xpos: 550,
            ypos: 250,
            column: 4,
            hasfail: false
    }];

    function init() {
        var i;
        for (i = 0; i <= maxcols; i++) {
            nodecols.push(0);
        }
        canvas = document.getElementById('configstage');
        c = canvas.getContext('2d');


        canvas.addEventListener("mousedown", startDrag, false);
        canvas.addEventListener("mouseup", endDrag, false);
        //canvas.addEventListener("click", identify, false);
        canvas.addEventListener("dblclick", editnode, false);
        canvas.addEventListener("mousemove", doDrag, false);
        $('#showAdd').click(function (evt) {
            evt.preventDefault();
            showAdd();
        });

        for (var i = 0; i < nodes.length; i++) {
            drawNode(nodes[i]);
        }
    }

    function editnode(event) {
        var x = event.clientX - canvas.getBoundingClientRect().left;
        var y = event.clientY - canvas.getBoundingClientRect().top;
        for (var i = 0; i < nodes.length; i++) {
            if (x >= nodes[i].xpos && x <= nodes[i].xpos + width && y >= nodes[i].ypos && y <= nodes[i].ypos + height) {
                showEdit(nodes[i]);
            }
        }
    }

    function takeSnapshot() {
        snapshot = c.getImageData(0, 0, canvas.width, canvas.height);
    }

    function restoreSnapshot() {
        c.putImageData(snapshot, 0, 0);
    }

    function getcoords(event) {
        var x = event.clientX - canvas.getBoundingClientRect().left;
        var y = event.clientY - canvas.getBoundingClientRect().top;
        return {
            xpos: x,
            ypos: y
        };
    }

    function doDrag(event) {
        var pos;
        if (dragging) {
            restoreSnapshot();
            pos = getcoords(event);
            drawLine(pos);
        }
    }

    function drawLine(position) {
        c.beginPath();
        c.moveTo(startPoint.xpos, startPoint.ypos);
        c.lineTo(position.xpos, position.ypos);
        c.stroke();
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
                OK: function () {
                    $(this).dialog("close");
                }
            }
        }).dialog("option", "width", 400).dialog("open");
    }

    function showAdd() {
        $('#addNode').dialog({
            title: "Add New Node",
            buttons: {
                OK: function () {
                    var node = {};
                    node.name = $('#addnodename').val();
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
                    nodes.push(node);
                    drawNode(node);
                    $(this).dialog("close");
                },
                Cancel: function () {
                    $(this).dialog("close");
                }
            }
        }).dialog("option", "width", 400).dialog("open");
    }

    function startDrag(event) {
        var x = event.clientX - canvas.getBoundingClientRect().left;
        var y = event.clientY - canvas.getBoundingClientRect().top;
        for (var i = 0; i < nodes.length; i++) {
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
                        console.log("In dragging point");
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
        if (!startPoint || !dragging) {
            return;
        }
        if (x <= startPoint.xpos) {
            console.log("Can't drag R to L");
            dragging = false;
            return;
        }
        for (var i = 0; i < nodes.length; i++) {
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
                for (var j = 0; j < nodes.length; j++) {
                    if (nodes[j].name === startPoint.node) {
                        nodes[j].next = nodes[i].name;
                    }
                }
                dragging = false;
                return;
            }
        }
    }

    function identify(event) {
        if (dragging) {
            return;
        }
        var x = event.clientX - canvas.getBoundingClientRect().left;
        var y = event.clientY - canvas.getBoundingClientRect().top;
        for (var i = 0; i < nodes.length; i++) {
            if (x >= nodes[i].xpos && x <= nodes[i].xpos + width && y >= nodes[i].ypos && y <= nodes[i].ypos + height) {
                c.beginPath();
                c.strokeStyle = 'orange';
                c.lineWidth = 2;
                c.rect(nodes[i].xpos - 2, nodes[i].ypos - 2, width + 4, height + 4);
                c.stroke();
                return;
            }
        }
    }

    function addIcon(x, y, type) {
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
            c.arcTo(x+40,y+100,x+70,y+100,10);
            c.lineTo(x+60,y+100);
            c.stroke();
            c.beginPath();
            c.strokeStyle = "black";
            c.lineWidth = 3;
            c.moveTo(x+30,y+50);
            c.lineTo(x+50,y+50);
            c.moveTo(x+30,y+75);
            c.lineTo(x+50,y+75);
            c.stroke();
        } else {
            c.beginPath();
            c.fillStyle = "blue";
            c.font = 'normal bold 7em courier';
            c.fillText("?", x + 8, y + 88);
        }
    }

    function drawNode(node) {
        c.beginPath();
        var col = node.column;
        var x = 50 + ((col - 1) * 150);
        var y = 50 + (nodecols[col] * 150);
        nodecols[col] += 1;
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
    window.addEventListener('load', init, false);
}());