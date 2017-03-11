var editor, current_snippet, current_page, current_query;
var supported_languages = ['markdown', 'apl', 'asciiarmor', 'asn.1', 'asterisk', 'brainfuck', 'clike', 'clojure', 'cmake', 'cobol', 'coffeescript', 'commonlisp', 'crystal', 'css', 'cypher', 'd', 'dart', 'diff', 'django', 'dockerfile', 'dtd', 'dylan', 'ebnf', 'ecl', 'eiffel', 'elm', 'erlang', 'factor', 'forth', 'fortran', 'gas', 'gfm', 'gherkin', 'go', 'groovy', 'haml', 'handlebars', 'haskell', 'haxe', 'htmlembedded', 'htmlmixed', 'http', 'idl', 'index.html', 'jade', 'javascript', 'jinja2', 'julia', 'livescript', 'lua', 'mathematica', 'meta.js', 'mirc', 'mllike', 'modelica', 'mscgen', 'mumps', 'nginx', 'nsis', 'ntriples', 'octave', 'oz', 'pascal', 'pegjs', 'perl', 'php', 'pig', 'properties', 'puppet', 'python', 'q', 'r', 'rpm', 'rst', 'ruby', 'rust', 'sass', 'scheme', 'shell', 'sieve', 'slim', 'smalltalk', 'smarty', 'solr', 'soy', 'sparql', 'spreadsheet', 'sql', 'stex', 'stylus', 'swift', 'tcl', 'textile', 'tiddlywiki', 'tiki', 'toml', 'tornado', 'troff', 'ttcn', 'ttcn-cfg', 'turtle', 'twig', 'vb', 'vbscript', 'velocity', 'verilog', 'vhdl', 'vue', 'xml', 'xquery', 'yaml', 'yaml-frontmatter', 'z80'];
CodeMirror.modeURL = "//cdnjs.cloudflare.com/ajax/libs/codemirror/5.10.0/mode/%N/%N.js";

function generate_snippet_link(title, snippet_id) {
    return $("<a />")
            .addClass("menu-item")
            .html(title)
            .attr("snippet-id", snippet_id)
            .click(function(){download_snippet(snippet_id)})
            .append($("<br />"));
}

function reload_snippets(query, page) {
    page = page || 1;

    $.ajax({
        method: "GET",
        dataType: "json",
        url: "snippets",
        data: {
            query: query,
            page: page
        },
        beforeSend: function() {
            $("#sidebar-loading").show();
            $("#snippet-editor").hide();
            $("#search-result").hide();
            $("#prev-btn").hide();
            $("#next-btn").hide();
        },
        success: function(data) {
            $("#search-result-count").html(data.total_snippets);
            $("#snippets").empty();
            for (var i=0;i<data.results.length;i++) {
                $("#snippets").append(generate_snippet_link(data.results[i].title, data.results[i].id));
            }
            $("#search-result").show();
            current_page = data.current_page;
            current_query = query;
            if (current_page > 1) {
                $("#prev-btn").show();
            }

            if (current_page < data.total_pages) {
                $("#next-btn").show();   
            }
        },
        complete: function() {
            $("#sidebar-loading").hide();
        }
    });
}

function show_snippet(title, content, tag, language) {
    $("#snippet-title").html(title);
    $("#snippet-container").show();

    var tags = tag.split(",");
    $("#snippet-tags").empty();
    for (var i=0;i<tags.length;i++) {
        if (!tag) continue;
        $("#snippet-tags").append($("<span />").addClass("tag").html(tags[i]));
    }

    if (language == "markdown") {
        $("#snippet-content-markdown").html(marked(content));
        $("#snippet-content").hide();
        $("#snippet-content-markdown").show();
    } else {
        $("#snippet-content").text(content);
        $("#snippet-content").attr("class", language);
        hljs.highlightBlock($("#snippet-content").get(0));
        $("#snippet-content-markdown").hide();
        $("#snippet-content").show();
    }
}

function download_snippet(snippet_id) {
    $.ajax({
        method: "GET",
        url: "snippets/" + snippet_id,
        dataType: "json",
        beforeSend: function() {
            $("#content-loading").show();
            $("#snippet-container").hide();
            $("#snippet-editor").hide();
        },
        success: function(data) {
            current_snippet = data;
            show_snippet(data.title, data.content, data.tag, data.language);
        },
        complete: function() {
            $("#content-loading").hide();
        }
    });
}

function save_snippet(id, title, content, tag, language) {
    var url, method;

    if (!title.trim() || !content.trim()) {
        alert("Ouch! Looks like your title or snippet content is empty.")
        return;
    }

    if (id) {
        method = "PUT";
        url = "snippets/" + id;
    } else {
        method = "POST";
        url = "snippets";
    }

    current_snippet = {
        content: content,
        title: title,
        tag: tag,
        language: language
    }

    $.ajax({
        method: method,
        url: url,
        dataType: "json",
        data: current_snippet,
        success: function(data) {
            $("#notification-msg").html(data.message);
            $("#notification-msg").show().delay(3000).fadeOut();
            show_snippet(title, content, tag, language);
            current_snippet.id = data['snippet_id'];
            reload_snippets();
        }
    });
}

function delete_snippet(snippet_id) {
    $.ajax({
        method: "DELETE",
        url: "snippets/" + snippet_id,
        dataType: "json",
        success: function(data) {
            $("#snippet-container").hide();
            $("#notification-msg").html(data.message);
            $("#notification-msg").show().delay(3000).fadeOut();
            reload_snippets();

            // Reset form values
            editor.setValue("");
            $("#snippet-editor-title").val("");
            $("#snippet-editor-tag").val("");
            $("#snippet-editor-id").val("");
            $("#snippet-editor-language").val("markdown");
            editor.refresh();

            // Reset snippet value
            current_snippet = null;
            $("#snippet-content-markdown").empty();
            $("#snippet-content").empty();
            $("#snippet-title").empty();
            $("#snippet-tags").empty();
        }
    });
}

$(document).ready(function() {

    editor = CodeMirror.fromTextArea($("#snippet-editor-content").get(0), {
        mode: "markdown",
        styleActiveLine: true,
        lineNumbers: true,
        lineWrapping: true
    });
    CodeMirror.autoLoadMode(editor, "markdown");

    $.ajaxSetup({
        dataType: "json",
        success: function(data) {
            $("#notification-msg").html(data.message);
            $("#notification-msg").show().delay(3000).fadeOut();
        },
        error: function(e) {
            var data = e.responseJSON;
            $("#error-msg").html(data.message);
            $("#error-msg-container").show().delay(3000).fadeOut();
        },
    });

    $("#search-btn").click(function(){
        var query = $("#query").val();
        reload_snippets(query);
    });

    $('#query').keypress(function (e) {
        if (e.which == 13) {
            var query = $("#query").val();
            reload_snippets(query);
        }
    });

    $("#next-btn").click(function(){
        reload_snippets(current_query, current_page + 1);
    });

    $("#prev-btn").click(function(){
        reload_snippets(current_query, current_page - 1);
    });

    $("#add-btn").click(function(){
        $("#action-title").html("Add new snippet");
        $("#snippet-container").hide();
        $("#snippet-editor").show();

        // Reset form values
        editor.setValue("");
        $("#snippet-editor-title").val("");
        $("#snippet-editor-tag").val("");
        $("#snippet-editor-id").val("");
        $("#snippet-editor-language").val("markdown");
        editor.refresh();
    });

    $("#edit-btn").click(function(){
        $("#action-title").html("Edit snippet");
        $("#snippet-container").hide();
        $("#snippet-editor").show();
        editor.refresh();

        // Set form values from current_snippet object
        $("#snippet-editor-title").val(current_snippet.title);
        $("#snippet-editor-tag").val(current_snippet.tag);
        $("#snippet-editor-id").val(current_snippet.id);
        $("#snippet-editor-language").val(current_snippet.language);
        editor.setValue(current_snippet.content);
    });

    $("#delete-btn").click(function(event){
        if (confirm("Are you sure you want to delete this snippet ?")) {
            delete_snippet(current_snippet.id);
        }
    });

    $("#cancel-btn").click(function(){
        $("#snippet-editor").hide();
        if (current_snippet) {
            $("#snippet-container").show();
        }
    });

    $("#save-btn").click(function(){
        var content = editor.getValue();
        var title = $("#snippet-editor-title").val();
        var language = $("#snippet-editor-language").val();
        var tag = $("#snippet-editor-tag").val();
        var id = $("#snippet-editor-id").val();

        save_snippet(id, title, content, tag, language);
    });

    $("#snippet-editor-language").change(function(){
        editor.setOption("mode", $(this).val());
        CodeMirror.autoLoadMode(editor, $(this).val());
    });

    for (var i=0;i<supported_languages.length;i++) {
        $("#snippet-editor-language").append($("<option />").val(supported_languages[i]).html(supported_languages[i]));
    }

    reload_snippets();
}, "json");
