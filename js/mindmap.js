/* 
 * This is the Mindmap Widget. It takes your Services and Nodes and renders them to
 * a breathtaking awesome mindmap :-)
 */


YUI.add('wmm-mindmap', function (Y) {


    Y.namespace('wmm').Mindmap = Y.Base.create('mindmap', Y.Widget, [], {

        DISPLAY_TEMPLATE: '<p>{title}</p>',

        _localMemner: null,
        _jitGraph : null,
        _data:null,

        initializer: function () {
            
        },

        destructor: function () {
           
        },

        renderUI: function () {
            this._initJitGraph();
            var content = this.get('contentBox');
            
        },

        bindUI: function () {

        },

        syncUI: function () {
       
        },

        load: function() {
            var sources = this.get('sources');
            // Reset data
            this._data = {
                id : '0',
                name : Y.one('#term').get('value'),
                children : []
            };


            for(var s in sources){
                var i = this._data.children.length
                this._data.children[i] = {
                    id : s,
                    name : sources[s].nodename,
                    children : []
                }
                if (sources[s].api != '') {
                    var url = Y.Lang.substitute(sources[s].api,{
                        wiki : Y.one('#wiki').get('value'),
                        term : Y.one('#term').get('value')
                    });
                    // chekc how to do the callback correctly
                    Y.jsonp(url, {
                        on: {
                            success: function (o, args) {
                                args.source.mapping(o, args.parent);
                                args.context._jitGraph.loadJSON(args.context._data);
                                args.context._jitGraph.refresh();
                            }
                        },
                        args: {
                            parent: this._data.children[i],
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
    

        _initJitGraph : function() {
            this._jitGraph =  new $jit.Hypertree({
                //id of the visualization container
                injectInto: 'mindmap',
                //canvas width and height, later user Y.layout for these things
                width: 1000,
                height: 600,
                //Change node and edge styles such as
                //color, width and dimensions.
                Node: {
                    dim: 9,
                    color: "#ff00cc"
                },
                Edge: {
                    lineWidth: 2,
                    color: "#088"
                },
                onBeforeCompute: function(node){
                    Log.write("centering");
                },
                //Attach event handlers and add text to the
                //labels. This method is only triggered on label
                //creation
                onCreateLabel: function(domElement, node){
                    domElement.innerHTML = node.name;
                    $jit.util.addEvent(domElement, 'click', function () {
                        Y.wmm.mindmap.onClick(node.id);
                    });
                },
                //Change node styles when labels are placed
                //or moved.
                onPlaceLabel: function(domElement, node){
                    var style = domElement.style;
                    style.display = '';
                    style.cursor = 'pointer';
                    if (node._depth <= 1) {
                        style.fontSize = "0.8em";
                        style.color = "#000000";

                    } else if(node._depth == 2){
                        style.fontSize = "0.7em";
                        style.color = "#555";

                    } else {
                        style.display = 'none';
                    }

                    var left = parseInt(style.left);
                    var w = domElement.offsetWidth;
                    style.left = (left - w / 2) + 'px';
                    Y.one(domElement).on('click', function () {
                       Y.one('#term').set('value', 'TEST')
                    });
                },

                onAfterCompute: function(){
                    Log.write("done");

                    //Build the right column relations list.
                    //This is done by collecting the information (stored in the data property)
                    //for all the nodes adjacent to the centered node.
                    var node = Y.wmm.mindmap.graph.getClosestNodeToOrigin("current");
                    var html = "<h4>" + node.name + "</h4><b>Connections:</b>";
                    html += "<ul>";
                    node.eachAdjacency(function(adj){
                        var child = adj.nodeTo;
                        if (child.data) {
                            var rel = (child.data.band == node.name) ? child.data.relation : node.data.relation;
                            html += "<li>" + child.name + " " + "<div class=\"relation\">(relation: " + rel + ")</div></li>";
                        }
                    });
                    html += "</ul>";
                    $jit.id('inner-details').innerHTML = html;
                }
            });
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
    })

}, '0.1', {
    requires: ['base-build', 'widget']
});
