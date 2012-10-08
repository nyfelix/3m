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
                this._initJitGraph('st');
            },
            
            bindUI: function() {},
            
            syncUI: function() {},
            
            load: function(query) {
                var sources = this.get('sources');
                // Reset data
                this._data = {
                    id: '0',
                    name: Y.one('#term').get('value'),
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
                                    args.source.mapping(o, args.parent);
                                    args.context._jitGraph.loadJSON(args.context._data);
                                    args.context._jitGraph.refresh(); 
                                    args.context._jitGraph.compute();  
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
                    var config = {
                        //id of the visualization container
                        injectInto: 'mindmap',
                        //
                        //canvas width and height, later user Y.layout for these things
                        width: parseInt(Y.one('#wmm-mindmap').getComputedStyle('width')),
                        height: parseInt(Y.one('#wmm-mindmap').getComputedStyle('height')),
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
                            style.display = '';
                            style.cursor = 'pointer';
                            if (node._depth <= 1) {
                                style.fontSize = "0.8em";
                                style.color = "#000000";
                            }
                            else if (node._depth == 2) {
                                style.fontSize = "0.7em";
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
                    var config = {
                        //id of viz container element  
                        injectInto: 'mindmap',
                        //set duration for the animation  
                        duration: 800,
                        //set animation transition type  
                        transition: $jit.Trans.Quart.easeInOut,
                        //set distance between node and its children  
                        levelDistance: 50,
                        //enable panning  
                        Navigation: {
                            enable: true,
                            panning: true
                        },
                        //set node and edge styles  
                        //set overridable=true for styling individual  
                        //nodes or edges  
                        Node: {
                            height: 20,
                            width: 60,
                            type: 'rectangle',
                            color: '#aaa',
                            overridable: true
                        },
                        Edge: {
                            type: 'bezier',
                            overridable: true
                        },
                        onBeforeCompute: function(node) {
                            Y.log.write("loading " + node.name);
                        },
                        onAfterCompute: function() {
                            Y.log.write("done");
                        },
                        //This method is called on DOM label creation.  
                        //Use this method to add event handlers and styles to  
                        //your node.  
                        onCreateLabel: function(label, node) {
                            label.id = node.id;
                            label.innerHTML = node.name;
                            label.onclick = function() {
                                if (normal.checked) {
                                    st.onClick(node.id);
                                }
                                else {
                                    st.setRoot(node.id, 'animate');
                                }
                            };
                            //set label styles  
                            var style = label.style;
                            style.width = 60 + 'px';
                            style.height = 17 + 'px';
                            style.cursor = 'pointer';
                            style.color = '#333';
                            style.fontSize = '0.8em';
                            style.textAlign = 'center';
                            style.paddingTop = '3px';
                        },
                        //This method is called right before plotting  
                        //a node. It's useful for changing an individual node  
                        //style properties before plotting it.  
                        //The data properties prefixed with a dollar  
                        //sign will override the global node style properties.  
                        onBeforePlotNode: function(node) {
                            //add some color to the nodes in the path between the  
                            //root node and the selected node.  
                            if (node.selected) {
                                node.data.$color = "#ff7";
                            }
                            else {
                                delete node.data.$color;
                                //if the node belongs to the last plotted level  
                                if (!node.anySubnode("exist")) {
                                    //count children number  
                                    var count = 0;
                                    node.eachSubnode(function(n) {
                                        count++;
                                    });
                                    //assign a node color based on  
                                    //how many children it has  
                                    node.data.$color = ['#aaa', '#baa', '#caa', '#daa', '#eaa', '#faa'][count];
                                }
                            }
                        },
                        //This method is called right before plotting  
                        //an edge. It's useful for changing an individual edge  
                        //style properties before plotting it.  
                        //Edge data proprties prefixed with a dollar sign will  
                        //override the Edge global style properties.  
                        onBeforePlotLine: function(adj) {
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
            }
        }, {
            ATTRS: {
                title: {
                    value: 'Some Title',
                    validator: Y.Lang.isString
                },
                sources: {
                    value: []
                }
            }
        });
    }, '0.1', {
        requires: ['base-build', 'widget', 'jit']
    });