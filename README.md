# Sanitize.js

Sanitize.js is a whitelist-based HTML sanitizer. Given a list of acceptable
elements and attributes, Sanitize.js will remove all unacceptable HTML from a
DOM node.

Using a simple configuration syntax, you can tell Sanitize to allow certain
elements, certain attributes within those elements, and even certain URL
protocols within attributes that contain URLs. Any HTML elements or attributes
that you don't explicitly allow will be removed.

Because it's working directly with the DOM tree, rather than a bunch of
fragile regular expressions, Sanitize.js has no trouble dealing with malformed
or maliciously-formed HTML, and will always output valid HTML or XHTML.

Sanitize.js heavily inspired by the Ruby Sanitize library
(http://github.com/rgrove/sanitize). It tries to port it as faithful as
possible.


**Author**:    Gabriel Birke (mailto:gabriel@lebenplusplus.de)  
**Version**:   1.0   
**Copyright**: Copyright (c) 2010 Gabriel Birke. All rights reserved.  
**License**:   MIT License (http://opensource.org/licenses/mit-license.php)  
**Website**:   http://github.com/gbirke/Sanitize.js  

## Usage

If you don't specify any configuration options, Sanitize will use its
strictest settings by default, which means it will strip all HTML and leave
only text behind.  
HTML:

    <p id="para1"><b><a href="http://foo.com/">foo</a></b><img src="http://foo.com/bar.jpg" /></p>

JavaScript:

    var p = document.getElementById('para1');
    var s = new Sanitize();
    alert(s.clean_node(p)); // => 'foo'

The original node won't be changed, what you get back is a document fragment
with the sanitized child nodes (and their complete contents) of the original
DOM node.

## Configuration

In addition to the ultra-safe default settings that leave just the plain text
behind, Sanitize comes with three other built-in modes. The modes reside in
separate JavaScript files that must loaded additionally to the sanitize.js
file.

### Sanitize.Config.RESTRICTED

Allows only very simple inline formatting markup. No links, images, or block
elements.

    var s = new Sanitize(Sanitize.Config.RESTRICTED);
    alert(s.clean_node(p)); // => '<b>foo</b>'

### Sanitize.Config.BASIC

Allows a variety of markup including formatting tags, links, and lists. Images
and tables are not allowed, links are limited to FTP, HTTP, HTTPS, and mailto
protocols, and a `rel="nofollow"` attribute is added to all links to
mitigate SEO spam.

    var s = new Sanitize(Sanitize.Config.BASIC);
    alert(s.clean_node(p));
    // => '<b><a href="http://foo.com/" rel="nofollow">foo</a></b>'

### Sanitize.Config.RELAXED

Allows an even wider variety of markup than BASIC, including images and tables.
Links are still limited to FTP, HTTP, HTTPS, and mailto protocols, while images
are limited to HTTP and HTTPS. In this mode, `rel="nofollow"` is not
added to links.

    var s = new Sanitize(Sanitize.Config.RELAXED);
    alert(s.clean_node(p));
    // => '<b><a href="http://foo.com/">foo</a></b><img src="http://foo.com/bar.jpg" />'

### Configuration object parameters

If the built-in modes don't meet your needs, you can easily specify a custom
configuration:
    
    var s = new Sanitize({ 
        elements:   ['a', 'span'],
        attributes: { 
            a: ['href', 'title'], 
            span: ['class'] 
        },
        protocols:  { 
            a: { href: ['http', 'https', 'mailto'] }
        }
    });
    s.clean_node(p);


#### add_attributes (Object)

Attributes to add to specific elements. If the attribute already exists, it will
be replaced with the value specified here. Specify all element names and
attributes in lowercase.

    add_attributes: {
        a: {'rel': 'nofollow'}
    }

#### attributes (Object)

Attributes to allow for specific elements. Specify all element names and
attributes in lowercase.

    attributes: {
        a:           ['href', 'title'],
        blockquote:  ['cite'],
        img:         ['alt', 'src', 'title']
    }

If you'd like to allow certain attributes on all elements, use the symbol
`__ALL__` instead of an element name.

    attributes: {
        '__ALL__': ['class'],
        a: ['href', 'title']
    }

#### allow_comments (boolean)

Whether or not to allow HTML comments. Allowing comments is strongly
discouraged, since IE allows script execution within conditional comments. The
default value is `false`.

#### dom (DOM document)

An object that implements a DOM document interface. It is mainly used to
create new element, attribute and document fragment nodes.

If you are using Sanitize in the browser, this will default to the global
`document` variable. If you are using it on the server side, you must provide
your own DOM implementation.

#### elements (Array)

Array of element names to allow. Specify all names in lowercase.

    elements: [
        'a', 'b', 'blockquote', 'br', 'cite', 'code', 'dd', 'dl', 'dt', 'em',
        'i', 'li', 'ol', 'p', 'pre', 'q', 'small', 'strike', 'strong', 'sub',
        'sup', 'u', 'ul'
    ]

#### protocols (Object)

URL protocols to allow in specific attributes. If an attribute is listed here
and contains a protocol other than those specified (or if it contains no
protocol at all), it will be removed.

    protocols: {
        a:   { href: ['ftp', 'http', 'https', 'mailto']},
        img: { src:  ['http', 'https']}
    }

If you'd like to allow the use of relative URLs which don't have a protocol,
include the variable `Sanitize.RELATIVE` in the protocol array:

    protocols: {
        a: { href: ['http', 'https', Sanitize.RELATIVE]}
    }

Note however, that the HTML parser of Internet Explorer automatically converts
relative URLs into absolute URLs with http protocol.

#### remove_contents (boolean or Array)

If set to `true`, Sanitize will remove the contents of any non-whitelisted
elements in addition to the elements themselves. By default, Sanitize leaves the
safe parts of an element's contents behind when the element is removed.

If set to an Array of element names, then only the contents of the specified
elements (when filtered) will be removed, and the contents of all other filtered
elements will be left behind.

The default value is `false`.

#### transformers (Array)

See below.

### Transformers

Transformers allow you to filter and alter nodes using your own custom logic, on
top of (or instead of) Sanitize's core filter. A transformer is a function that
returns either `null` or an Object containing certain optional response values.

To use one or more transformers, pass them to the `transformers` config setting:

    var s = new Sanitize({ transformers: [transformer_one, transformer_two]});

#### Input

Each registered transformer function will be called once for
each element node in the HTML, and will receive as an argument an environment
Object that contains the following items:

`allowed_elements`
:  Object with whitelisted element names as keys, to facilitate fast lookups of
   whitelisted elements.

`config`
:  The current Sanitize configuration Hash.

`dom`
:  A DOM document object. 

`node`
  A DOM node object representing an HTML element.

`node_name`
:  The name of the current HTML node, always lowercase (e.g. "div" or "span").

`whitelist_nodes`
:  Array of DOM nodes that have already been whitelisted by
   previous transformers, if any.

#### Processing

Each transformer has full access to the DOM node that's passed into it and to
the rest of the document via the node's DOM methods method. Any changes will
be passed on to subsequently-called transformers and to Sanitize itself. A
transformer may even call Sanitize internally to perform custom sanitization
if needed. Nodes are passed into transformers in the order in which they're
traversed.

Transformers have a tremendous amount of power, including the power to
completely bypass Sanitize's built-in filtering. Be careful!

#### Output

A transformer may return either `null` or an Object. A return value of `null`
indicates that the transformer does not wish to act on the current node in any
way. A returned Object may contain the following items, all of which are optional:

`attr_whitelist`
:  Array of attribute names to add to the whitelist for the current node, in
   addition to any whitelisted attributes already defined in the current config.

`node`
:  DOM node object that should replace the current node. All
   subsequent transformers and Sanitize itself will receive this new node.

`whitelist`
:  If `true`, the current node (and only the current node) will be whitelisted,
   regardless of the current Sanitize config.

`whitelist_nodes`
:  Array of specific DOM node objects to whitelist, anywhere in the
   document, regardless of the current Sanitize config.

## Known Bugs and Limitations
* The `style` attribute is always dropped on Internet Explorer 5-7. 
* Internet Explorer always converts relative URL values to absolute URLs.

## Contributors

The following lovely people have contributed to Sanitize in the form of patches
or ideas that later became code:

* Gabriel Birke <gabriel@lebenplusplus.de>
* Ryan Grove <ryan@wonko.com> - Original author of the Ruby Sanitize library

## License

Copyright (c) 2010 Gabriel Birke <gabriel@lebenplusplus.de>

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the 'Software'), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
