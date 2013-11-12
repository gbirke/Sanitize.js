(function($) {
  
  var fixtureCount=0;
  
    function cleanup(Sanitize, fixtureName) {
      fixtureCount++;
      var clean = Sanitize.clean_node(document.getElementById(fixtureName));
      var result = $('<div id="result-'+fixtureCount+'"></div>').appendTo($('#resultHTML'));
      return result.append(clean);
    }
    
  test('Default settings return only text nodes', function() {
      var s = new Sanitize();
      var result = cleanup(s, 'paragraph');
      
      equal($('p', result).length, 0, 'All paragraphs are removed');
      equal($.trim(result.text()), 'A Paragraph', 'Text remains');
      equal(result.contents().length, 1, 'Contains only one text node');
      
  });

  test('Whitelisted elements remain, other elements are removed', function() {
      var s = new Sanitize({elements:['p']});
      var result = cleanup(s, 'smallexample');
      equal($('p', result).length, 2, 'All paragraphs remain');
      equal($('em', result).length, 0, 'Emphasis removed');
      equal($('a', result).length, 0, 'Link removed');
  });
  
  test('Whitelisted attributes are preserved, other attributes are removed', function() {
      var s = new Sanitize({elements:['p'], attributes:{p:['class']}});
      var result = cleanup(s, 'attributes');
      equal($('p[class]', result).length, 2, 'All class attributes of paragraphs remain');
      equal($('p[id]', result).length, 0, 'ID attribute is removed');
  });
  
  test('Attributes can be preserved for all elements', function() {
      var s = new Sanitize({elements:['p', 'span'], attributes:{
        __ALL__:['class'],
        p:['id']
      }});
      var result = cleanup(s, 'attributes');
      equal($('p[class]', result).length, 2, 'All class attributes of paragraphs remain');
      equal($('p[id]', result).length, 1, 'Allowed attribute arrays are merged');
      equal($('span[class]', result).length, 1, 'Class attribute of span remains');
  });

  test('Symbol ALL can be overriden', function() {
      Sanitize.ALL = 'all';

      var s = new Sanitize({elements:['p'], attributes:{
        all:['class']
      }});
      var result = cleanup(s, 'attributes');
      equal($('p[class]', result).length, 2, 'All class attributes of paragraphs remain');
  });

  test('Comments can be preserved', function(){
      var s = new Sanitize();
      var result = cleanup(s, 'entitiesAndComments');
      equal(result.contents().length, 1, 'Comment node is removed');
      var s = new Sanitize({allow_comments:true});
      var result = cleanup(s, 'entitiesAndComments');
      var comments = $.grep(result.contents(), function(elem){return elem.nodeType == 8});
      equal(comments.length, 1, 'Comment node is preserved');
  });

  test('Attributes with protocols that are not allowed are removed', function() {
      var options = {
        elements:['a'],
        attributes:{a:['href']},
        protocols:{ 
          a: { href: ['http'] }
        }
      }
      var s = new Sanitize(options);
      var result = cleanup(s, 'protocolLinks');
      var hrefcount = $.support.hrefNormalized ? 1 : 2; // IE turns relative paths to attributes
      equal($("a[href^='http://']", result).length, hrefcount , 'HTTP protocol is preserved');
      equal($("a[href^='chrome://']", result).length, 0, 'chrome protocol is removed');
      equal($("a[href^='file://']", result).length, 0, 'file protocol is removed');
      equal($("a[href^='../']", result).length, 0, 'relative path is removed');
      equal($("a[href^='javascript']", result).length, 0, 'javascript is removed');
  });
  
  test('Attributes with protocols that are allowed are preserved', function() {
      var options = {
        elements:['a'],
        attributes:{a:['href']},
        protocols:{ 
          a: { href: ['http', 'file', Sanitize.RELATIVE] }
        }
      }
      var s = new Sanitize(options);
      var result = cleanup(s, 'protocolLinks');
      var hrefcount = $.support.hrefNormalized ? 1 : 2; // IE turns relative paths to attributes
      var relcount = $.support.hrefNormalized ? 1 : 0; 
      equal($("a[href^='http://']", result).length, hrefcount, 'HTTP protocol is preserved');
      equal($("a[href^='chrome://']", result).length, 0, 'chrome protocol is removed');
      equal($("a[href^='file://']", result).length, 1, 'file protocol is preserved');
      equal($("a[href^='../']", result).length, relcount, 'relative path is preserved');
      equal($("a[href^='javascript']", result).length, 0, 'javascript is removed');
  });
  
  test('Attributes are added', function() {
      var options = {
        elements:['a'],
        attributes:{a:['href']},
        add_attributes:{ 
          a: { rel: 'nofollow' }
        }
      }
      var s = new Sanitize(options);
      var result = cleanup(s, 'protocolLinks');
      equal($("a[rel]", result).length, 5, 'rel attribute is added');
  });
  
  test('Added Attributes are overwritten even when original attributes are preserved', function() {
      var options = {
        elements:['p'],
        attributes:{p:['class']},
        add_attributes:{ 
          p: { class: 'yellow' }
        }
      }
      var s = new Sanitize(options);
      var result = cleanup(s, 'attributes');
      equal($("p[class='yellow']", result).length, 2, 'class attribute is rewritten');
  });
  
  test('Remove all content from allowed elements', function() {
       var s = new Sanitize({elements:['p', 'a', 'em'], remove_contents:true});
       var result = cleanup(s, 'smallexample');
       equal($("p", result).text(), '', 'Text content is removed');
       equal($("a,em", result).length, 0, 'Child elements are removed');
  });
   
  test('Remove content from specific allowed elements', function() {
        var s = new Sanitize({elements:['p', 'a', 'em'], remove_contents:['em', 'a']});
        var result = cleanup(s, 'smallexample');
        equal($("a", result).text(), '', 'Text content is removed from links');
        equal($("em", result).text(), '', 'Text content is removed from emphasis');
  });
    
  test('Transformers can whitelist current node', function() {
          var s = new Sanitize({transformers:[function(input){
            if(input.node_name == 'p') 
              return {whitelist: true}
          }]});
          var result = cleanup(s, 'smallexample');
          equal($("p", result).length, 2, 'Paragraphs whitelisted');
          equal($("a,em", result).length, 0, 'Child elements are removed');
  });
  
  test('Transformers can whitelist nodes', function() {
          var s = new Sanitize({transformers:[function(input){
              if(input.node_name == 'p' || input.node_name == 'em')
                return {whitelist_nodes: [input.node]}
          }]});
          var result = cleanup(s, 'smallexample');
          equal($("p", result).length, 2, 'Paragraphs whitelisted');
          equal($("em", result).length, 1, 'Emphasis whitelisted');
          equal($("a", result).length, 0, 'Link not whitelisted');
  });
  
  test('Transformers can whitelist attributes of current node', function() {
          var s = new Sanitize({elements:['p'], transformers:[function(input){
            if(input.node_name == 'p' && input.node.attributes['id'] && 
              input.node.attributes['id'].nodeValue == 'exampleId') 
              return {attr_whitelist: ['class']}
          }]});
          var result = cleanup(s, 'attributes');
          equal($("p", result).length, 2, 'Paragraphs whitelisted');
          equal($("p[class='odd']", result).length, 1, 'class of paragraph with exampleId was whitelisted');
          equal($("p[class='even']", result).length, 0, 'class of paragraph without id was removed');
          
  });
  
  test('Whitelisted attributes of multiple transformers are cumulative', function() {
          var s = new Sanitize({
            elements:['p', 'span'], 
            transformers:[
              function(input){
                return {attr_whitelist: ['class']}
              },
              function(input){
                return {attr_whitelist: ['id']}
              }
            ]
          });
          var result = cleanup(s, 'attributes');
          equal($("*[class]", result).length, 3, 'class attributes whitelisted');
          equal($("*[id]", result).length, 1, 'id attributes are whitelisted');
  });
  
  test('Transformers can replace nodes', function() {
          var s = new Sanitize({
            elements:['div', 'p'],
            transformers:[function(input){
              if(input.node_name == 'p')
              return { node: input.dom.createElement('div')}
          }]});
          var result = cleanup(s, 'smallexample');
          equal($("p", result).length, 0, 'Paragraphs are removed');
          equal($("div", result).length, 2, 'Paragraphs are replaced by DIVs, which are preserved');
  });

})(jQuery);
    