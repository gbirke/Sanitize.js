Sanitize.js
===============

Sanitize.js is a whitelist-based HTML sanitizer. Given a list of acceptable elements and attributes, Sanitize will remove all unacceptable HTML from a DOM node.

Sanitize.js heavily inspired by the Ruby Sanitize library (http://github.com/rgrove/sanitize). 


Please note
-----------
  - Sanitize.js only cleans up markup! If you allow script tags, style
    or javascript attributes, you are responsible for sanitizing them!
  - If you are using Sanitize.js on the server side, you are responsible for
    HTML parsing and providing a DOM implementation. Sanitize.js expects a
    valid DOM tree. For creating new nodes you must either create the instance 
    with ``option.dom`` and the
    ``options.dom``  object must support DOM document actions. Or you use a
    library like EnvJS (http://www.envjs.com/) to make the ``document`` object
    available in the global scope.

Differences to Sanitize
-----------------------
  - Transformers are not called from the inside out
  - The clean method does not exist, the library always expects a parsed DOM
    document
  - The node given as a parameter to ``clean_node`` is not changed. Instead, a
    sanitized ``DocumentFragment`` is returned.


Known Limitations
-----------------
The style attribute is always dropped on Internet Explorer 5-7.