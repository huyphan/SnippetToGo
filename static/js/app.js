var editor, code_viewer, current_snippet;
var supported_languages = ['markdown', 'apl', 'asciiarmor', 'asn.1', 'asterisk', 'brainfuck', 'clike', 'clojure', 'cmake', 'cobol', 'coffeescript', 'commonlisp', 'crystal', 'css', 'cypher', 'd', 'dart', 'diff', 'django', 'dockerfile', 'dtd', 'dylan', 'ebnf', 'ecl', 'eiffel', 'elm', 'erlang', 'factor', 'forth', 'fortran', 'gas', 'gfm', 'gherkin', 'go', 'groovy', 'haml', 'handlebars', 'haskell', 'haxe', 'htmlembedded', 'htmlmixed', 'http', 'idl', 'index.html', 'jade', 'javascript', 'jinja2', 'julia', 'livescript', 'lua', 'mathematica', 'meta.js', 'mirc', 'mllike', 'modelica', 'mscgen', 'mumps', 'nginx', 'nsis', 'ntriples', 'octave', 'oz', 'pascal', 'pegjs', 'perl', 'php', 'pig', 'properties', 'puppet', 'python', 'q', 'r', 'rpm', 'rst', 'ruby', 'rust', 'sass', 'scheme', 'shell', 'sieve', 'slim', 'smalltalk', 'smarty', 'solr', 'soy', 'sparql', 'spreadsheet', 'sql', 'stex', 'stylus', 'swift', 'tcl', 'textile', 'tiddlywiki', 'tiki', 'toml', 'tornado', 'troff', 'ttcn', 'ttcn-cfg', 'turtle', 'twig', 'vb', 'vbscript', 'velocity', 'verilog', 'vhdl', 'vue', 'xml', 'xquery', 'yaml', 'yaml-frontmatter', 'z80'];

function generate_snippet_link(title, tag, snippet_id) {
    var a = $("<a />")
            .addClass("menu-item")
            .html(title)
            .attr("snippet-id", snippet_id)
            .click(function(){show_snippet(snippet_id)})
            .append($("<br />"));

    var tags = tag.split(",");
    for (var i=0;i<tags.length;i++) {
        a.append($("<span />").addClass("tag").html(tags[i]));
    }            

    return a;
}

function reload_snippets() {
    $.ajax({
        dataType: "json",
        url: "snippets",
        beforeSend: function() {
            $("#sidebar-loading").show();
            $("#snippet-editor").hide();
        },
        success: function(data) {
            $("#search-result-count").html(data.total);
            $("#snippets").empty();
            for (var i=0;i<data.total;i++) {
                $("#snippets").append(generate_snippet_link(data.results[i].title, data.results[i].tag, data.results[i].id));
            }
            $("#search-result").show();
        },
        complete: function() {
            $("#sidebar-loading").hide();
        }
    });
}

function show_snippet(snippet_id) {
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
            $("#snippet-title").html(data.title);
            $("#snippet-tag").html(data.tag);
            $("#snippet-container").show();

            if (data.language == "markdown") {
                $("#snippet-content").html(data.content);
            } else {
                code_viewer.refresh();                
                code_viewer.setValue(data.content);
            }
        },
        complete: function() {
            $("#content-loading").hide();
        }
    });
}

function save_snippet(id, title, content, tag, language) {
    if (id) {
        $.ajax({
            method: "PUT",
            url: "snippets/" + id,
            dataType: "json",
            data: {
                content: content,
                title: title,
                tag: tag,
                language: language
            },
            success: reload_snippets
        });
    } else {
        $.ajax({
            method: "POST",
            url: "snippets",
            dataType: "json",
            data: {
                content: content,
                title: title,
                tag: tag,
                language: language
            },
            success: reload_snippets
        });
    }
}

$(document).ready(function() {

    editor = CodeMirror.fromTextArea($("#snippet-editor-content").get(0), {
        mode: "application/xml",
        styleActiveLine: true,
        lineNumbers: true,
        lineWrapping: true
    });

    code_viewer = CodeMirror.fromTextArea($("#snippet-content").get(0), {
        mode: "application/xml",
        styleActiveLine: true,
        lineNumbers: true,
        lineWrapping: true,
        isReadOnly: true;
    });

    $.ajaxSetup({
        error: function(data){
            $("#error-msg").html(data.message);
            $("#error-msg").show().delay(3000).fadeOut();
        },
        success: function(data){
            $("#notification-msg").html(data.message);
            $("#notification-msg").show().delay(3000).fadeOut();
        }
    });

    $("#search-btn").click(function(){

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
            console.log(event);
        }
    });

    $("#cancel-btn").click(function(){
        $("#snippet-editor").hide();
        $("#snippet-container").show();
    });

    $("#save-btn").click(function(){
        var content = editor.getValue();
        var title = $("#snippet-editor-title").val();
        var language = $("#snippet-editor-language").val();
        var tag = $("#snippet-editor-tag").val();
        var id = $("#snippet-editor-id").val();

        save_snippet(id, title, content, tag, language);
    });

    for (var i=0;i<supported_languages.length;i++) {
        $("#snippet-editor-language").append($("<option />").val(supported_languages[i]).html(supported_languages[i]));
    }

    reload_snippets();
}, "json");