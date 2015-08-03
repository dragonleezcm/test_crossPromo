MoreFunAppUtils = {
	handleImages : function(promises, files) {
		var result = true;
		$('input[type=file]').each(function() {
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
				var parseFile = new Parse.File(name, file);
				promises.push(parseFile.save());
				files.push({
					column : $(this).prop('name'),
					file : parseFile
				});
			}



		});
		return result;
	},
	validateUploadImageExt :function ( errMsg){
		var result = true;
		// check the image  extension
		$('.uploadImageFile').each(function() {
			var input = $(this)[0];
			if (input.files.length > 0) {
				var name = input.value.replace(/^.*[\\\/]/, '').replace('~', '-');
				var extname = name.substring(name.lastIndexOf(".") + 1, name.length);
				extname = extname.toLowerCase();
				if (extname != "bmp" && extname != "jpg" && extname != "gif" && extname != "png") {
					errMsg.push("Please upload the image and only bmp / jpg / gif / png allowed.");
					result =false;
					return false;
				}
			}
		});
		return result;
	},
	validateUploadVideoExt :function (errMsg){
		var result = true;
		// check the image  extension
		$('.uploadVideoFile').each(function() {
			var input = $(this)[0];
			if (input.files.length > 0) {
				var name = input.value.replace(/^.*[\\\/]/, '').replace('~', '-');
				var extname = name.substring(name.lastIndexOf(".") + 1, name.length);
				extname = extname.toLowerCase();
				if (extname != "mp4") {
					errMsg.push("Please upload the video and only mp4 allowed.");
					result =false;
					return false;
				}
			}
		});
		return result;
	},
	validateNotEmptyFiled :function(errMsg){
		var result =true;
		$('.notNull').each(function() {
			if ($(this).val()=="") {
				errMsg.push("Please fill up all the fields marked in red.");
				result=false;
				return false;
			}
		});
		return result;
	},
	commonImageVideosUpload :function (promises, files, errMsg){
		var result = true;
	 	var orgMediaType = $('#orgMediaType').val();
		var imgVideo; 
		$('.mediaClass').each(function() {
			if ($(this).prop('checked')) {
				imgVideo = $(this).val();
			}
		});

		// check the image / video extension
		$('.recommandFile').each(function() {
			var input = $(this)[0];
			if (input.files.length > 0) {
				var name = input.value.replace(/^.*[\\\/]/, '').replace('~', '-');
				var extname = name.substring(name.lastIndexOf(".") + 1, name.length);
				extname = extname.toLowerCase();
				if (imgVideo == "image") {
					if (extname != "bmp" && extname != "jpg" && extname != "gif" && extname != "png") {
						errMsg.push("Please upload the image and only bmp / jpg / gif / png allowed.");
						result = false;
						return false;
					}
				} else if (imgVideo == "video") {
					if (extname != "mp4") {
						errMsg.push("Please upload the video and only mp4 allowed.");
						result = false;
						return false;
					}
				}
			}
		});
		if(!result) return result;

		//validate file upload
		var fileCount = 0;
		$('input.recommandFile').each(function() {
			var input = $(this)[0];
			if (input.files.length > 0) {
				fileCount++;
			}
		});
		// avoid change the media_type but did not upload certain media file
		// when edit the MFA
		if (orgMediaType != imgVideo && fileCount <=0) {
			errMsg.push("Please upload the right images or videos!");
			result = false;
			return false;
		}

		//push files to array
		$('input[type = file]').each(function() {
			var input = $(this)[0];
			if (input.files.length > 0) {
				var file = input.files[0];
				var name = input.value.replace(/^.*[\\\/]/, '').replace('~', '-');
				var parseFile = new Parse.File(name, file);
				promises.push(parseFile.save());
				files.push({
					column : $(this).prop('name'),
					file : parseFile
				});
			}
		});
		return result;
	},
	handleImagesVideos : function(promises, files, errMsg) {
		var result = true;
		var orgShowInAdMeidaTypeMediaType = $('#orgShowInAdMeidaTypeMediaType').val();
		var orgMediaType = $('#orgMediaType').val();
		var imgVideo;
		var selectedAdImgVideo;
		var selectedShowInAdPage;
		$('.mediaClass').each(function() {
			if ($(this).prop('checked')) {
				imgVideo = $(this).val();
			}
		});
		$('.showInAdMeidaClass').each(function() {
			if ($(this).prop('checked')) {
				selectedAdImgVideo = $(this).val();
			}
		});
		$('.showInAdPage').each(function() {
			if ($(this).prop('checked')) {
				selectedShowInAdPage = $(this).val();
			}
		});
		var fileCount = 0;
		var adImageCount = 0;
		// check the extension
		$('.recommandFile').each(function() {
			var input = $(this)[0];
			if (input.files.length > 0) {
				fileCount++;
				var name = input.value.replace(/^.*[\\\/]/, '').replace('~', '-');
				var extname = name.substring(name.lastIndexOf(".") + 1, name.length);
				extname = extname.toLowerCase();
				if (imgVideo == "image") {
					if (extname != "bmp" && extname != "jpg" && extname != "gif" && extname != "png") {
						errMsg.push("Please upload the image and only bmp / jpg / gif / png allowed.");
						result = false;
						return false;
					}
				} else if (imgVideo == "video") {
					if (extname != "mp4") {
						errMsg.push("Please upload the video and only mp4 allowed.");
						result = false;
						return false;
					}
				}
			}
		});
		// check images or videos for ads page only for the In-App purchase
		var checkAdImageOrNot = $('#checkAdImageOrNot').val();
		if ($('.showInAdPage').prop('checked') && checkAdImageOrNot != '' && checkAdImageOrNot == 'yes') {
			// when user change the media type.
			// if($('#onlyCheckMediaType').val()=='no'){
			$('.recommandAdImage').each(function() {
				var input = $(this)[0];
				if (input.files.length > 0) {
					adImageCount++;
					var name = input.value.replace(/^.*[\\\/]/, '').replace('~', '-');
					var extname = name.substring(name.lastIndexOf(".") + 1, name.length);
					extname = extname.toLowerCase();
					if (selectedAdImgVideo == "image") {
						if (extname != "bmp" && extname != "jpg" && extname != "gif" && extname != "png") {
							errMsg.push("Please upload the image and only bmp / jpg / gif / png allowed.");
							result = false;
							return false;
						}
					} else if (selectedAdImgVideo == "video") {
						if (extname != "mp4") {
							errMsg.push("Please upload the video and only mp4 allowed.");
							result = false;
							return false;
						}
					}
				}
			});
			// firstly did not upload the image for ad page,then choose yes to
			// upload image/video for ad page
			var alreadyHasImageVideo = $("#alreadyHasImageVideo").val();
			if ($('#chosedAdPage').val() == 'false' && selectedShowInAdPage && !alreadyHasImageVideo && adImageCount < 6) {
				errMsg.push("Please upload all the images or videos for ad page!");
				result = false;
				return false;
			}

			// avoid change the media_type but did not upload certain media file
			// when edit the In-App Purchase
			if (selectedShowInAdPage && orgShowInAdMeidaTypeMediaType != selectedAdImgVideo && adImageCount < 6) {
				errMsg.push("Please upload all the right images or videos for ad page!");
				result = false;
				return false;
			}

			if ($('#token').val() == 'add' || orgShowInAdMeidaTypeMediaType == "") {
				// add and first select image/video do not check the original
				// type
			}
		}

		// check the extension
		$('.featuredImage').each(function() {
			var input = $(this)[0];
			if (input.files.length > 0) {
				fileCount++;
				var name = input.value.replace(/^.*[\\\/]/, '').replace('~', '-');
				var extname = name.substring(name.lastIndexOf(".") + 1, name.length);
				extname = extname.toLowerCase();
				if (extname != "bmp" && extname != "jpg" && extname != "gif" && extname != "png") {
					errMsg.push("Please upload the image and only bmp / jpg / gif / png allowed.");
					result = false;
					return false;
				}

			}
		});
		// if extension check failed alert the warning!
		if (!result) {
			return false;
		}
		// avoid change the media_type but did not upload certain media file
		// when edit the In-App Purchase
		if (orgMediaType != imgVideo && fileCount < 6) {
			errMsg.push("Please upload the right images or videos!");
			result = false;
			return false;
		}
		// add page check the extension and file count
		if ($("#token").val() == "add" && fileCount < 6) {
			errMsg.push("Please upload all the images or videos!");
			result = false;
			return false;
		}
		// result=MoreFunAppUtils.checkImgVideoInfo(files,errMsg);
		// alert("result:"+result);
		$('input[type=file]').each(function() {
			var input = $(this)[0];
			if (input.files.length > 0) {
				var file = input.files[0];
				var name = input.value.replace(/^.*[\\\/]/, '').replace('~', '-');
				var parseFile = new Parse.File(name, file);
				promises.push(parseFile.save());
				files.push({
					column : $(this).prop('name'),
					file : parseFile
				});
			}
		});
		return result;
	},
	// To save an More fun application
	saveMoreFunAppHandler : function(m) {
		var mfApplication = m;
		return function(e) {
			e.preventDefault();
			// validation
			if ($("#mfapp-name").val().trim() == "") {
				alert("Please enter the Name of App to include under More fun apps.");
				return;
			}
			var promises = [];
			var files = [];
			var errMsg =[];

			// validate banner image ext
			if (!MoreFunAppUtils.validateNotEmptyFiled( errMsg)) {
				alert(errMsg[0]);
				return;
			}

	    	// validate banner image ext
			if (!MoreFunAppUtils.validateUploadImageExt( errMsg)) {
				alert(errMsg[0]);
				return;
			}
			// validate video image ext
			if (!MoreFunAppUtils.validateUploadVideoExt( errMsg)) {
				alert(errMsg[0]);
				return;
			}
			if (!MoreFunAppUtils.commonImageVideosUpload(promises, files, errMsg)) {
				alert(errMsg[0]);
				return;
			}
			$('#submit').text('Submitting...');
			Parse.Promise.when(promises).then(function() {
				_.each(files, function(e) {
					mfApplication.set(e.column, e.file);
				});
				// Filters key name from input field attributes
				$('input').each(function() {
					if ($(this).prop('name').indexOf('mfApplication') !== -1) {
						if ($(this).prop('type') === 'date')
							mfApplication.set($(this).prop('name').replace(/mfApplication\[|\]/g, ''), $(this).val());
						else if ($(this).prop('type') === 'radio') {
							if ($(this).prop('checked')) {
								mfApplication.set($(this).prop('name').replace(/mfApplication\[|\]/g, ''), $(this).val());
							}
						} else
							mfApplication.set($(this).prop('name').replace(/mfApplication\[|\]/g, ''), $(this).val());
					}
				});
				var companyId = $('#hideCompanyId').val();
				if (companyId != "") {
					var company = new Company();
					company.id = companyId;
					mfApplication.set('company', company);
				}
				// After save, fill in the join table
				mfApplication.save(null, {
					success : function(o) {
						var applications = [];
						$("input:checkbox[name='applications[]']:checked").each(function() {
							applications.push($(this).val());
						});
						Parse.Cloud.run("setMorefunAppToApplications", {
							applications : applications,
							mfApplication : o.id
						}, {
							success : function(s) {
								alert("More fun app saved.");
								//go back to the list page
								//window.location = "/morefunapps_cmpy/" + companyId ;
								window.location = "/morefunapps/" + companyId + "/" + o.id;
								console.log(s);
							},
							error : function(error) {
								console.log(error);
							}
						});
					},
					error : function(o, error) {
					}
				});
			});
		}
	},
	savePurchaseItemHandler : function(p) {
		var purchaseitem = p;
		return function(e) {
			e.preventDefault();
			// validation
			if ($("#purchase-item-name").val().trim() == "" || $("#purchase-item-productId").val().trim() == "" || $("#purchase-item-price").val().trim() == ""
					|| $("#purchase-item-openNotificationName").val().trim() == "") {
				alert("Please enter the In-App Purchases in red.");
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
					purchaseitem.set(e.column, e.file);
				});
				// Filters key name from input field attributes
				$('input').each(function() {
					if ($(this).prop('name').indexOf('purchaseitem') !== -1) {
						if ($(this).prop('type') === 'radio') {
							if ($(this).prop('checked') && $(this).val() != '') {
								purchaseitem.set($(this).prop('name').replace(/purchaseitem\[|\]/g, ''), $(this).val());
							}
						} else
							purchaseitem.set($(this).prop('name').replace(/purchaseitem\[|\]/g, ''), $(this).val());
					}
				});
				$('select').each(function() {
					if ($(this).prop('name').indexOf('purchaseitem') !== -1) {
						purchaseitem.set($(this).prop('name').replace(/purchaseitem\[|\]/g, ''), $(this).val());
					}
				});
				purchaseitem.set('priceSymbol', $('#priceSymbol').html());
				var app = new Application();
				app.id = $(".hide_appId").val();
				if (app.id != "") {
					// set the one In-App Purchase to an application
					purchaseitem.set("application", app);
				}
				var companyid = $('#hideCompanyId').val();

				// save In-App Purchase
				purchaseitem.save(null, {
					success : function(o) {
                        var pid=o.id;
                        var locateUrl="/applications/" + companyid + "/" + app.id;
                        //save attachment
                        PurchaseItemUtils.saveAttachment(pid,locateUrl);

//                        alert("puchaeid:"+pid);
//                        alert("In-App Purchase saved.");
//						window.location = "/applications/" + companyid + "/" + app.id;
					},
					error : function(o, error) {
						console.log(o);
						console.log(error);
					}
				});
			});
		}
	}
}

PurchaseItemUtils ={
    addAttachmentListener :function(){
        $('#addAttachment').on('click',function(e){
            e.preventDefault();
            var orgHtml=$('#attachmentList').html();
            var fileCount=0;
            if(StringUtils.isNotEmpty(orgHtml)){
                var elements=$('#attachmentList').find('.divAttachment');
                fileCount=elements.length==0?1:(elements.length+1);
            }
            var fileInput='<div id="divAttachment'+fileCount+'" class="divAttachment" style="width:500px;height:35px;"><a class="btn btn-default" href="javascript:PurchaseItemUtils.deleteAttachment('+fileCount+')" style="margin-right:20px;display:inline">Remove</a><input type="file" style="display:inline" name="attachment'+fileCount+'" id="attachment'+fileCount+'" class="attachment" /></div>';
            $('#attachmentList').html(orgHtml+fileInput)

        });
    },
    deleteAttachment :function(count){
        if(!confirm('Are you sure you want to delete this file?')){
            return;
        }
        //delete record in DB,only edit page has hidden element
        var deleteElemlent=$('#divAttachment'+count);
        var hideAttachment=$(deleteElemlent).find('input[type="hidden"]');
        if(hideAttachment){
            hideAttachment.attr('id','hideIapAttachmentId'+count);
            var attachemntId=hideAttachment.val();
            var purchaseAttachment=new PurchaseAttachment();
            purchaseAttachment.id=attachemntId;
            purchaseAttachment.destroy({
                success: function(){
                    console.log("attachment deleted..");
                },
                error: function(){
                    console.log('delete attachment error.');
                }
            });
        }
        //delete the removed element.
        deleteElemlent.remove();
        var i=0;
        //recount the name ,Id values.
        $('.divAttachment').each(function(){
            i++;
            $(this).attr('id','divAttachment'+i);
            $(this).find('a').attr('href','javascript:PurchaseItemUtils.deleteAttachment('+i+')');
            var fileEl=$(this).find('input[type="file"]');
            $(fileEl).attr('name','attachment'+i);
            $(fileEl).attr('id','attachment'+i);
        })
    },
    saveAttachment : function(iapId,url){
        var promises=[];
        var files=[];
        var purchaseAttachments=[];
        FileUploadUtils.handleFilesByClassName(promises,'attachment',files);

        _.each(files,function(e){
            var purchaseItem=new PurchaseItem();
            purchaseItem.set("id",iapId);

            var purchaseAttachment=new PurchaseAttachment();
            purchaseAttachment.set('purchaseItem',purchaseItem);
            purchaseAttachment.set('attachment', e.file);
            purchaseAttachment.set('fileName', e.fileName);
            purchaseAttachments.push(purchaseAttachment);

        });

        Parse.Object.saveAll(purchaseAttachments, {
            success: function(){
                alert("In-App Purchase saved.");
                window.location =url;
            },
            error: function(){
                console.log("saveAll purchaseAttachments Error");
            }
        });

    }

}