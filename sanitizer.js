function Sanitizer(){
  var i, e, options;
  options = arguments[0] || {}
  this.options = {}
  this.options.elements = options.elements ? options.elements : [];
  this.options.attributes = options.attributes ? options.attributes : {};
  this.options.attributes[Sanitizer.ALL] = this.options.attributes[Sanitizer.ALL] ? this.options.attributes[Sanitizer.ALL] : [];
  this.options.allow_comments = options.allow_comments ? options.allow_comments : false;
  this.allowed_elements = {};
  this.options.protocols = options.protocols ? options.protocols : {};
  this.options.add_attributes = options.add_attributes ? options.add_attributes  : {};
  this.dom = options.dom ? options.dom : document;
  for(i=0;i<this.options.elements.length;i++) {
    this.allowed_elements[this.options.elements[i]] = true;
  }
  this.remove_element_contents = {};
  this.remove_all_contents = false;
  if(options.remove_contents) {
    
    if(options.remove_contents instanceof Array) {
      for(i=0;i<options.remove_contents.length;i++) {
        this.remove_element_contents[options.remove_contents[i]] = true;
      }
    }
    else {
      this.remove_all_contents = true;
    }
  }
  
}

Sanitizer.REGEX_PROTOCOL = /^([A-Za-z0-9\+\-\.\&\;\#\s]*?)(?:\:|&#0*58|&#x0*3a)/i
Sanitizer.RELATIVE = '__relative__'; // emulate Ruby symbols with string constants
Sanitizer.ALL = '__ALL__';

Sanitizer.prototype.clean = function(container) {
  var dom = this.dom;
  var fragment = dom.createDocumentFragment();
  var current_element = fragment;
  var sanitizer = this;

  /**
   * Utility function to check if an element exists in an array
   */
  function _array_index(needle, haystack) {
    var i;
    for(i=0; i < haystack.length; i++) {
      if(haystack[i] == needle) 
        return i;
    }
    return -1;
  }
  
  function _merge_arrays_uniq() {
    var result = [];
    var uniq_hash = {}
    var i,j;
    for(i=0;i<arguments.length;i++) {
      if(!arguments[i] || !arguments[i].length)
        continue;
      for(j=0;j<arguments[i].length;j++) {
        if(uniq_hash[arguments[i][j]])
          continue;
        uniq_hash[arguments[i][j]] = true;
        result.push(arguments[i][j]);
      }
    }
    return result;
  }
  
  /**
   * Clean function that checks the different node types and cleans them up accordingly
   * @param elem DOM Node to clean
   */
  function _clean(elem) {
    var clone;
    switch(elem.nodeType) {
      // Element
      case 1:
        _clean_element(elem)
        break;
      // Text
      case 3:
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
  
  function _clean_element(elem) {
    var i, j, parentElement, name, allowed_attributes, attr, attr_name, attr_node, protocols, del, attr_ok;
    // TODO: call transformers
    
    // check if element itself is allowed
    parentElement = current_element;
    name = elem.nodeName.toLowerCase();
    if(sanitizer.allowed_elements[name]) {
        current_element = dom.createElement(elem.nodeName);
        parentElement.appendChild(current_element);
        
      // clean attributes
      allowed_attributes = _merge_arrays_uniq(
        sanitizer.options.attributes[name],
        sanitizer.options.attributes[Sanitizer.ALL]
      );
      for(i=0;i<allowed_attributes.length;i++) {
        attr_name = allowed_attributes[i];
        attr = elem.attributes[attr_name];
        if(attr) {
            attr_ok = true;
            // Check protocol attributes for valid protocol
            if(sanitizer.options.protocols[name] && sanitizer.options.protocols[name][attr_name]) {
              protocols = sanitizer.options.protocols[name][attr_name];
              del = attr.nodeValue.toLowerCase().match(Sanitizer.REGEX_PROTOCOL);
              if(del) {
                attr_ok = (_array_index(del[1], protocols) != -1);
              }
              else {
                attr_ok = (_array_index(Sanitizer.RELATIVE, protocols) != -1);
              }
            }
            if(attr_ok) {
              attr_node = document.createAttribute(attr_name);
              attr_node.value = attr.nodeValue;
              current_element.setAttributeNode(attr_node);
            }
        }
      }
      
      // Add attributes
      if(sanitizer.options.add_attributes[name]) {
        for(attr_name in sanitizer.options.add_attributes[name]) {
          attr_node = document.createAttribute(attr_name);
          attr_node.value = sanitizer.options.add_attributes[name][attr_name];
          current_element.setAttributeNode(attr_node);
        }
      }
    } // End checking if element is allowed

    // iterate over child nodes
    if(!sanitizer.remove_all_contents && !sanitizer.remove_element_contents[name]) {
      for(i=0;i<elem.childNodes.length;i++) {
        _clean(elem.childNodes[i]);
      }
    }
    
    // some versions of IE don't support normalize.
    if(current_element.normalize) {
      current_element.normalize();
    }
    current_element = parentElement;
  } // END clean_element function
  
  for(i=0;i<container.childNodes.length;i++) {
    _clean(container.childNodes[i]);
  }
  
  if(fragment.normalize) {
    fragment.normalize();
  }
  
  return fragment;
  
}