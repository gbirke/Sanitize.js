function Sanitizer(){
  var i, e, options;
  options = arguments[0] || {}
  this.options = {}
  this.options.elements = options.elements ? options.elements : [];
  this.options.attributes = options.attributes ? options.attributes : {}
  this.options.allow_comments = options.allow_comments ? options.allow_comments : false;
  this.allowed_elements = {}
  this.dom = options.dom ? options.dom : document;
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
  var dom = this.dom;
  var fragment = dom.createDocumentFragment();
  var current_element = fragment;
  var sanitizer = this;

  
  function _clean(elem) {

    var i, parentElement, name, attr, attr_name, attr_node;
    switch(elem.nodeType) {
      // Element
      case 1:
        
        // check if element itself is allowed
        parentElement = current_element;
        name = elem.nodeName.toLowerCase();
        if(sanitizer.allowed_elements[name]) {
            current_element = dom.createElement(elem.nodeName);
            parentElement.appendChild(current_element);
            
          // clean attributes
          if(sanitizer.options.attributes[name]) {
              var allowed_attributes = sanitizer.options.attributes[name];
              for(i=0;i<allowed_attributes.length;i++) {
                attr_name = allowed_attributes[i];
                attr = elem.attributes[attr_name];
                if(attr) {
                    
                    // TODO: Check protocol attributes for valid protocol
                    
                    attr_node = document.createAttribute('class');
                    attr_node.value = attr.nodeValue
                    current_element.setAttributeNode(attr_node);
                }
              }
          }
          
          // TODO: Add attributes
        }

        // iterate over child nodes
        for(i=0;i<elem.childNodes.length;i++) {
          _clean(elem.childNodes[i]);
        }
        // some versions of IE don't support normalize.
        if(current_element.normalize) {
          current_element.normalize();
        }
        current_element = parentElement;
        
        break;
      // Attribute
      case 2:
        // check if attribute name is in whitelist for this element
        break;
      // Text
      case 3:
        // TODO: replace unwanted text
        var clone = elem.cloneNode(false);
        current_element.appendChild(clone);
        break;
      // Entity-Reference (normally not used)
      case 5:
        var clone = elem.cloneNode(false);
        current_element.appendChild(clone);
        break;
      // Comment
      case 8:
        if(sanitizer.options.allow_comments) {
          var clone = elem.cloneNode(false);
          current_element.appendChild(clone);
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