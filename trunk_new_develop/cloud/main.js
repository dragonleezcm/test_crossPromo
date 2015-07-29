require('cloud/app.js');
var Application = Parse.Object.extend("Application");
var ApplicationAttachment = Parse.Object.extend("ApplicationAttachment");
var Promotion = Parse.Object.extend("Promotion");
var PromotionBoard = Parse.Object.extend("PromotionBoard");
var PurchaseAttachment = Parse.Object.extend("PurchaseAttachment");
var MorefunApp = Parse.Object.extend("MorefunApp");
var MoreFunAppBoard = Parse.Object.extend("MoreFunAppBoard");



//Adds one application to multiple promotions
Parse.Cloud.define("setApplicationToPromotions", function(req, res){
    var app = new Application();
    var promotionBoardQuery = new Parse.Query("PromotionBoard");
    app.id = req.params.application;
    promotionBoardQuery.equalTo("application", app);
    promotionBoardQuery.find({
        success: function(pb){
            //Destroy all old promotionBoards with application
            for(var i = 0; i < pb.length; i++){
                pb[i].destroy();
            }
            var promotionBoards = [];
            if(req.params.promotions.length==0){
				//remove all the relation table's data
            	promotionBoards.push( new PromotionBoard());
			}
            for(var i = 0; i < req.params.promotions.length; i++){
                var promotionBoard = new PromotionBoard();
                var promotion = new Promotion();
                promotion.id = req.params.promotions[i];
                promotionBoard.set('application', app);
                promotionBoard.set('promotion', promotion);
                promotionBoards.push(promotionBoard);
            }

            Parse.Object.saveAll(promotionBoards, {
                success: function(){
                    res.success("Success");
                },
                error: function(){
                    res.error("Error");
                }
            });
        },
        error: function(error){
            res.error("Error, see parse log for message");
        }
    });
});

//Addsd one promotion to multiple applications
Parse.Cloud.define("setPromotionToApplications", function(req, res){
    var promo = new Promotion();
    var promotionBoardQuery = new Parse.Query("PromotionBoard");
    promo.id = req.params.promotion;
    promotionBoardQuery.equalTo("promotion", promo);
    promotionBoardQuery.find({
        success: function(pb){
            //Destroy all old promotionBoards with promotion
            for(var i = 0; i < pb.length; i++){
                pb[i].destroy();
            }
            var promotionBoards = [];
            if(req.params.applications.length==0){
				//remove all the relation table's data
            	promotionBoards.push( new PromotionBoard());
			}
            for(var i = 0; i < req.params.applications.length; i++){
                var promotionBoard = new PromotionBoard();
                var application = new Application();
                application.id = req.params.applications[i]
                promotionBoard.set('application', application);
                promotionBoard.set('promotion', promo);
                promotionBoards.push(promotionBoard);
            }
            Parse.Object.saveAll(promotionBoards, {
                success: function(){
                    res.success("Success");
                },
                error: function(){
                    res.error("Error");
                }
            });
        },
        error: function(error){
            res.error("Error, see parse log for message");
        }
    })
});
//Addsd one more fun app to multiple applications
Parse.Cloud.define("setMorefunAppToApplications", function(req, res){
	var morefunapp = new MorefunApp();
	var moreFunAppBoardQuery = new Parse.Query("MoreFunAppBoard");
	morefunapp.id = req.params.mfApplication;
	moreFunAppBoardQuery.equalTo("morefunapp", morefunapp);
	moreFunAppBoardQuery.find({
		success: function(pb){
			//Destroy all old moreFunAppBoards with promotion
			for(var i = 0; i < pb.length; i++){
				pb[i].destroy();
			}
			var moreFunAppBoards = [];
			if(req.params.applications.length==0){
				//remove all the relation table's data
				moreFunAppBoards.push( new MoreFunAppBoard());
			}
			for(var i = 0; i < req.params.applications.length; i++){
				var moreFunAppBoard = new MoreFunAppBoard();
				var application = new Application();
				application.id = req.params.applications[i]
				moreFunAppBoard.set('application', application);
				moreFunAppBoard.set('morefunapp', morefunapp);
				moreFunAppBoards.push(moreFunAppBoard);
			}
			
			Parse.Object.saveAll(moreFunAppBoards, {
				success: function(){
					res.success("Success");
				},
				error: function(){
					res.error("Error");
				}
			});
		},
		error: function(error){
			res.error("Error, see parse log for message");
		}
	})
});

//Adds one application to multiple morefunapps
Parse.Cloud.define("setApplicationToMorefunApps", function(req, res){
  var app = new Application();
  var morefunappBoardQuery = new Parse.Query("MoreFunAppBoard");
  app.id = req.params.application;
  morefunappBoardQuery.equalTo("application", app);
  morefunappBoardQuery.find({
      success: function(pb){
          //Destroy all old morefunappBoards with application
          for(var i = 0; i < pb.length; i++){
              pb[i].destroy();
          }
          var moreFunAppBoards = [];
      	if(req.params.morefunapps.length==0){
			//remove all the relation table's data
			moreFunAppBoards.push( new MoreFunAppBoard());
		}
          for(var i = 0; i < req.params.morefunapps.length; i++){
              var morefunappBoard = new MoreFunAppBoard();
              var morefunapp = new MorefunApp();
              morefunapp.id = req.params.morefunapps[i];
              morefunappBoard.set('application', app);
              morefunappBoard.set('morefunapp', morefunapp);
              moreFunAppBoards.push(morefunappBoard);
          }
          Parse.Object.saveAll(moreFunAppBoards, {
              success: function(){
                  res.success("Success");
              },
              error: function(){
                  res.error("Error");
              }
          });
      },
      error: function(error){
          res.error("Error, see parse log for message");
      }
  });
});
//Adds one application to multiple In-App Purchases
Parse.Cloud.define("setApplicationToPurchaseItems", function(req, res){
	var app = new Application();
	var morefunappBoardQuery = new Parse.Query("MoreFunAppBoard");
	app.id = req.params.application;
	morefunappBoardQuery.equalTo("application", app);
	morefunappBoardQuery.find({
		success: function(pb){
			//Destroy all old moreFunAppBoards with application
			for(var i = 0; i < pb.length; i++){
				pb[i].destroy();
			}
			var moreFunAppBoards = [];
			if(req.params.morefunapps.length==0){
				//remove all the relation table's data
				moreFunAppBoards.push( new MoreFunAppBoard());
			}
			for(var i = 0; i < req.params.morefunapps.length; i++){
				var morefunappBoard = new MoreFunAppBoard();
				var morefunapp = new MorefunApp();
				morefunapp.id = req.params.morefunapps[i];
				morefunappBoard.set('application', app);
				morefunappBoard.set('morefunapp', morefunapp);
				moreFunAppBoards.push(morefunappBoard);
			}
			Parse.Object.saveAll(moreFunAppBoards, {
				success: function(){
					res.success("Success");
				},
				error: function(){
					res.error("Error");
				}
			});
		},
		error: function(error){
			res.error("Error, see parse log for message");
		}
	});
});

//check application store id
Parse.Cloud.define("checkAppStoreId", function(req, res){
	var applicationQuery = new Parse.Query("Application");
	var appStoreId= req.params.appStoreId;
	var editAppId= req.params.appId;
	applicationQuery.equalTo("storeIdentifier", appStoreId);
	applicationQuery.find({
		success: function(app){
			 if(app==null||app==''){
				 res.success("true");
			 }else{
				 if(app.length>1){
					 res.success("two");
				 }
				 else if(app[0].id==editAppId){
					 res.success("true");
				 }else{
					 res.success("false");
				 }
			 }
		},
		error: function(error){
			res.error("Error, see parse log for message");
		}
	});
});

Parse.Cloud.define("modifyUser", function(request, response) {  
  Parse.Cloud.useMasterKey();

  var userId = request.params.userId;
  var firstname = request.params.firstname;
  var lastname = request.params.lastname; 
  var roleId = request.params.roleId; 

  var query = new Parse.Query(Parse.User);  
  var roleQuery = new Parse.Query(Parse.Role);

  roleQuery.get(roleId, {
    success: function(role) { 
      query.get(userId, {
        success: function(updatedUser) {
         // Save the user.         
          updatedUser.save({
                firstname: firstname,
                lastname: lastname,
                role: role            
              },
              {
                success: function(updatedUser) {                        
                  response.success("Successfully updated user.");
                },
                error: function(updatedUser, error) {              
                  response.error(error.message);
                }
              });
        },
        error: function(error) {
          response.error("Could not find user.");
        }
      });
    }
  }) 
});

Parse.Cloud.define("activateyUser", function(request, response) {  
  Parse.Cloud.useMasterKey();

  var userId = request.params.userId; 

  var query = new Parse.Query(Parse.User);   
  query.get(userId, {
    success: function(user) {
        user.set('active', !user.get('active'));
        user.save(null, {
            success: function(o) {
                if(o.get('active')){
                    response.success("User Activated");
                }
                else {
                    response.success("User Deactivated");
                }
            },
            error: function(o, error) {
                response.success("Error: " + error.code + " " + error.message);
            }
        });
    },
    error: function(error) {
      response.error("Could not find user.");
    }
  }); 
});

/*
curl -X POST \
  -H "X-Parse-Application-Id: oglfJd2lzSVj3p6Ybd6rDpxxz3t4tdNVTvWzVNiA" \
  -H "X-Parse-REST-API-Key: ZGo2RHIWUqimCI3hxk2yg0nzXmeYRbEbdTyEPQVT" \
  -H "Content-Type: application/json" \
  -d '{"storeIdentifier":"578982065"}' \
  https://api.parse.com/1/functions/promotions
 
 
*/