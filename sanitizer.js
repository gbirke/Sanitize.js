function Sanitizer(){
  var i, e, options;
  options = arguments[0] || {}
  this.options = {}
  this.options.elements = options.elements ? options.elements : [];
  this.options.attributes = options.attributes ? options.attributes : {}
  this.options.allow_comments = options.allow_comments ? options.allow_comments : false;
  this.allowed_elements = {}
  for(i=0;i<this.options.elements.length;i++) {
    this.allowed_elements[this.options.elements[i]] = true;
  }
  this.allowed_attributes = {}
  for(e in this.options.attributes) {
      this.allowed_attributes[e] = {}
      for(i=0;i<this.options.attributes[e].length;i++) {
          this.allowed_attributes[e][this.options.attributes[e][i]] = true;
      }
  }
}

Sanitizer.prototype.clean = function(container) {
  var fragment = document.createDocumentFragment();
  var currentElement = fragment;
  var sanitizer = this;
  
  function _clean(elem) {

    var i, parentElement, name, attr;
    switch(elem.nodeType) {
      // Element
      case 1:
        
        
        // check if element itself is allowed
        parentElement = currentElement;
        name = elem.nodeName.toLowerCase();
        if(sanitizer.allowed_elements[name]) {
            currentElement = document.createElement(elem.nodeName);
            parentElement.appendChild(currentElement);
            
          // clean attributes
          if(sanitizer.allowed_attributes[name]) {
              for(i=0;i<elem.attributes.length;i++) {
                  attr = elem.attributes[i];
                  if(sanitizer.allowed_attributes[name][attr.nodeName]) {
                      currentElement.setAttribute(attr.nodeName, attr.nodeValue)
                  }
              }
          }
        }

        // iterate over child nodes
        for(i=0;i<elem.childNodes.length;i++) {
          _clean(elem.childNodes[i]);
        }
        // some versions of IE don't support normalize.
        if(currentElement.normalize) {
          currentElement.normalize();
        }
        currentElement = parentElement;
        
        break;
      // Attribute
      case 2:
        // check if attribute name is in whitelist for this element
        break;
      // Text
      case 3:
        // TODO: replace unwanted text
        var clone = elem.cloneNode(false);
        currentElement.appendChild(clone);
        break;
      // Entity-Reference (normally not used)
      case 5:
        var clone = elem.cloneNode(false);
        currentElement.appendChild(clone);
        break;
      // Comment
      case 8:
        if(sanitizer.options.allow_comments) {
          var clone = elem.cloneNode(false);
          currentElement.appendChild(clone);
        }
      default:
        //console.log("unknown node type", elem.nodeType) 
    }
 
  }
  
  for(i=0;i<container.childNodes.length;i++) {
    _clean(container.childNodes[i]);
  }
  
  if(fragment.normalize) {
    fragment.normalize();
  }
  
  return fragment;
  
}