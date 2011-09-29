/****************************************************************************************************************
 *
 * This is the complete new release of WikiMindMap focused on entirely new technologies
 * The goal is to build a pure javascript application, to make the mindmap pattrern as easy
 * to reuse as possible.
 * 
 *
 * Aknowledged Technologies
 * ========================
 *
 * Used Ressources:
 * ----------------
 * - HTML 5/CSS 3 (Based on Boilerplate Template)
 * - YUI 3
 * - JIT 2
 *
 * Used Tools:
 * -----------
 * - GitHub
 * - Clowd9
 * - Clean CSS
 *
 * API to use the Mindmap TOol
 * ===========================
 * 
 * Requirements: YUI-Core, JIT (can be loaded from Web as Scripts, later I could enhance these progressively in my code)
 *
 * 1) Define the nodetypes and their behavior
 *    Y.wmm.nodetypes[0] = {
 *
 *    }
 *    
 * 2) Define The URL (REST API with JONSP) for all datasources:
 *    Y.wmm.source[0].api = 'http://{wiki}/w/api.php?action=query&titles={term}&format=json&prop=links?callback={callback}'
 *
 * 3) Provide a mapping function to translate the query results to the mindmap structure
 *    Y.wmm.source[].mapping = function(data) {... return wmmdata};
 *
 * sources have the following lteral form:
 * {
 *   'nodename' : 'the rootname of the source',
 *   'api'      : 'url with {wiki}, {term} and {callback} as vairiables',
 *   'mapping'  : function(data, parent) {}
 * }
 * The mappping function gets the parameters function(data, parent)
 * data: the reuslt from the source
 * parent: the node to attach the results to (the might be replaces by a more inteligent concept later, but for now it's fine)
 * A mindmap node has the follwing litteral form:
 * {
 *   id:     : 'someid',
 *   name    : 'displayed name',
 *   children: []
 * }
 */

YUI({
    modules: {
        "jit": {
            fullpath: 'js/libs/jit/2.0.0/jit.js',
            group: 'libs'
        },
        "wmm-mindmap": {
            fullpath: 'js/mindmap.js',
            requires: [ 'base-build', 'widget','jit' ],
            group: 'wmm'
        }
    }

}).use("jsonp", "substitute", "json", "node","wmm-mindmap", function(Y, result) {
     var main = function() {
        Y.one('.yui3-js-enabled').removeClass('yui3-js-enabled');
        // Create our namespace
        Y.namespace('wmm');

        // Define the Datasources and Transformint methods from Source to Mindmapnodes
        var mySources = {
            'links' : {
                'nodename' : 'Links',
                'api' : 'http://{wiki}/w/api.php?action=query&titles={term}&format=json&prop=links&callback={callback}',
                'mapping' :  function(data, parent) {
                    var pnode = parent;
                    var pages = data.query.pages;
                    for(var page in pages){
                        for(var link in pages[page].links){
                            pnode.children[link] = {
                                id : link,
                                name : pages[page].links[link].title,
                                children: []
                            }
                        }
                    }
                    return pnode;
                }
            },
            'extlinks' : {
                'nodename' : 'External links',
                'api' : 'http://{wiki}/w/api.php?action=query&titles={term}&format=json&prop=extlinks&callback={callback}',
                'mapping' :  function(data, parent) {
                    var pnode = parent;
                    var pages = data.query.pages;
                    for(var page in pages){
                        for(var link in pages[page].extlinks){
                            var url = pages[page].extlinks[link]['*'];
                            pnode.children[link] = {
                                id : url,
                                name : url,
                                children: []
                            }
                        }
                    }
                    return pnode;
                }
            }
        };

   
        // Create the mindmap object
        var myMindmap = new Y.wmm.Mindmap({
            title: "Some Text",
            sources: mySources
        }).render("#wmm-mindmap");
    
        Y.one("#search").on('click', function() {
            myMindmap.load();
        });
    }
    Y.on("domready", main);
});
 


/************************************************************************************
 *
 * TODO's
 * ======
 * - Add Function to center the new node
 * - Add Layout
 * - Add Filterfunctions (What should be displayed)
 * - Add a History (Breadcrumps?)
 * - Move Mindmap (as in flash version)
 *
 *
 * NOT TODO's
 * ==========
 * - Layout for mobile devices (a mindmap is drawn on big sheets)
 *
 *
 * Serverside functions (one day not in focus right now)
 * =====================================================
 * - Provide a service for the old WMM Structure
 * - Add a GlobalBrowserInfo Service the store and get Metadata
 * -
 */