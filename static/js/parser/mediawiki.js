YUI.add('wmm-parser-mediawiki', function(Y) {
    Y.namespace('wmm').MediaWikiParser = Y.Base.create('mediawikiparser', Y.Base, [], {
        initializer: function() {},
        
        destructor: function() {},
        
        parse: function(raw) {
            var result = {
                name: 'ResultObject',
                data: {},
                children: []
            };
            //raw = removeComments(raw);
            //raw = removeClassInfo(raw);
            //-------------------------------------------------------------------
            // Parse the Topicfile to find WikiLinks
            //-------------------------------------------------------------------
            var rootObject = result;
            var parentObect = rootObject;
            var counter = 0;
            var searchPattern = /\[\[|===|==|\[http:/;
            var currentChapter = null
            // Find the next mediawiki tag which is of interest
            while (raw.search(searchPattern) > -1) {
                // is the next object to parse a section or a wikilink?
                var type = raw.match(searchPattern);
                raw = raw.substr(type.index);
                var newNode = {
                    id: 'raw' + counter,
                    name: '',
                    type: 'link',
                    data: {},
                    children: []
                };
                var nameWithTags;
                //-----------------------------------------
                // Create Chapter Nodes
                //-----------------------------------------
                if (type[0] === "==") {
                    nameWithTags = raw.match(/\==(.*?)==/);
                    raw = raw.substr(nameWithTags[0].length);
                    newNode.name = nameWithTags[1];
                    newNode.type = "chapter";
                    currentChapter = newNode;
                    parentObect = rootObject;
                }
                //-----------------------------------------
                // Create SubChapter Nodes
                //-----------------------------------------
                if (type[0] === "===") {
                    nameWithTags = raw.match(/\===(.*?)===/);
                    raw = raw.substr(nameWithTags[0].length);
                    newNode.name = nameWithTags[1];
                    newNode.type = "subchapter";
                    parentObect = currentChapter;
                }
                //-----------------------------------------
                // Create WikiPage Link Nodes
                //-----------------------------------------
                if (type[0] === "[[") {
                    nameWithTags = raw.match(/\[\[(.*?)\]\]/);
                    raw = raw.substr(nameWithTags[0].length);
                    newNode.name = nameWithTags[1];
                    newNode.type = "wikilink";
                    if (newNode.name.indexOf(':') > -1) {
                        newNode = null;
                    } 
                }
                //-----------------------------------------
                // Create WWW Nodes
                //-----------------------------------------
                if (type[0] === "[http:") {
                    nameWithTags = raw.match(/\[http:(.*?)\]/);
                    raw = raw.substr(nameWithTags[0].length);
                    newNode.name = nameWithTags[1];
                    newNode.type = "wwwlink";
                    newNode = null;
                }
                if (newNode != null) {
                    
                    parentObect.children[parentObect.children.length] = newNode;
                    if (type[0] === "==" || type[0] === "===") {
                        parentObect = newNode;
                    }
                }
                counter++;
            }
            return result;
        }
    }, {
        ATTRS: {}
    });
}, '0.1', {
    requires: ['base']
});