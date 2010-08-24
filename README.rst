Sanitizer_JS
===============


Sanitizer_JS is a JavaScript port of the Ruby Sanitize (http://github.com/rgrove/sanitize) library. It can be used on the server and on the client side for sanitizing user input.

Please note
-----------
  - Sanitizer_JS only cleans up markup! If you allow script tags or style
    attributes, you are responsible for sanitizing them!
  - If you are using Sanitizer_JS on the server side, you are responsible for
    HTML parsing. Sanitizer _JS expects a valid DOM tree. For creating new
    nodes you must either create the instance with ``option.dom`` and the
    ``options.dom``  object must support DOM document actions. Or you use a
    library like EnvJS (http://www.envjs.com/) to make the ``document`` object
    available in the global scope.

Differences to Sanitize
-----------------------
  - Transformers are not called from the inside out
  - The clean method does not exist, the library always expects a parsed 

Known Limitations
-----------------
The style attribute is always dropped on Internet Explorer 5-7.