(function () {
    var pluginName = 'upload';

    CKEDITOR.dialog.add(pluginName, function (editor) {
        var lang = editor.lang[pluginName];
        var config = editor.config;

        // 判断是否是图片
        var isImage = function (url, getSuffix, suffixs) {
            if (!suffixs) {
                suffixs = ['gif', 'jpg', 'jpeg', 'png'];
            }
            var urls = url.split('.');
            var suffix = urls[urls.length - 1];
            if (getSuffix) {
                return suffix;
            }
            return $.inArray(suffix, suffixs) !== -1;
        };

        // 上传文件
        var uploadFile = function () {

            var data = {};
            data[$('meta[name="csrf-param"]').attr('content')] = $('meta[name="csrf-token"]').attr('content');

            new AjaxUpload($('#upload_file_button_' + editor.name)[0], {
                action: config.upload_url,
                name: 'ajax',
                autoSubmit: true,
                responseType: 'json',
                accept: '*',
                data: data,
                onComplete: function (file, response) {

                    if (!response.state) {
                        $.alert(response.info, 'danger');
                        return null;
                    }

                    config.files.push(response.data.url);

                    var urlObj = $('.upload-div input[name="url"]');
                    urlObj.val(response.data.url);
                    urlObj.attr('attachment-id', response.data.id);

                    if (isImage(response.data.url)) {
                        $('.upload-div select').removeClass('disabled').removeAttr('disabled');
                        $('.upload-div select option[value="img"]').attr('selected', true);
                    } else {
                        $('.upload-div select').addClass('disabled').attr('disabled', true);
                    }
                }
            });
        };

        return {
            title: lang.tabTitle,
            minWidth: 350,
            minHeight: 100,
            contents: [{
                id: "tab1",
                label: "tab1Name",
                title: "tab1Name",
                elements: [{
                    type: "html",
                    html: '' +
                    '<div class="upload-div">' +
                    '    <div class="url">' +
                    '        <div class="title">URL</div>' +
                    '        <input class="text" type="text" value="http://" name="url" />' +
                    '            <button onclick="upload_file_input_' + editor.name + '.click();" id="upload_file_button_' + editor.name + '">' + lang.upload + '</button>' +
                    '            <input id="upload_file_input_' + editor.name + '" onchange="uploadFile();" type="file" style="display:none;" />' +
                    '    </div>' +
                    '    <div class="intro">' +
                    '        <div class="title">' + lang.describe + '</div>' +
                    '        <input class="text" type="text" value="' + lang.fileLink + '" name="intro" />' +
                    '    </div>' +
                    '    <div class="intro">' +
                    '        <div class="title">' + lang.show + '</div>' +
                    '        <select>' +
                    '            <option value="img">' + lang.showType + '</option>' +
                    '            <option value="link">' + lang.linkType + '</option>' +
                    '        </select>' +
                    '    </div>' +
                    '</div>'
                }]
            }],
            onOk: function () {

                var urlObj = $('.upload-div input[name="url"]');
                var introObj = $('.upload-div input[name="intro"]');
                var selectObj = $('.upload-div select');

                var url = urlObj.val();
                var attachmentId = urlObj.attr('attachment-id');

                if (url.trim() == '' || url == 'http://') {
                    $.alert(lang.fileUrlIsEmpty);
                    return false;
                }

                var intro = introObj.val();
                intro = (intro.trim() == '' ? lang.fileLink : intro) + '.' + isImage(url, true);

                var file = null;
                if (isImage(url) && selectObj.val() == 'img') {
                    file = '<img style="width: 100%;" attachment-id="' + attachmentId + '" alt="' + intro + '" src="' + url + '"/>';
                } else {
                    file = '<a attachment-id="' + attachmentId + '" href="' + url + '">' + intro + '</a>';
                }

                editor.insertHtml(file);

                urlObj.val('http://');
                introObj.val(lang.fileLink);
                selectObj.removeClass('disabled').removeAttr('disabled');
            },
            onLoad: function () {
                uploadFile();
            }
        };
    });
}());