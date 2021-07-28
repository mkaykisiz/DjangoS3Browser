

    +function ($) {
        'use strict';

        // UPLOAD CLASS DEFINITION
        // ======================

        var dropZone = document.getElementById('drop-zone');
        var uploadForm = document.getElementById('js-upload-form');

        var startUpload = function (files) {
            var loc = $('#location').attr("data-location");
            $.each(files, function (key, file) {
                var data = new FormData();
                data.append("file", file);
                data.append("loc", loc);
                $.ajax({
                    xhr: function () {
                        var xhr = new window.XMLHttpRequest();
                        // Upload progress
                        xhr.upload.addEventListener("progress", function (evt) {
                            if (evt.lengthComputable) {
                                var percentComplete = (evt.loaded / evt.total * 100 | 0);
                                var progress_bar = document.getElementById("progress-bar");
                                var progress_bar_rate = document.getElementById("progress-bar-rate");
                                progress_bar.style.width = percentComplete + '%';
                                progress_bar_rate.innerHTML = percentComplete + ' % ' + file.name;
                            }
                        }, false);
                        return xhr;
                    },
                    url: UPLOAD_URL,
                    contentType: false,
                    type: 'POST',
                    dataType: 'json',
                    processData: false,
                    data: data,
                    success: function (resultData) {
                        document.getElementById("js-upload-finished-list").innerHTML += '<a href="#" ' +
                            'class="list-group-item list-group-item-success">' +
                            SUCCESS_MSG + file.name + '</a>';

                    },
                    error: function (resultData) {
                        document.getElementById("js-upload-finished-list").innerHTML += '<a href="#" ' +
                            'class="list-group-item list-group-item-danger">' +
                             FAIL_MSG + file.name + '</a>';
                    }
                });
            })
            get_files(loc);
        };

        uploadForm.addEventListener('submit', function (e) {
            var uploadFiles = document.getElementById('js-upload-files').files;
            e.preventDefault();
            startUpload(uploadFiles);
        });

        dropZone.ondrop = function (e) {
            e.preventDefault();
            this.className = 'upload-drop-zone';
            startUpload(e.dataTransfer.files)
        };

        dropZone.ondragover = function () {
            this.className = 'upload-drop-zone drop';
            return false;
        };

        dropZone.ondragleave = function () {
            this.className = 'upload-drop-zone';
            return false;
        }

    }(jQuery);

    $(document).ready(function () {
        get_files("-");
    });

    var selected_file_list = [];
    var copy_selected_file_list = [];
    var sort_a_z_value = true;

    function create_folder() {
        var loc = $('#location').attr("data-location");
        var folder_name = $('#created_folder_name').val();
        data = {"folder_name": folder_name, 'loc': loc};
        $.ajax({
            url: CREATE_FOLDER_URL,
            type: 'POST',
            dataType: 'json',
            data: data,
        });
        $('#collapseCreateFolder').collapse("hide");
        get_files(loc);
    }

    function sort_a_z(d) {
        loc = $('#location').attr("data-location");
        $(d).toggleClass('fa-sort-alpha-desc');
        if ($(d).attr("data-sort") === "a-z") {
            $(d).attr("data-sort", "z-a");
            sort_a_z_value = false;
        } else {
            $(d).attr("data-sort", "a-z");
            sort_a_z_value = true;
        }
        get_files(loc);
    }

    function select_file(d) {
        $(d).find('.check-file').toggleClass('fa-check');
        $(d).parent().siblings().find('.check-file').removeClass('fa-check');
        var file_item = $(d).find('.location-info').text();
        if (selected_file_list.indexOf(file_item) !== -1) {
            selected_file_list.splice(selected_file_list.indexOf(file_item), 1)
        } else {
            selected_file_list.push(file_item);
        }
    }

    function copy_selected_file() {
        copy_selected_file_list = selected_file_list;
        $('#paste_file').removeClass('hidden');
        $('#move_file').removeClass('hidden');
    }


    function paste_file() {
        loc = $('#location').attr("data-location");
        $('#paste_file').toggleClass('hidden');
        $('#move_file').toggleClass('hidden');
        data = {'loc': loc, 'file_list': copy_selected_file_list};
        $.ajax({
            url: PAST_FILE_URL,
            type: 'POST',
            dataType: 'json',
            data: data,
            success: function (resultData) {
                copy_selected_file_list = [];
                get_files(loc);
            },
        });
    }


    function delete_file() {
        loc = $('#location').attr("data-location");
        data = {'file_list': selected_file_list};
        $.ajax({
            url: DELETE_FILE_URL,
            type: 'POST',
            dataType: 'json',
            data: data,
            success: function (resultData) {
                get_files(loc);
            },
        });
    }


    function refresh_folder() {
        get_files($('#location').attr("data-location"));
    }

    //     item detail

    function open_item(d) {
        url = d.getAttribute("data-url");
        type = d.getAttribute("data-type");
        if (type === 'folder') {
            get_files("-" + url)
        } else {
            window.open(url, '_blank');
        }

    }

    // back top folder

    function back_folder(d) {
        var loc = d.getAttribute('data-top_folder');
        get_files(loc);
        $('#location').attr("data-location", loc);
        var top_loc = "";
        var loc_array = loc.split('/');
        for (var i = 0; i < loc_array.length - 2; i++) {
            top_loc = top_loc + loc_array[i] + "/"
        }
        if (1 > top_loc.length) {
            top_loc = "-"
        }
        $('#top_folder').attr("data-top_folder", top_loc);
    }

    //     "fetch the directories within the selected folder"

    function get_files(main_folder) {
        selected_file_list = [];
        $('#top_folder').attr("data-top_folder", $('#location').attr("data-location"));
        $('#location').attr("data-location", main_folder);
        $(".pb-filemng-template-body").empty();
        var get_files_url = FILES_URL.replace(/arg1djs3server/, main_folder.toString()).replace(/sort_a_z/, sort_a_z_value);
        $.getJSON(
            get_files_url, function (files_list) {
                for (var key in files_list) {
                    target = "";
                    if ('folder' != files_list[key].type) {
                        target = 'target="_blank"';
                    }
                    $(".pb-filemng-template-body").append(
                        '<div class="col-sm-1 pb-filemng-body-folders" onClick="select_file(this);" ondblclick="open_item(this);" ' +
                        'data-toggle="tooltip" ondrop="drop_file(event)" ondragover="allowDrop_file(event)" ondragstart="dragstart_file(event)" ondragend="dragend_file(event)" draggable="true" title="' + files_list[key].text +
                        '" data-url="' + files_list[key].url + '" data-type="' + files_list[key].type + '">' +
                        '<img src="' + files_list[key].icon + '"/></a>' + '<br />' +
                        '<p class="pb-filemng-paragraphs" onClick="rename_file_onfocus(this);"  >' + files_list[key].text + '</p>' +
                        '<input  type="text" class="form-control hidden rename-input" onfocusout="rename_file_onfocusout(this);" value="' + files_list[key].text + '">' +
                        '<span class="fa check-file"></span>' +
                        '<span class="hide location-info">' + main_folder + files_list[key].text + '</span>' +
                        '</div>'
                    );
                }
                if (1 > files_list.length) {
                    $(".pb-filemng-template-body").append(EMTY_FOLDER_MSG);
                }
            });
    }

    function download_files() {
        for (var key in selected_file_list) {
            window.open(DOWNLOAD_URL + "?file=" + selected_file_list[key], "_blank");
        }
    }

    // rename item focus

    function rename_file_onfocus(d) {
        $(d).parent().find('.rename-input').removeClass('hidden');
        $(d).parent().find('.rename-input').focus();
        $(d).toggleClass('hidden');
    }

    //  rename item focusout

    function rename_file_onfocusout(d) {
        var file = $(d).parent().find('.pb-filemng-paragraphs').html();
        var loc = $('#location').attr("data-location");
        var new_name = $(d).val();
        data = {'loc': loc, 'file': file, 'new_name': new_name};
        $.ajax({
            url: RENAME_URL,
            type: 'POST',
            dataType: 'json',
            data: data,
            success: function (resultData) {
                $(d).parent().find('.pb-filemng-paragraphs').html(resultData);
                $(d).parent().find('.pb-filemng-paragraphs').removeClass('hidden');
                $(d).toggleClass('hidden');
            },
        });
    }

    function move_file(loc, file_list) {
        $('#move_file').toggleClass('hidden');
        $('#paste_file').toggleClass('hidden');
        data = {'loc': loc, 'file_list': file_list};
        $.ajax({
            url: MOVE_FILE_URL,
            type: 'POST',
            dataType: 'json',
            data: data,
            success: function (resultData) {
                get_files($('#location').attr("data-location"));
            },
        });
    }


    function move_selected_file(d) {
        move_file($('#location').attr("data-location"), copy_selected_file_list);
    }

    // drag and drop file for move file start

    function dragstart_file(e) {
        for (var key in selected_file_list) {
            $("div[title=\"" + selected_file_list[key].slice(1) + "\"]")[0].style.opacity = '0.4';
        }
    }

    function dragend_file(e) {
        for (var key in selected_file_list) {
            $("div[title=\"" + selected_file_list[key].slice(1) + "\"]")[0].style.opacity = '1';
        }
    }

    function drop_file(e) {
        e.preventDefault();
        if ($(e.target).parent().attr("data-type") === 'folder') {
            move_file("-" + $(e.target).parent().attr("title"), selected_file_list);
        }
    }

    function allowDrop_file(e) {
        e.preventDefault();
    }

    // drag and drop file for move file end
