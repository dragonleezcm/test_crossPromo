CrossPromoUtils = {
    handleFiles : function(promises, files) {
        $('input[type=file]').each(function() {
            var input = $(this)[0];
            if (input.files.length > 0) {
                var file = input.files[0];
                var name = input.value.replace(/^.*[\\\/]/, '');
                var parseFile = new Parse.File(name, file);
                promises.push(parseFile.save());
                files.push({
                    column : $(this).prop('name'),
                    file : parseFile
                });
            }
        });
    },

    processAppSave : function(application) {
        $('#submit').text('Submitting...');
        // Filters key name from input field attributes
        $('input').each(function() {
            if ($(this).prop('name').indexOf('application') !== -1) {
                if ($(this).prop('type') === 'date')
                    application.set($(this).prop('name').replace(/application\[|\]/g, ''), $(this).val());
                else if ($(this).prop('type') === 'radio') {
                    if ($(this).prop('checked')) {
                        application.set($(this).prop('name').replace(/application\[|\]/g, ''), $(this).val());
                    }
                } else
                    application.set($(this).prop('name').replace(/application\[|\]/g, ''), $(this).val());
            }
        });

        var companyId = $('#hideCompanyId').val();
        if (companyId != "") {
            var company = new Company();
            company.id = companyId;
            application.set('company', company);
        }
        $("input:radio[name='mfaHomeScreen']:checked").each(function() {
           var mfa=new MorefunApp();
            mfa.id= $(this).val();
            application.set('mfaHomeScreen',mfa);
        });
        // After save, fill in the join table
        application.save(null, {
            success : function(o) {
                var promotions = [];
                var morefunapps = [];
                $("input:checkbox[name='promotions[]']:checked").each(function() {
                    promotions.push($(this).val());
                });
                $("input:checkbox[name='morefunapps[]']:checked").each(function() {
                    morefunapps.push($(this).val());
                });

                Parse.Cloud.run("setApplicationToPromotions", {
                    application : o.id,
                    promotions : promotions
                }, {
                    success : function(s) {
                        Parse.Cloud.run("setApplicationToMorefunApps", {
                            application : o.id,
                            morefunapps : morefunapps
                        }, {
                            success : function(s) {
                                alert("App Saved.");;
                                //window.location = "/applications_cmpy/" + companyId;
                                //goto promotion edit page
                                window.location = "/applications/" + companyId + "/" + o.id;
                                console.log(s);
                            },
                            error : function(error) {
                                console.log(error);
                            }
                        });
                    },
                    error : function(error) {
                        console.log(error);
                    }
                });
            },
            error : function(o, error) {
                console.log(o);
                console.log(error);
            }
        });
    },

    // To save promotion, save files first
    savePromotionHandler : function(p) {
        var promotion = p;
        return function(e) {
            e.preventDefault();
            // validation
            if ($("#ad-name").val().trim() == "") {
                alert("please enter the ads name");
                return;
            }
            if (!CrossPromoUtils.checkStartEndDate("#start-date", "#end-date", "recommanded")) {
                return;
            }

            // when user chose the featured tag.
            if ($('.featured').prop('checked') && !CrossPromoUtils.checkStartEndDate("#feature-start-date", "#feature-end-date", "notrecommanded")) {
                return;
            }
            var promises = [];
            var files = [];
            var errMsg = [];
            // Upload all files
            if (!MoreFunAppUtils.handleImagesVideos(promises, files, errMsg)) {
                alert(errMsg[0]);
                return;
            }
            $('#submit').text('Submitting...');

            Parse.Promise.when(promises).then(function() {
                _.each(files, function(e) {
                    promotion.set(e.column, e.file);
                });
                // After file save, get all non-file attributes and set them
                $('input').each(function() {
                    if ($(this).prop('name').indexOf('promotion') !== -1) {
                        if ($(this).prop('type') === 'radio') {
                            if ($(this).prop('checked')) {
                                promotion.set($(this).prop('name').replace(/promotion\[|\]/g, ''), $(this).val());
                            }
                        } else {
                            promotion.set($(this).prop('name').replace(/promotion\[|\]/g, ''), $(this).val());
                        }
                    }
                });
                // set the companyid for certain promotion
                var companyId = $('#hideCompanyId').val();
                if (companyId != "") {
                    var company = new Company();
                    company.id = companyId;
                    promotion.set('company', company);
                }
                // After save, fill in join table and save.
                promotion.save(null, {
                    success : function(o) {
                        var applications = [];
                        $("input:checkbox[name='applications[]']:checked").each(function() {
                            applications.push($(this).val());
                        });
                        Parse.Cloud.run("setPromotionToApplications", {
                            applications : applications,
                            promotion : o.id
                        }, {
                            success : function(s) {
                                alert("Ad Saved.");
                                //go to promotion list page
                                //window.location = "/promotions_cmpy/" + companyId;
                                //goto promotion edit page
                                window.location = "/promotions/" + companyId + "/" + o.id;
                                console.log(s);
                            },
                            error : function(error) {
                                console.log(error);
                            }
                        });
                    },
                    error : function(o, error) {
                        console.log(error);
                    }
                });
            });
        }
    },
    // To save an application, save all files, then sets
    saveApplicationHandler : function(a) {
        var application = a;
        return function(e) {
            e.preventDefault();
            // validation
            if ($("#app-name").val().trim() == "") {
                alert("please enter the application name");
                return;
            }

            var appStoreid = $("#app-store-id").val();
            var appid = $('#appid').val();
            Parse.Cloud.run("checkAppStoreId", {
                appStoreId : appStoreid,
                appId : appid
            }, {
                success : function(result) {
                    // did't find any application
                    if (result == "true" || appStoreid == '') {
                        CrossPromoUtils.processAppSave(application);
                        return true;

                    } else if (result = "two" && appid != "null") {
                        alert("appstoreid already existed in database.");
                        return false;
                    } else {
                        alert("the appstoreid must be unique!");
                        return false;
                    }
                },
                error : function(error) {
                    console.log(error);
                    return false;
                }
            });
        }
    },

    checkStartEndDate : function(start, end, recommanded) {
        var startEndDateNullWarnMsg = 'Please enter the Featured start date and Featured end date!';
        var startBiggerThanEndWarnMsg = 'Featured Start date bigger than Featured end date!';
        var sdate = $(start).val();
        var edate = $(end).val();
        // those two fields are recommanded
        if (recommanded == "recommanded") {
            startEndDateNullWarnMsg = 'Please enter the start date and end date!';
            startBiggerThanEndWarnMsg = 'Start date bigger than end date!';
            if (sdate == "None" || sdate == "" || edate == "") {
                alert(startEndDateNullWarnMsg);
                return false;
            }
        }
        if ((sdate != '' && sdate != 'None' && edate == '') || ((sdate == '' || sdate == 'None') && edate != '')) {
            // only filled one date
            alert(startEndDateNullWarnMsg);
            return false;
        } else {
            if (sdate > edate) {
                alert(startBiggerThanEndWarnMsg);
                return false;
            }
        }
        return true;
    },
    changeOddBgColor : function(byClass) {
        var i = 0;
        $(byClass).each(function() {
            i++;
            if (i % 2 == 0) {
                $(this).css("background-color", "#f0f0f0");
            }
        });
        return i;
    },
    changePriceSymbol : function(content) {
        var symbol;
        if (content == 'USD') {
            symbol = "$";
        } else if (content == 'EUR') {
            symbol = "â‚¬";
        } else if (content == 'GBP') {
            symbol = "Â£";
        } else if (content == 'CNY') {
            symbol = "ï¿¥";
        } else if (content == 'JPY') {
            symbol = "Â¥";
        } else if (content == 'INR') {
            symbol = "â‚¨.";
        } else if (content == 'KRW') {
            symbol = "â‚©";
        } else if (content == 'CAD') {
            symbol = "Can$";
        } else if (content == 'HKD') {
            symbol = "HK$";
        } else if (content == 'THB') {
            symbol = "à¸¿";
        }
        $('#priceSymbol').html(symbol);
    },
    addSelectAllListener : function(selectId, checkedClass) {
        $(selectId).on('click', function() {
            if ($(this).prop('checked')) {
                $(checkedClass).prop('checked', true);
            } else {
                $(checkedClass).prop('checked', false);
            }
        });
    },
    // when click component clickBoxClass(find by class) ,then show or hide
    // component showHideClass(find by class)
    addHideShowListener : function(clickBoxClass, showHideClass) {
        $(clickBoxClass).click(function(e) {
            if ($(clickBoxClass).prop('checked')) {
                $(showHideClass).fadeIn();
            } else {
                $(showHideClass).fadeOut();
                $(showHideClass).find('input').val('');
            }
        });
    },
    //TODO ZCM MODIFY
    // when click component clickBoxClass(find by class) ,then show or hide
    // component showHideClass(find by class)
    addTextMediaSwitchListener : function(clickBoxClass,index) {
        var name=clickBoxClass+index;
        $(name).click(function(e) {
            if ($(this).prop('checked')&&$(this).val()=="text") {
                CrossPromoUtils.showTextArea(index);
            } else {
                CrossPromoUtils.showMediaArea($(this).val(),index);
            }
        });
    },
    showTextArea:function(index){
        $("#textSection"+index).show();
        $("#imageSection"+index).hide();
    },

    showMediaArea:function(newContentType,index){
        $("#textSection"+index).hide();
        $("#imageSection"+index).show();
        $("#textSection"+index).val('');

        if(newContentType=="image"){
            $('.clickable_image'+index).show();
            $('.media-video'+index).hide();
        }else if(newContentType=="video"){
            $('.clickable_image'+index).hide();
            $('.media-video'+index).show();
        }
    },
    autoVerticalLineHeight : function(i, j) {
        var max = 0;
        max = 30+(((i > j) ? i : j) * 26);
        $('.vertical_line').css("height", max>200?max:200 + "px");
    },
    uploadImage : function(fileId, previewImg, appendPlace) {

        var promises = [];
        var imageUpload;
        var result = true;
        var filePath = $('#' + fileId).val();
        if (filePath == '') {
            alert('please choose one image to upload.');
            return false;
        }
        $(appendPlace).after("<img src='/images/uploading.gif' class='uploading_layout'/>");
        $('input[type=file]').each(function() {
            if ($(this).attr("id") == fileId) {
                var input = $(this)[0];
                if (input.files.length > 0) {
                    var file = input.files[0];
                    var name = input.value.replace(/^.*[\\\/]/, '').replace('~', '-');
                    var extname = name.substring(name.lastIndexOf(".") + 1, name.length);
                    extname = extname.toLowerCase();
                    if (extname != "bmp" && extname != "jpg" && extname != "gif" && extname != "png") {
                        result = false;
                        return;
                    }
                    imageUpload = new Parse.File(name, file);
                    promises.push(imageUpload.save());
                }
            }
        });

        Parse.Promise.when(promises).then(function() {
            $(previewImg).attr("src", imageUpload.url());
            $('img[class=uploading_layout]').hide();

        });
        return result;
    },
    showOriginalImage : function() {
        $('.clickable_image').each(function() {
            $(this).click(function(e) {
                window.open($(this).attr("src"), 'image', 'height=600, width=800, top=0, left=0, toolbar=no, menubar=no, scrollbars=no, resizable=no,location=no, status=no');
                e.preventDefault();
            });
        });
    },
    scaleOriginalImage : function(img_class) {
        $('div[class=' + img_class + ']').each(function() {
            CrossPromoUtils.imageScaleHeight($(this), $(this).children('img'));
            CrossPromoUtils.imageScaleHeight($(this), $(this).children('video'));
        });
    },
    /**
     * whFiled contains the width and height info, imgField which will auto size
     * image
     */
    imageScaleHeight : function(whFiled, imgField) {
        var widthheight = $(whFiled).attr('widthheight');
        if (widthheight == undefined) {
            return;
        }
        var width = 0;
        var height = 0;
        var maxWidth = 250;
        if (widthheight != '' && widthheight != 'undefined') {
            var xyz = [];
            xyz = widthheight.split('x');
            width = xyz[0].trim();
            height = xyz[1].trim();
            if (width >= maxWidth) {
                var height = (maxWidth * height) / width;
                width = maxWidth;
            }
            // alert("WWW--XX HHH->"+width+" x "+height);
            $(imgField).width(width);
            $(imgField).height(height);
        }
    },
    resetSubmitButtonText:function(){
        $('#submit').html("Save Changes");
    }
}

StringUtils={
    isEmpty : function (string){
        return (string==null||string=="null"||string =='undefined'||string=='');
    },
    isNotEmpty : function (string){
        return !this.isEmpty(string);
    },
    isEmptyElementById :function (id){
        return this.isEmpty($('#'+id).val());
    },
    isNotEmptyElementById :function (id){
        return !this.isEmpty($('#'+id).val());
    },
    isBlank : function(string){
        return (string!=null&&string!="null"&&string !='undefined'&&string=='');
    }
}

FileUploadUtils = {
    handleImagesVideos: function (promises, files, imgVideoType, errMsg) {
        var result = true;
        var fileCount = 0;
        // check the extension
        $('.recommandFile').each(function () {
            var input = $(this)[0];
            if (input.files.length > 0) {
                fileCount++;
                var file = input.files[0];
                var name = input.value.replace(/^.*[\\\/]/, '').replace('~', '-');
                var extname = name.substring(name.lastIndexOf(".") + 1, name.length);
                extname = extname.toLowerCase();
                if (imgVideoType == "image") {
                    if (FileUploadUtils.isNotImageFile(extname)) {
                        errMsg.push("Please upload the image and only bmp / jpg / gif / png allowed.");
                        result = false;
                        return false;
                    }
                } else if (imgVideoType == "video") {
                    if (FileUploadUtils.isNotVideoFile(extname)) {
                        errMsg.push("Please upload the video and only mp4 allowed.");
                        result = false;
                        return false;
                    }
                }
                var parseFile = new Parse.File(name, file);
                // save file in Parse
                promises.push(parseFile.save());
                files.push({
                    column: $(this).prop('name'),
                    file: parseFile
                });
            }

        });
        return result;
    },
    validateApplicationImageVideo :function(promises, files, errMsg){
        var result = true;
        var fileCount = 0;
        // check the extension
        var imgVideoType="";
        $('.attachmentRow').each(function () {
            var meidaTypeEl=$(this).find('.mediaFindClass');
            for(var i=0;i<meidaTypeEl.length;i++){
                if ($(meidaTypeEl[i]).prop('checked')) {
                    imgVideoType = $(meidaTypeEl[i]).val();
                };
            }

            var uploadFiles=$(this).find('input[type="file"]');
            for(var i=0;i<uploadFiles.length;i++){
                var input = uploadFiles[i];
                if (input.files.length > 0) {
                    fileCount++;
                    var file = input.files[0];
                    var name = input.value.replace(/^.*[\\\/]/, '').replace('~', '-');
                    var extname = name.substring(name.lastIndexOf(".") + 1, name.length);
                    extname = extname.toLowerCase();
                    if (imgVideoType == "image") {
                        if (FileUploadUtils.isNotImageFile(extname)) {
                            errMsg.push("Please upload the image and only bmp / jpg / gif / png allowed.");
                            result = false;
                            return false;
                        }
                    } else if (imgVideoType == "video") {
                        if (FileUploadUtils.isNotVideoFile(extname)) {
                            errMsg.push("Please upload the video and only mp4 allowed.");
                            result = false;
                            return false;
                        }
                    }
                }
            }//end of for
        });
        return result;
    },
    handleApplicationAttachment: function (promises, files) {
        var result = true;
        var fileCount = 0;
        // check the extension
        var imgVideoType="";
        var contentText="";
        var linkTo="";
        $('.attachmentRow').each(function () {
            var pair=[];
            var meidaTypeEl=$(this).find('.mediaFindClass');
            for(var i=0;i<meidaTypeEl.length;i++){
                if ($(meidaTypeEl[i]).prop('checked')) {
                    imgVideoType = $(meidaTypeEl[i]).val();
                };
            }
            var newContentTag=$(this).find('.newContentTag').val();

            if(imgVideoType=="text"){
                contentText=$(this).find('.newContentText').val();
            }else{
                linkTo=$(this).find('[name="linkTo"]').val();

                //when media Type is Image / Video
                var uploadFiles=$(this).find('input[type="file"]');
                for(var i=0;i<uploadFiles.length;i++){
                    var input = uploadFiles[i];
                    if (input.files.length > 0) {
                        fileCount++;
                        var file = input.files[0];
                        var name = input.value.replace(/^.*[\\\/]/, '').replace('~', '-');
                        var parseFile = new Parse.File(name, file);
                        //TODO save file in Parse
                        promises.push(parseFile.save());
                        pair.push({
                            file:parseFile
                        })
                    }else{
                        pair.push({
                            file:null
                        })
                    }
                }//end of for
                if(pair.length<2){
                    alert("file lengt prolem");
                    return ;
                }
            }// end of text / image / video

            files.push({
                newContentTag: newContentTag,
                newContentType: imgVideoType,
                newContentText:contentText,
                iphoneFile: pair[0]?pair[0].file:null,
                ipadFile: pair[1]?pair[1].file:null,
                linkTo:linkTo
            });

        });
        return result;
    },
    handleFilesByClassName: function (promises, className, files) {
        $('.' + className).each(function () {
            var input = $(this)[0];
            if (input.files.length > 0) {
                var file = input.files[0];
                var name = input.value.replace(/^.*[\\\/]/, '');
                var parseFile = new Parse.File(name, file);
                promises.push(parseFile.save());
                files.push({
                    fileName: name,
                    column: $(this).prop('name'),
                    file: parseFile
                });
            }
        });
    },
    isImageFile: function (extName) {
        return (extName == "bmp" || extName == "jpg" || extName == "gif" || extName == "png");
    },
    isNotImageFile: function (extName) {
        return !this.isImageFile(extName);
    },
    isVideoFile: function (extName) {
        return extName == "mp4";
    },
    isNotVideoFile: function (extName) {
        return !this.isVideoFile(extName);
    }
}

ApplicationUtils = {
    resetSaveButtonText: function () {
        $('#saveAttachment').html("Save New Contents");
    },
    saveNewContentListener :function(){
        $('#saveAttachment').text('Submitting...');
        var promises = [];
          var appAttachments=[];
          var files = [];
          var errMsg=[];
          var orgMediaType = $('#orgMediaType').val();
          var url="";

          //check uploaded fies extendtions
        if (!FileUploadUtils.validateApplicationImageVideo(promises, files, errMsg)) {
              //upload has error or warnings.
              alert(errMsg[0]);
              ApplicationUtils.resetSaveButtonText();
              return;
          }

          //TODO Upload all files
          if (FileUploadUtils.handleApplicationAttachment(promises, files )) {
              //set file to application property
              var application =new Application();
              application.id=$('#applicationId').val();
              var validateResult=true;
              _.each(files, function(e) {
                  if( e.newContentType == "text" && e.newContentText ==""){
                      alert("New Content Text is empty,Please give it some value or remove this new Content!");
                      validateResult=false;
                      return;
                  }
                  if( e.newContentType != "text" && e.iphoneFile ==null &&e.ipadFile==null){
                      alert("Image/Video for iPhone / iPad both are empty,,Please give them some values or remove this new Content!")
                      validateResult=false;
                      return;
                  }
                  var applicationAttachment=new ApplicationAttachment();
                  applicationAttachment.set("newContentType", e.newContentType);
                  applicationAttachment.set("newContentTag", e.newContentTag);
                  applicationAttachment.set("newContentText", e.newContentText);
                  applicationAttachment.set("newContentMediaURLiPhone", e.iphoneFile);
                  applicationAttachment.set("newContentMediaURLiPad", e.ipadFile);
                  applicationAttachment.set("linkToUrl", e.linkTo);

                  applicationAttachment.set("application",application);
                  appAttachments.push(applicationAttachment);
              });
          }
//        validation failed
          if(!validateResult){
                  this.resetSaveButtonText();
                return;
          }

          Parse.Object.saveAll(appAttachments, {
              success: function(){
                  alert("Application Attachments saved.");
                  window.location =url;
              },
              error: function(){
                  console.log("saveAll attachments error.");
              }
          });
    },
    addNewContentListener :function(){
        $('#addAttachment').on('click',function(e){
            e.preventDefault();
            var orgHtml=$('#attachmentList').html();
            var fileCount=0;
            if(StringUtils.isNotEmpty(orgHtml)){
                var elements=$('#attachmentList').find('.attachmentRow');
                fileCount=elements.length==0?1:(elements.length+1);
            }
            var fileInput= '<div id="attachmentRow'+fileCount+'" class="media more_little_height_bottom more_height_top attachmentRow">'+
                '    <div>'+
                '     '+
                '        </br>'+
                '  Media Type: &nbsp;&nbsp;&nbsp;'+
                '        <input class="mediaFindClass mediaClass'+fileCount+'" name="applicationAttachment'+fileCount+'[newContentType]" value="text" type="radio" checked="checked"  > Text'+
                '        <input class="mediaFindClass mediaClass'+fileCount+'" name="applicationAttachment'+fileCount+'[newContentType]" value="image" type="radio" > Image'+
                '        <input class="mediaFindClass mediaClass'+fileCount+'"  name="applicationAttachment'+fileCount+'[newContentType]" value="video" type="radio">   Video ' +
                '       <a style="display:inline;position:relative;margin-left: 160px;"  class="btn btn-default" href="javascript:ApplicationUtils.deleteAttachment('+fileCount+')">Remove</a><br> <br>'+
                '    </div>'+

                '<div class="form-group"> ' +
                    '<label for="app-name">Tag <span style="color:#ff4348;">(please use , between tags eg: tag1,tag2,tag3)</span></label> ' +
                    '<input type="input" class="form-control split_input newContentTag" maxlength="200" name="attachment[newContentTag]" id="attachment-item-tag"  placeholder="Tag">' +
                '</div>' +

                '    <div id="textSection'+fileCount+'" class="textSection" style="display:block;">'+
                '        <div class="form-group">'+
                ' <div class="inline float_left" style="width:200px;">'+
                '                <label for="newContentText">New content text</label>'+
                '                <input type="input" class="form-control newContentText" maxlength="400" name="attachment[newContentText]" id="newContentText" value="" />'+
                '           </div>'+
                '        </div>'+
                '    </div>'+

                '    <div id="imageSection'+fileCount+'" class="imageSection"  style="display:none;">'+
                '        <div class="form-group">'+
                '            <div class="inline float_left" style="width:200px;">'+
                '                <label for="newContentMediaiPadURL">iPhone:</label>'+
                '                <input type="file" class="recommandFile file_width" name="newContentMediaiPhoneURL" id="newContentMediaiPhoneURL">'+
                '            </div>'+

                '            <div class="inline float_left">'+
                '                <label for="newContentMediaiPadURL">iPad:</label>'+
                '                <input type="file" class="recommandIpadFile file_width" name="newContentMediaiPadURL" id="newContentMediaiPadURL">'+
                '            </div>'+

                '            <div class="inline float_left">'+
                '                <label for="newContentMediaiPadURL">LinkTo:</label>'+
                '                <input type="text"  class="form-control linkTo" name="linkTo"  >'+
                '            </div>'+
                '              <div class="clean_style"></div>'+
                '        </div>'+
                '    </div>'+
                '     <div class="clean_style"></div><hr>'+
                '</div>';
            $('#attachmentList').append(fileInput);

            CrossPromoUtils.addTextMediaSwitchListener(".mediaClass",fileCount);

        });
    },
    deleteAttachment :function(count){
        //delete the removed element.
        $('#attachmentRow'+count).remove();
        var i=0;
        //recount the name ,Id values.
        $('.attachmentRow').each(function(){
            i++;
            $(this).attr('id','attachmentRow'+i);
            $(this).find('a').attr('href','javascript:ApplicationUtils.deleteAttachment('+i+')');
            $(this).find('.textSection').attr('id','textSection'+i);
            $(this).find('.imageSection').attr('id','imageSection'+i);
            var findEl=$(this).find('.mediaFindClass');
            $(findEl[0]).attr('class','mediaFindClass mediaClass'+i);
            $(findEl[1]).attr('class','mediaFindClass mediaClass'+i);
            $(findEl[2]).attr('class','mediaFindClass mediaClass'+i);
            CrossPromoUtils.addTextMediaSwitchListener(".mediaClass",i);

        })
    },
    deleteExistAttachment :function(count){
        if(!confirm('Are you sure you want to delete this New Content?')){
            return;
        }
        //delete the removed element.
        var deleteEl=$('#existAttachmentRow'+count);
        var existAttachment=$(deleteEl).find('.existAttachmentId');
        if(!existAttachment){
            console.log("can not delete existAttachmentId");
            return;
        }
        $(deleteEl).remove();
        var existAttachmentId=$(existAttachment).val();
        var applicationAttachment=new ApplicationAttachment();
        applicationAttachment.id=existAttachmentId;
        applicationAttachment.destroy({
            success: function(){
                alert("New Content is deleted..");
            },
            error: function(){
                alert('delete New Content error.');
                location.reload();
            }
        });
    },
    updateExistAttachment :function(count){
        if(!confirm('Are you sure you want to update this New Content ?')){
            return;
        }
        //delete the removed element.
        var updateEl=$('#existAttachmentRow'+count);
        var existAttachment=$(updateEl).find('.existAttachmentId');
        var newContentTag=$(updateEl).find('.newContentTag');
        var newContentText=$(updateEl).find('.newContentText');
        var linkToUrl=$(updateEl).find('.linkToUrl');
        if(!existAttachment){
            console.log("can not update existAttachmentId");
            return;
        }
        var existAttachmentId=$(existAttachment).val();

        var applicationAttachment=new ApplicationAttachment();
        applicationAttachment.id=existAttachmentId;
        applicationAttachment.set("newContentText",$(newContentText).val());
        applicationAttachment.set("newContentTag",$(newContentTag).val());
        applicationAttachment.set("linkToUrl",$(linkToUrl).val());

        applicationAttachment.save({
            success: function(){
                alert("New Content is updated..");
                location.reload();
            },
            error: function(){
                alert('update New Content error.');
                location.reload();
            }
        });
    }

}