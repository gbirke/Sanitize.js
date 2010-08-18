
(function($) {
  
  var fixtureCount=0;
  
    function cleanup(sanitizer, fixtureName) {
      fixtureCount++;
      var clean = sanitizer.clean(document.getElementById(fixtureName));
      var result = $('#resultHTML');
      return result.empty().append(clean);
    }
    
  test('Default settings return only text nodes', function() {
      var s = new Sanitizer();
      var result = cleanup(s, 'paragraph');
      
      equal($('p', result).length, 0, 'All paragraphs are removed');
      equal($.trim(result.text()), 'A Paragraph', 'Text remains');
      equal(result.contents().length, 1, 'Contains only one text node');
      
  });

  test('Whitelisted elements remain, other elements are removed', function() {
      var s = new Sanitizer({elements:['p']});
      var result = cleanup(s, 'smallexample');
      equal($('p', result).length, 2, 'All paragraphs remain');
      equal($('em', result).length, 0, 'Emphasis removed');
      equal($('a', result).length, 0, 'Link removed');
  });
  
  test('Whitelisted attributes are preserved, other attributes are removed', function() {
      var s = new Sanitizer({elements:['p'], attributes:{p:['class']}});
      var result = cleanup(s, 'attributes');
      equal($('p[class]', result).length, 2, 'All paragraphs with attributes remain');
      equal($('p[id]', result).length, 0, 'ID attribute is removed');
  });
  
  test('Comments can be preserved', function(){
      var s = new Sanitizer();
      var result = cleanup(s, 'entitiesAndComments');
      equal(result.contents().length, 1, 'Comment node is removed');
      var s = new Sanitizer({allow_comments:true});
      var result = cleanup(s, 'entitiesAndComments');
      // Check for 3 nodes because there is a text node with lien break after the comment
      equal(result.contents().length, 3, 'Comment node is preserved'); 
  });

})(jQuery);
    