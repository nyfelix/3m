/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */


var mySimpleSources = {
    'links' : {
        'nodename' : 'Links',
        'api' : '',
        'mapping' :  function(data, parent) {
            data = {
                "query":{
                    "pages":{
                        "26573":{
                            "pageid":26573,
                            "ns":0,
                            "title":"Rabbit",
                            "links":[{
                                "ns":0,
                                "title":"Abyssinian Hare"
                            },{
                                "ns":0,
                                "title":"Afghan Pika"
                            },{
                                "ns":0,
                                "title":"Africa"
                            },{
                                "ns":0,
                                "title":"African Savanna Hare"
                            },{
                                "ns":0,
                                "title":"Alaskan Hare"
                            },{
                                "ns":0,
                                "title":"Alice's Adventures in Wonderland"
                            },{
                                "ns":0,
                                "title":"Alpine Pika"
                            },{
                                "ns":0,
                                "title":"Altricial"
                            },{
                                "ns":0,
                                "title":"Amami Rabbit"
                            },{
                                "ns":0,
                                "title":"Amami rabbit"
                            }]
                        }
                    }
                },
                "query-continue":{
                    "links":{
                        "plcontinue":"26573|0|Amami \u014cshima"
                    }
                }
            }
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
    'references' : {
        'nodename' : 'References',
        'api' : '',
        'mapping' :  function(data, parent) {
            data = {
                "query":{
                    "pages":{
                        "26573":{
                            "pageid":26573,
                            "ns":0,
                            "title":"Rabbit",
                            "links":[{
                                "ns":0,
                                "title":"Abyssinian Hare"
                            },{
                                "ns":0,
                                "title":"Afghan Pika"
                            },{
                                "ns":0,
                                "title":"Africa"
                            },{
                                "ns":0,
                                "title":"African Savanna Hare"
                            },{
                                "ns":0,
                                "title":"Alaskan Hare"
                            },{
                                "ns":0,
                                "title":"Alice's Adventures in Wonderland"
                            },{
                                "ns":0,
                                "title":"Alpine Pika"
                            },{
                                "ns":0,
                                "title":"Altricial"
                            },{
                                "ns":0,
                                "title":"Amami Rabbit"
                            },{
                                "ns":0,
                                "title":"Amami rabbit"
                            }]
                        }
                    }
                },
                "query-continue":{
                    "links":{
                        "plcontinue":"26573|0|Amami \u014cshima"
                    }
                }
            }
            var pnode = parent;
            var pages = data.query.pages;
            for(var page in pages){
                for(var link in pages[page].links){
                    pnode.children[link] = {
                        id : "R"+link,
                        name : pages[page].links[link].title,
                        children: []
                    }
                }
            }
            return pnode;
        }
    }
}