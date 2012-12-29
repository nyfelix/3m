YUI.add('wmm-mindmap', function(Y) {
    Y.namespace('wmm').Mindmap = Y.Base.create('mindmap', Y.Widget, [], {
        that: null,        
        initializer: function() {
            Y.wmm.mindmapInstance = this;
        },
        destructor: function() {},        
        renderUI: function() {
            var content = this.get('contentBox');
            this._display = content;
            this._initJitGraph(this.get('type'));
        },
        bindUI: function() {
            Y.one('#rotate').on('click', function() {
                this._jitGraph.graph.each(function(node) {
                    var pos = node.pos.getp(true);
                    pos.theta += 0.1;
                });
                this._jitGraph.plot();
            }, this);
        },
        syncUI: function() {
            this.after('termChange', function(e) {
                this.load(e.newVal);
            }, this);
        },
        
        load: function(query) {
            var sources = this.get('sources');
            // Reset data
            this._data = {
                id: '0',
                name: query,
                data: {},
                children: []
            };
            for (var s in sources) {
                if (sources[s].api !== '') {
                    var i = this._data.children.length;
                    var parentNode = this._data;
                    // If nodename is empty, attach to the root
                    if (sources[s].nodename !== '') {
                        this._data.children[i] = {
                            id: s,
                            name: sources[s].nodename,
                            children: []
                        };
                        parentNode = this._data.children[i];
                    }
                    var url = Y.Lang.substitute(sources[s].api, {
                        wiki: Y.one('#wiki').get('value'),
                        term: Y.one('#term').get('value')
                    });
                    Y.jsonp(url, {
                        on: {
                            success: function(o, args) {
                                var type = args.context.get('type'),
                                    jitGraph = args.context._jitGraph;
                                args.source.mapping(o, args.parent);

                                jitGraph.loadJSON(args.context._data);
                                
                                if (type === 'st') {
                                    jitGraph.compute();
                                    //args.context._jitGraph.switchPosition("top", "animate", function(){});
                                    //jitGraph.geom.translate(new $jit.Complex(-200, 0), "current");  
                                    jitGraph.onClick(args.context._jitGraph.root);
                                } else if (type === 'ht') {
                                    jitGraph.refresh();
                                    jitGraph.compute();                                    
                                    jitGraph.plot();
                                } else if (type === 'fd') {
                                    // compute positions incrementally and animate.  
                                    jitGraph.computeIncremental({  
                                        iter: 40,  
                                        property: 'end',  
                                        onStep: function(perc){  
                                            //Log.write(perc + '% loaded...');  
                                        },  
                                        onComplete: function(){  
                                            //Log.write('done');  
                                            jitGraph.animate({  
                                                modes: ['linear'],  
                                                transition: $jit.Trans.Elastic.easeOut,  
                                                duration: 2500  
                                            });  
                                        }     
                                    });
                                }
                            },
                            failure: function(x, o) {
                                Y.log("Async call failed!");
                            }
                        },
                        args: {
                            parent: parentNode,
                            context: this,
                            source: sources[s]
                        }
                    });
                }
                else {
                    sources[s].mapping({}, this._data.children[i]);
                    this._jitGraph.loadJSON(this._data);
                    this._jitGraph.refresh();
                }
            }
        },
        _initJitGraph: function(type) {
            var that = this;
            if (type == 'ht') {
                var h = parseInt(Y.one('#wmm-mindmap').getComputedStyle('height')),
                    config = {
                    //id of the visualization container
                    injectInto: 'mindmap',
                    //
                    //canvas width and height, later user Y.layout for these things
                    width: parseInt(Y.one('#wmm-mindmap').getComputedStyle('width')),
                    height: h,
                    radius: h/2,
                    duration: 800,
                    //Change node and edge styles such as
                    //color, width and dimensions.
                    Node: {
                        dim: 9,
                        color: "#ff00cc"
                    },
                    Edge: {
                        lineWidth: 2,
                        color: "#00AFF0"
                    },
                    onBeforeCompute: function(node) {
                        //Log.write("centering");
                    },
                    //Attach event handlers and add text to the
                    //labels. This method is only triggered on label
                    //creation
                    onCreateLabel: function(domElement, node) {
                        domElement.innerHTML = node.name;
                        $jit.util.addEvent(domElement, 'click', function() {
                            that._jitGraph.onClick(node.id, {
                                onComplete: function() {
                                    that._jitGraph.controller.onComplete();
                                }
                            });
                        });
                    },
                    //Change node styles when labels are placed
                    //or moved.
                    onPlaceLabel: function(domElement, node) {
                        var style = domElement.style;
                        style.display = 'block';
                        style.cursor = 'pointer';
                        if (node._depth < 1) {
                            style.fontSize = "12px";
                            style.color = "#000000";
                        } else if (node._depth == 1) {
                            style.fontSize = "11px";
                            style.color = "#000000";
                        }
                        else if (node._depth == 2) {
                            style.fontSize = "10px";
                            style.color = "#555";                            
                        }
                        else {
                            style.display = 'none';
                        }
                        var left = parseInt(style.left);
                        var w = domElement.offsetWidth;
                        style.left = (left - w / 2) + 'px';
                    },
                    onAfterCompute: function() {
                        //Log.write("done");
                        //Build the right column relations list.
                        //This is done by collecting the information (stored in the data property)
                        //for all the nodes adjacent to the centered node.
                        var node = Y.wmm.mindmap.graph.getClosestNodeToOrigin("current");
                        var html = "<h4>" + node.name + "</h4><b>Connections:</b>";
                        html += "<ul>";
                        node.eachAdjacency(function(adj) {
                            var child = adj.nodeTo;
                            if (child.data) {
                                var rel = (child.data.band == node.name) ? child.data.relation : node.data.relation;
                                html += "<li>" + child.name + " " + "<div class=\"relation\">(relation: " + rel + ")</div></li>";
                            }
                        });
                        html += "</ul>";
                        $jit.id('inner-details').innerHTML = html;
                    }
                }
                that._jitGraph = new $jit.Hypertree(config);
            }
            if (type == 'st') {
                //Implement a node rendering function called 'nodeline' that plots a straight line
                //when contracting or expanding a subtree.
                $jit.ST.Plot.NodeTypes.implement({
                    'nodeline': {
                      'render': function(node, canvas, animating) {
                            if(animating === 'expand' || animating === 'contract') {
                              var pos = node.pos.getc(true), nconfig = this.node, data = node.data;
                              var width  = nconfig.width, height = nconfig.height;
                              var algnPos = this.getAlignedPos(pos, width, height);
                              var ctx = canvas.getCtx(), ort = this.config.orientation;
                              ctx.beginPath();
                              if(ort == 'left' || ort == 'right') {
                                  ctx.moveTo(algnPos.x, algnPos.y + height / 2);
                                  ctx.lineTo(algnPos.x + width, algnPos.y + height / 2);
                              } else {
                                  ctx.moveTo(algnPos.x + width / 2, algnPos.y);
                                  ctx.lineTo(algnPos.x + width / 2, algnPos.y + height);
                              }
                              ctx.stroke();
                          } 
                      }
                    }
                });
                var config = {
                    //id of viz container element  
                    injectInto: 'mindmap',                        
                    width: parseInt(Y.one('#wmm-mindmap').getComputedStyle('width')),
                    height: parseInt(Y.one('#wmm-mindmap').getComputedStyle('height')),
                    //set duration for the animation  
                    duration: 800,  
                    //set animation transition type  
                    transition: $jit.Trans.Quart.easeInOut,  
                    //set distance between node and its children  
                    levelDistance: 50,  
                    //set max levels to show. Useful when used with  
                    //the request method for requesting trees of specific depth  
                    levelsToShow: 2,  
                    //set node and edge styles  
                    //set overridable=true for styling individual  
                    //nodes or edges  
                    Node: {  
                        height: 20,  
                        width: 40,  
                        //use a custom  
                        //node rendering function  
                        type: 'nodeline',  
                        color:'#23A4FF',  
                        lineWidth: 2,  
                        align:"center",  
                        overridable: true  
                    },  
                      
                    Edge: {  
                        type: 'bezier',  
                        lineWidth: 2,  
                        color:'#23A4FF',  
                        overridable: true  
                    },  
                      
                    //Add a request method for requesting on-demand json trees.   
                    //This method gets called when a node  
                    //is clicked and its subtree has a smaller depth  
                    //than the one specified by the levelsToShow parameter.  
                    //In that case a subtree is requested and is added to the dataset.  
                    //This method is asynchronous, so you can make an Ajax request for that  
                    //subtree and then handle it to the onComplete callback.  
                    //Here we just use a client-side tree generator (the getTree function).  
                    request: function(nodeId, level, onComplete) {  
                      //var ans = getTree(nodeId, level);  
                      //onComplete.onComplete(nodeId, ans);    
                    },  
                      
                    onBeforeCompute: function(node){  
                        //Log.write("loading " + node.name);  
                    },  
                      
                    onAfterCompute: function(){  
                        //Log.write("done");  
                    },  
                      
                    //This method is called on DOM label creation.  
                    //Use this method to add event handlers and styles to  
                    //your node.  
                    onCreateLabel: function(label, node){  
                        label.id = node.id;              
                        label.innerHTML = node.name;  
                        label.onclick = function(){  
                            that._jitGraph.onClick(node.id);  
                        };  
                        //set label styles  
                        var style = label.style;  
                        style.width = 40 + 'px';  
                        style.height = 17 + 'px';              
                        style.cursor = 'pointer';  
                        style.color = '#222';  
                        //style.backgroundColor = '#1a1a1a';  
                        style.fontSize = '0.8em';  
                        style.textAlign= 'center';  
                        style.textDecoration = 'underline';  
                        style.paddingTop = '3px';  
                    },  
                      
                    //This method is called right before plotting  
                    //a node. It's useful for changing an individual node  
                    //style properties before plotting it.  
                    //The data properties prefixed with a dollar  
                    //sign will override the global node style properties.  
                    onBeforePlotNode: function(node){  
                        //add some color to the nodes in the path between the  
                        //root node and the selected node.  
                        if (node.selected) {  
                            node.data.$color = "#ff7";  
                        }  
                        else {  
                            delete node.data.$color;  
                        }  
                    },  
                      
                    //This method is called right before plotting  
                    //an edge. It's useful for changing an individual edge  
                    //style properties before plotting it.  
                    //Edge data proprties prefixed with a dollar sign will  
                    //override the Edge global style properties.  
                    onBeforePlotLine: function(adj){  
                        if (adj.nodeFrom.selected && adj.nodeTo.selected) {  
                            adj.data.$color = "#eed";  
                            adj.data.$lineWidth = 3;  
                        }  
                        else {  
                            delete adj.data.$color;  
                            delete adj.data.$lineWidth;  
                        }  
                    }  
                   
                }
                that._jitGraph = new $jit.ST(config);
            }
            if (type == 'fd') {
                var config = {  
                    //id of the visualization container  
                    injectInto: 'mindmap',  
                    //Enable zooming and panning  
                    //by scrolling and DnD  
                    Navigation: {  
                        enable: true,  
                        //Enable panning events only if we're dragging the empty  
                        //canvas (and not a node).  
                        panning: 'avoid nodes',  
                        zooming: 10 //zoom speed. higher is more sensible  
                    },  
                    width: parseInt(Y.one('#wmm-mindmap').getComputedStyle('width')),
                    height: parseInt(Y.one('#wmm-mindmap').getComputedStyle('height')),
                    // Change node and edge styles such as  
                    // color and width.  
                    // These properties are also set per node  
                    // with dollar prefixed data-properties in the  
                    // JSON structure.  
                    Node: {  
                        overridable: true,
                        type: 'star',
                        dim: '10'
                    },  
                    Edge: {  
                        overridable: true,  
                        color: '#23A4FF',  
                        lineWidth: 0.4  
                    },  
                    //Native canvas text styling  
                    Label: {  
                        type: 'Native', //Native or HTML  
                        size: 10,  
                        style: 'bold',
                        color: '000000' 
                    },  
                    //Add Tips  
                    Tips: {  
                        enable: true,  
                        onShow: function(tip, node) {  
                            //count connections  
                            var count = 0;  
                            node.eachAdjacency(function() { count++; });  
                            //display node info in tooltip  
                            tip.innerHTML = "<div class=\"tip-title\">" + node.name + "</div>"  
                            + "<div class=\"tip-text\"><b>connections:</b> " + count + "</div>";  
                      }  
                    },  
                    // Add node events  
                    Events: {  
                        enable: true,  
                        type: 'Native',  
                        //Change cursor style when hovering a node  
                        onMouseEnter: function() {  
                            fd.canvas.getElement().style.cursor = 'move';  
                        },  
                        onMouseLeave: function() {  
                          fd.canvas.getElement().style.cursor = '';  
                        },  
                        //Update node positions when dragged  
                        onDragMove: function(node, eventInfo, e) {  
                            var pos = eventInfo.getPos();  
                            node.pos.setc(pos.x, pos.y);  
                            fd.plot();  
                        },  
                        //Implement the same handler for touchscreens  
                        onTouchMove: function(node, eventInfo, e) {  
                            $jit.util.event.stop(e); //stop default touchmove event  
                            this.onDragMove(node, eventInfo, e);  
                        },  
                        //Add also a click handler to nodes  
                        onClick: function(node) {  
                            if(!node) return;  
                            // Build the right column relations list.  
                            // This is done by traversing the clicked node connections.  
                            var html = "<h4>" + node.name + "</h4><b> connections:</b><ul><li>",  
                            list = [];  
                            node.eachAdjacency(function(adj){  
                            list.push(adj.nodeTo.name);  
                        });  
                        //append connections information  
                        $jit.id('inner-details').innerHTML = html + list.join("</li><li>") + "</li></ul>";  
                      }  
                    },  
                    //Number of iterations for the FD algorithm  
                    iterations: 200,  
                    //Edge length  
                    levelDistance: 130,  
                    // Add text to the labels. This method is only triggered  
                    // on label creation and only for DOM labels (not native canvas ones).  
                    onCreateLabel: function(domElement, node){  
                        domElement.innerHTML = node.name;  
                        var style = domElement.style;  
                        style.fontSize = "0.8em";  
                        style.color = "#ddd";  
                    },  
                    // Change node styles when DOM labels are placed  
                    // or moved.  
                    onPlaceLabel: function(domElement, node){  
                        var style = domElement.style;  
                        var left = parseInt(style.left);  
                        var top = parseInt(style.top);  
                        var w = domElement.offsetWidth;  
                        style.left = (left - w / 2) + 'px';  
                        style.top = (top + 10) + 'px';  
                        style.display = '';  
                        }  
                }  
                that._jitGraph = new $jit.ForceDirected(config);
            }
        }
    }, {
        ATTRS: {
            title: {
                value: 'Some Title',
                validator: Y.Lang.isString
            },
            term: {
                value: '',
                validator: Y.Lang.isString
            },
            sources: {
                value: []
            }, 
            type: {
                value: 'ht'
            }
        }
    });
}, '0.1', {
    requires: ['base-build', 'widget', 'jit']
});