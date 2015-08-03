// These two lines are required to initialize Express in Cloud Code.
var express = require('express');
var app = express();
var parseExpressHttpsRedirect = require('parse-express-https-redirect');

var _ = require('underscore');
var Application = Parse.Object.extend("Application");
var ApplicationAttachment = Parse.Object.extend("ApplicationAttachment");
var Promotion = Parse.Object.extend("Promotion");
var PromotionBoard = Parse.Object.extend("PromotionBoard");
var PurchaseAttachment = Parse.Object.extend("PurchaseAttachment");
var Company = Parse.Object.extend("Company");
var MorefunApp = Parse.Object.extend("MorefunApp");
var MoreFunAppBoard = Parse.Object.extend("MoreFunAppBoard");
var PurchaseItem = Parse.Object.extend("PurchaseItem");

// Global app configuration section 
app.set('views', 'cloud/views');  // Specify the folder to find templates
app.set('view engine', 'ejs');    // Set the template engine
app.use(express.bodyParser());     // Middleware for reading request body
app.use(parseExpressHttpsRedirect());

// This is an example of hooking up a request handler with a specific request
// path and HTTP verb using the Express routing API.
app.get('/applications_attachment/:companyId/:applicationId', function(req, res) {
    var application = new Application();
    var company=new Company();
    application.id=req.params.applicationId;
    var companyId=req.params.companyId;
    company.id=companyId;
    var applicationAttachmentQuery = new Parse.Query(ApplicationAttachment);

    applicationAttachmentQuery.equalTo('application',application);
    applicationAttachmentQuery.find({
        success:function(applicationAttachments){
            console.log(applicationAttachments);
            res.render('applicationAttachment/show', {'applicationAttachments': applicationAttachments,'application':application,'companyName':company, 'companyId':companyId, 'reqPath':req.path,'userId':''});
        },
        error : function(error){
            console.log("Error: " + error.code + " " + error.message);
        }
    });

});
app.get('/applications_cmpy/:companyId', function(req, res) {
    var query = new Parse.Query(Application);
    var query_company = new Parse.Query(Company);
    var company=new Company();
    company.id=req.params.companyId;
    //find the company info(companyName)
    query_company.get(company.id).then(function(cmpy){
        query.equalTo("company", company);
        query.find({
            success: function(applications) {
                res.render('index', { 'applications': applications,'companyName':cmpy.get('companyName'),'companyId':company.id, 'reqPath':req.path,'userId':''});
            },
            error: function(error) {
                console.log("Error: " + error.code + " " + error.message);
            }
        });
    });
});
app.get('/promotions_cmpy/:companyId', function(req, res) {
    var query = new Parse.Query(Application);
    var query_promotion = new Parse.Query(Promotion);
    var query_company = new Parse.Query(Company);
    var company=new Company();
    company.id=req.params.companyId;

    query_company.get(company.id).then(function(cmpy){
        query_promotion.equalTo("company", company);
        query_promotion.find({
            success: function(promotions) {
                res.render('promotions/list', {'promotions': promotions ,'companyName':cmpy.get('companyName'),'companyId':company.id, 'reqPath':req.path,'userId':''});
            },
            error: function(error) {
                console.log("Error: " + error.code + " " + error.message);
            }
        });
    });
});

app.get('/applications/new/:companyId', function(req, res){
    var query = new Parse.Query(Promotion);
    //add more fun application selection
    var morefunappQuery = new Parse.Query(MorefunApp);
    var company = new Company();
    company.id = req.params.companyId;
    query.equalTo("company",company);
    query.find().then(function(promotions){
        morefunappQuery.equalTo("company",company);
        morefunappQuery.find({
            success: function(morefunapps) {
                res.render('applications/new', { 'promotions': promotions,'morefunapps':morefunapps, 'existingPromotions': [], 'companyId':company.id,'reqPath':req.path,'userId':'' });
            },
            error: function(error) {
                console.log("Error: " + error.code + " " + error.message);
                res.write('error');
            }
        });
    });
});

app.get('/applications/:companyId/:id', function(req, res){
    var applicationQuery = new Parse.Query(Application);
    var promotionQuery = new Parse.Query(Promotion);
    var promotionBoardQuery = new Parse.Query(PromotionBoard);
    var moreFunQuery = new Parse.Query(MorefunApp);
    var moreFunBoardQuery = new Parse.Query(MoreFunAppBoard);
    var purchaseItemQuery = new Parse.Query(PurchaseItem);
    var application = new Application();
    var company = new Company();
    application.id = req.params.id;
    company.id = req.params.companyId;
    var app;
    applicationQuery.get(req.params.id).then(function(application){
        promotionBoardQuery.equalTo("application", application);
        app = application;
        return promotionBoardQuery.find();
    }).then(function(promotionBoards){
        var promos = [];
        for(var i = 0; i < promotionBoards.length; i++){
            promos.push(promotionBoards[i].get('promotion'));
        }
        promotionQuery.equalTo("company", company);
        promotionQuery.find({
            success: function(promotions) {
                var selectedPromos = [];
                var morefunapps=[];
                for(var i = 0; i < promos.length; i++){ selectedPromos.push(promos[i].id); }

                moreFunBoardQuery.equalTo("application", app);
                moreFunBoardQuery.find().then(function(moreFunBoards){
                    var mfApps = [];
                    for(var i = 0; i < moreFunBoards.length; i++){
                        mfApps.push(moreFunBoards[i].get('morefunapp'));
                    }
                    //get More fun Applications
                    moreFunQuery.equalTo("company", company);
                    moreFunQuery.find({
                        success: function(results) {
                            //get seele
                            var selectedMfApps = [];
                            for(var i = 0; i < mfApps.length; i++){ selectedMfApps.push(mfApps[i].id); }

                            // get In-App Purchases
                            purchaseItemQuery.equalTo("application", app);
                            purchaseItemQuery.find({
                                success: function(purchaseitems){

                                    var applicationAttachmentQuery= new Parse.Query(ApplicationAttachment);
                                    applicationAttachmentQuery.equalTo("application",app);
                                    applicationAttachmentQuery.find({
                                        success: function(attachments){

                                            res.render('applications/show', {'attachments':attachments, 'application': app, 'promotions': promotions,'purchaseitems': purchaseitems, 'morefunapps':results,'existingPromotions': selectedPromos,'existingMfApps': selectedMfApps , 'companyId':company.id,'reqPath':req.path,'userId':''});
                                        },
                                        error: function(obj,error){
                                            console.error("Error: " + error.code + " " + error.message);
                                        }

                                    });
                                },
                                error: function(obj,error){
                                    console.error("Error: " + error.code + " " + error.message);
                                }
                            });
                        },
                        error: function(error) {
                            res.write('error');
                        }

                    });
                });
            },
            error: function(error) {
                res.write('error');
            }
        })
    }, function(error){
        console.log("Error: " + error.code + " " + error.message);
        res.write('error');
    });
});



app.get('/promotions/new/:companyId', function(req, res){
    var query = new Parse.Query(Application);
    var company=new Company();
    company.id=req.params.companyId;
    query.equalTo("company", company);
    query.find({
        success: function(results) {
            res.render('promotions/new', { 'applications': results, 'apps': [], 'companyId':company.id,'reqPath':req.path,'userId':'' });
        },
        error: function(error) {
            console.log("Error: " + error.code + " " + error.message);
            res.write('error');
        }
    });
});

app.get('/promotions/:companyId/:id', function(req, res){
    var applicationQuery = new Parse.Query(Application);
    var promotionQuery = new Parse.Query(Promotion);
    var promotionBoardQuery = new Parse.Query(PromotionBoard);
    var promotion = new Promotion();
    promotion.id = req.params.id;
    var promo;
    promotionQuery.get(req.params.id).then(function(promotion){
        promo = promotion;
        promotionBoardQuery.equalTo("promotion", promotion);
        return promotionBoardQuery.find();
    }).then(function(promotionBoards){
        var apps = [];
        for(var i = 0; i < promotionBoards.length; i++){
            apps.push(promotionBoards[i].get('application'));
        }
        var company=new Company();
        company.id=req.params.companyId;
        applicationQuery.equalTo("company", company);
        applicationQuery.find({
            success: function(results) {
                var selectedApps = []
                for(var i = 0; i < apps.length; i++){ selectedApps.push(apps[i].id); }
                res.render('promotions/show', { 'applications': results, 'promotion': promo, 'apps': selectedApps, 'companyId':company.id,'reqPath':req.path,'userId':'' });
            },
            error: function(error) {
                res.write('error');
            }
        })
    }, function(error){
        console.log("Error: " + error.code + " " + error.message);
        res.write('error');
    });
});

//More fun Application pages
app.get('/morefunapps_cmpy/:companyId', function(req, res) {
    var query = new Parse.Query(MorefunApp);
    var company=new Company();
    company.id= req.params.companyId;
    query.equalTo("company", company);
    query.ascending("order");
    query.find({
        success: function(apps) {
            res.render('morefunapps/list', { 'morefunapps': apps,'companyId':company.id,'reqPath':req.path,'userId':'' });
        },
        error: function(error) {
            console.log("Error: " + error.code + " " + error.message);
        }
    });
});
app.get('/morefunapps/new/:companyId', function(req, res) {
    var query = new Parse.Query(Application);
    var company=new Company();
    company.id= req.params.companyId;
    query.equalTo("company", company);
    query.find({
        success: function(apps) {
            res.render('morefunapps/new', { 'applications': apps, 'companyId':company.id,'reqPath':req.path,'userId':'' });
        },
        error: function(error) {
            console.log("Error: " + error.code + " " + error.message);
        }
    });
    console.log("Info: navigate to create more fun app page!");
});


app.get('/morefunapps/:companyId/:id', function(req, res){
    var applicationQuery = new Parse.Query(Application);
    var moreFunQuery = new Parse.Query(MorefunApp);
    var moreFunBoardQuery = new Parse.Query(MoreFunAppBoard);
    var morefunapp = new MorefunApp();
    morefunapp.id = req.params.id;

    var company=new Company();
    company.id= req.params.companyId;

    var mfApp;
    var max= 0;
    var id=req.params.companyId;
    Parse.Cloud.run("getMaxMoreFunAppCount", { companyId:id }, {
        success : function(s) {
            max=s;
            moreFunQuery.get(req.params.id).then(function(morefunapp){
                mfApp = morefunapp;
                moreFunBoardQuery.equalTo("morefunapp", morefunapp);
                return moreFunBoardQuery.find();
            }).then(function(moreFunBoards){
                var apps = [];
                for(var i = 0; i < moreFunBoards.length; i++){
                    apps.push(moreFunBoards[i].get('application'));
                }
                applicationQuery.equalTo("company", company);
                applicationQuery.find({
                    success: function(results) {
                        var selectedApps = []
                        for(var i = 0; i < apps.length; i++){ selectedApps.push(apps[i].id); }
                        res.render('morefunapps/show', { 'applications': results, 'mfApplication': mfApp, 'apps': selectedApps, 'companyId':company.id,'reqPath':req.path,'userId':'','maxCount' : max });
                    },
                    error: function(error) {
                        res.write('error');
                    }
                })
            }, function(error){
                console.log("Error: " + error.code + " " + error.message);
                res.write('error');
            });
        },
        error : function(error) {
            console.log(error);
        }
    });
});

//TODO
app.get('/purchaseitems/new/:companyId/:appid', function(req, res){
    res.render('purchaseitems/new',{"appId":req.params.appid, 'companyId':req.params.companyId,'reqPath':req.path,'userId':''});
});

app.get('/purchaseitems/:companyId/:appid/:id', function(req, res) {
    var purchaseitemQuery = new Parse.Query(PurchaseItem);
    purchaseitemQuery.get(req.params.id,{
        success : function(purchaseitem) {
            //TODO
            var purchaseAttachment = new Parse.Query(PurchaseAttachment);
            purchaseAttachment.equalTo("purchaseItem", purchaseitem);
            purchaseAttachment.find({
                success: function(attachments) {
                    res.render('purchaseitems/show', { 'attachments':attachments, 'purchaseitem' : purchaseitem ,'appid':req.params.appid, 'companyId':req.params.companyId,'reqPath':req.path,'userId':''});
                },
                error: function(error) {
                    console.error("Error: " + error.code + " " + error.message);
                }
            });


        },
        error : function(error) {
            res.write('error');
        }
    });
});



// ---------- user module ---------
app.get('/', function(req, res) {
    res.render('login');
});

app.get('/company_users/:companyId', function(req, res) {
    var queryCompany = new Parse.Query(Company);
    queryCompany.get(req.params.companyId, {
        success: function(company){
            var queryUser = new Parse.Query(Parse.User);
            queryUser.equalTo("company", company);
            queryUser.find({
                success: function(results) {
                    res.render('users/user_list',{'users':results, 'companyId':company.id,'reqPath':req.path,'userId':''});
                },
                error: function(error) {
                    console.error("Error: " + error.code + " " + error.message);
                }
            });
        },
        error: function(obj,error){
            console.error("Error: " + error.code + " " + error.message);
        }
    });
});
app.get('/users/new/:companyId', function(req, res) {
    var queryRole = new Parse.Query(Parse.Role);
    queryRole.find({
        success: function(results) {
            res.render('users/new',{'roles':results,'companyId':req.params.companyId,'reqPath':req.path,'userId':''});
        },
        error: function(error) {
            console.error("Error: " + error.code + " " + error.message);
        }
    });
});

app.get('/users/change_pwd', function(req, res) {
    res.render('users/change_pwd',{'reqPath':req.path, 'companyId':'','userId':''});
});

/*
 app.get('/users/reset_password', function(req, res) {
 res.render('users/forgot_password');
 });
 */

app.get('/users/logout', function(req, res) {
    res.render('users/logout',{'res':res});
});

app.get('/users/modify/:id', function(req, res){
    var queryUser = new Parse.Query(Parse.User);
    var queryRole = new Parse.Query(Parse.Role);

    var roles;
    queryRole.find({
        success:function(list) {
            roles = list;
        }
    });
    queryUser.get(req.params.id, {
        success: function(user){
            queryRole.get(user.get('role').id, {
                success: function(role){
                    res.render('users/show', { 'user': user, 'role':role, 'roles':roles,'isOwn':false, 'reqPath':req.path,'companyId':user.get('company').id,'userId':''});
                },
                error: function(obj,error){
                    console.error("Error: " + error.code + " " + error.message);
                }
            });
        },
        error: function(obj,error){
            console.error("Error: " + error.code + " " + error.message);
        }
    });
});

app.get('/users/change_profile/:id', function(req, res){
    var queryUser = new Parse.Query(Parse.User);
    var queryRole = new Parse.Query(Parse.Role);

    var roles;
    queryRole.find({
        success:function(list) {
            roles = list;
        }
    });
    queryUser.get(req.params.id, {
        success: function(user){
            queryRole.get(user.get("role").id, {
                success: function(role){
                    if(role.get('type') == 'administrator'){
                        var company = new Company();
                        company.set("id",null);
                        user.set("company",company);
                    }
                    res.render('users/show', { 'user': user, 'role':role, 'roles':roles,'isOwn':true, 'reqPath':req.path,'companyId':user.get('company').id,'userId':user.id});
                },
                error: function(error) {
                    console.error("Error: " + error.code + " " + error.message);
                }
            });
        },
        error: function(obj,error){
            console.error("Error: " + error.code + " " + error.message);
        }
    });
});
// --------------------------------------

// ---------- companys module ---------
app.get('/companys', function(req, res) {
    var queryCompany = new Parse.Query(Company);
    queryCompany.find().then(function(companys){
        queryCompany.find({
            success: function(results) {
                res.render('companys/company_list', { 'companys': results, 'reqPath':req.path,'companyId':'','userId':''});
            },
            error: function(error) {
                console.error("Error: " + error.code + " " + error.message);
            }
        });
    });
});

app.get('/companys/new', function(req, res) {
    res.render('companys/new',{ 'isOwn':false, 'companyId':'','reqPath':req.path,'userId':''});
});

app.get('/companys/modify/:id', function(req, res){
    var companyQuery = new Parse.Query(Company);

    companyQuery.get(req.params.id, {
        success: function(obj){
            res.render('companys/show', { 'company': obj, 'isOwn':false,'showNav':false, 'reqPath':req.path,'companyId':obj.id,'userId':''});
        },
        error: function(obj,error){
            console.error("Error: " + error.code + " " + error.message);
        }
    });
});

app.get('/companys/change_profile/:id', function(req, res){
    var companyQuery = new Parse.Query(Company);

    companyQuery.get(req.params.id, {
        success: function(obj){
            res.render('companys/show', { 'company': obj, 'isOwn':true,'showNav':true, 'reqPath':req.path,'companyId':obj.id,'userId':''});
        },
        error: function(obj,error){
            console.error("Error: " + error.code + " " + error.message);
        }
    });
});
// --------------------------------------

// Attach the Express app to Cloud Code.
app.listen();