//
// Utilities functions used on highlighted terms
//

function goto_glossary_definition(definition_index) {
    url = related_glossary_definitions[definition_index]["url"];
    document.location = url;
}

function show_glossary_definition_popup(node, definition_index) {
    popup_node = document.createElement("div");
    popup_node.setAttribute('id', "glossary-definition-popup");

    // Add title
    title_text = related_glossary_definitions[definition_index]["title"];
    title_node = document.createElement("h6");
    title_node.appendChild(document.createTextNode(title_text));
    popup_node.appendChild(title_node);

    // Add description
    description_text = related_glossary_definitions[definition_index]["description"];
    description_node = document.createElement("p");

    // Replace \n by <br /> tags
    texts = description_text.split('\n')

    for (i=0; i<texts.length; i++) {
        text = texts[i];
        description_node.appendChild(document.createTextNode(text));
        description_node.appendChild(document.createElement("br"));
    }

    popup_node.appendChild(description_node);
    if (related_glossary_definitions[definition_index]["has_text"]=='1') {
        read_more = document.createElement("p");
        read_more.className = 'read-more';
        read_more.appendChild(document.createTextNode('mehr lesen ...'));
        popup_node.appendChild(read_more);
    }

    node.className = node.className + " glossaryPopupPosition";
    node.appendChild(popup_node);
}

function hide_glossary_definition_popup(node, definition_index) {
    popup_node = document.getElementById("glossary-definition-popup");
    if (popup_node) {
        node.removeChild(popup_node);
    }
    node.className = "highlightedGlossaryTerm";
}

//
// Dig into all glossary definition
//

function CBrowser()
{
    var ua, s, i;

    this.isIE = false; // Internet Explorer
    this.isNS = false; // Netscape
    this.isOP = false; // Opera
    this.version = null;

    ua = navigator.userAgent;

    s = "Opera";
    if ((i = ua.indexOf(s)) >= 0) {
        this.isOP = true;
        this.version = 7;
        return;
    }

    s = "MSIE";
    if ((i = ua.indexOf(s)) >= 0) {
        this.isIE = true;
        this.version = parseFloat(ua.substr(i + s.length));
        return;
    }
    s = "Netscape6/";
    if ((i = ua.indexOf(s)) >= 0) {
        this.isNS = true;
        this.version = parseFloat(ua.substr(i + s.length));
        return;
    }

    // Treat any other "Gecko" browser as NS 6.1.

    s = "Gecko";
    if ((i = ua.indexOf(s)) >= 0) {
        this.isNS = true;
        this.version = 6.1;
        return;
    }
}

var browser_info = new CBrowser();
var related_glossary_definitions = new Array();

function add_related_glossary_definition(title, description, url, terms, show, has_text) {
    var definition = new Array();
    definition["title"] = title;
    definition["description"] = description;
    definition["url"] = url;
    definition["terms"] = terms;
    definition["show"] = show;
    definition["has_text"] = has_text;
    related_glossary_definitions.push(definition);
}

function highlight_related_glossary_term_in_text(node, word, definition_index) {

    var class_name = "highlightedGlossaryTerm";
    var parent_node = node.parentNode;
    //glossary inserted node, don't process
    if (parent_node.className == class_name) {
        return;
    }

    var lword = word.toLowerCase();
    var content_value = node.nodeValue;
    var lcontent_value = content_value.toLowerCase();
    var word_bounds = new Array();
    // Write 3 regexps to replace one because it doesn't work on IE: '\\b' + lword + '\\b'
    word_bounds.push('^' + lword + '$'); // word is the sentence
    word_bounds.push('\\W' + lword + '\\W'); // word is included in a sentence
    word_bounds.push('^' + lword + '\\W'); // word is begining a sentence
    word_bounds.push('\\W' + lword + '$'); // word is finishing a sentence
    var index = -1;

    // Check each regexps
    for (var i=0; i<word_bounds.length;i++) {
        index = lcontent_value.search(word_bounds[i]);
        if (index != -1) {
            if (i == 1 || i == 3) {
                // Position of search is one character before the real char of the word
                index += 1;
            }
            break;
        }
    }
    if (index == -1) {
        return;
    }

    // Word is found
    var last_index = index + word.length;

    if (index != -1) {
        // Create Highlighted term
        var hiword = document.createElement("span");
        hiword.className = class_name;
        hiword.appendChild(document.createTextNode(content_value.substr(index, word.length)));

        // Add popup events
        if (browser_info.isIE) {
            // For internet explorer
            hiword.setAttribute("onmouseover", function(){show_glossary_definition_popup(this, definition_index);});
            hiword.setAttribute("onmouseout", function(){hide_glossary_definition_popup(this, definition_index);});
            if (related_glossary_definitions[definition_index]["has_text"]=="1") {
                hiword.setAttribute("onclick", function(){goto_glossary_definition(definition_index);});
            }
        }
        else {
            // Others
            hiword.setAttribute("onmouseover", "javascript:show_glossary_definition_popup(this, " + definition_index + ")");
            hiword.setAttribute("onmouseout", "javascript:hide_glossary_definition_popup(this, " + definition_index + ")");
            if (related_glossary_definitions[definition_index]["has_text"]=="1") {
                hiword.setAttribute("onclick", "javascript:goto_glossary_definition(" + definition_index + ")");
            }
        }

        parent_node.insertBefore(document.createTextNode(content_value.substr(0, index)),node);
        parent_node.insertBefore(hiword, node);
        parent_node.insertBefore(document.createTextNode(content_value.substr(index+word.length)),node);
        parent_node.removeChild(node);
        return true;
    }
    return false;
}

function highlight_related_glossary_term_in_node(node, word, definition_index, unauthorized_tags) {
    // Traverse childnodes
    if (! node) {
        return false;
    }

    // Don't dig into unauthorized keys
    tag_name = node.nodeName.toLowerCase();

    for (i=0;i<unauthorized_tags.length;i++) {
        unauthorized_tag_name = unauthorized_tags[i].toLowerCase();
        if (tag_name == unauthorized_tag_name) {
            return false;
        }
    }
    found = false;
    if (node.hasChildNodes) {
        var i;
        for (i=0;i<node.childNodes.length && !found;i++) {
            found = highlight_related_glossary_term_in_node(node.childNodes[i], word, definition_index, unauthorized_tags);
            if (found) {
                return true;
            }
        }

        if (node.nodeType == 3 && !found) {
            // Check all textnodes.
            found = highlight_related_glossary_term_in_text(node, word, definition_index);
            if (found) {
                return true;
            }
        }
    }
    return false;
}

function highlight_related_glossary_terms_in_node(target_node, unauthorized_tags) {
    // Init terms in definition node
    for (var def_index=0; def_index<related_glossary_definitions.length; def_index++) {
        if (related_glossary_definitions[def_index]["url"] == glossary_current_url) {
            continue;
        }
        var terms = related_glossary_definitions[def_index]["terms"];
        for (var term_index=0; term_index<terms.length; term_index++) {
            var word = terms[term_index];
            highlight_related_glossary_term_in_node(target_node, word, def_index, unauthorized_tags);
        }
    }
}


function build_related_glossary_terms_list(target_node) {
    // Build list of related terms
    if (related_glossary_definitions.length > 0) {
        var i=0;
        var ul_node = document.createElement("ul");

        // create li node
        for (i=0; i<related_glossary_definitions.length; i++) {
            if (related_glossary_definitions[i]["show"]=='1') {
                var li_node = document.createElement("li");

                // Add link tag
                var a_node = document.createElement("a");
                var url = related_glossary_definitions[i]["url"];
                a_node.setAttribute("href", url);
                var title_text = related_glossary_definitions[i]["title"];
                a_node.appendChild(document.createTextNode(title_text));

                li_node.appendChild(a_node);
                ul_node.appendChild(li_node);
            }
        }

        target_node.appendChild(ul_node);
    }
}
