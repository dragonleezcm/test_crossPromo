UserUtils = {   
    // user login
    userLoginHandler: function(user){   
    return function(e){      
          e.preventDefault();          

          $('input').each(function(){
                if($(this).val() != ""){                   
                  user.set($(this).prop('name'), $(this).val());
                }
          });          
          Parse.User.logIn(user.get('username'), user.get('password'), {
              success: function(user) { 
                var queryRole = new Parse.Query(Parse.Role);  
                queryRole.get(user.get('role').id, {
                    success: function(role){ 
                      if(role.get('type') == 'administrator'){                               
                        window.location = "/companys";
                      }else{
                        var queryCompany = new Parse.Query(Company);  
                        queryCompany.get(user.get('company').id, {
                            success: function(company){ 
                              // check user is active
                              if(company.get('active') && user.get('active')){                                                      
                                  window.location = "/applications_cmpy/"+company.id;                                 
                              }else{
                                alert("You are inactive or your company is inactive!");
                                window.location = "/";
                              } 
                            },
                            error: function(company,error){
                                console.error("Error: " + error.code + " " + error.message);               
                            }
                        }); 
                      }  
                    },
                    error: function(role,error){
                        console.error("Error: " + error.code + " " + error.message);               
                    }
                });   

                             
              },
              error: function(user, error) {
                if(error.code == 101 || error.code ==200 || error.code == 201){
                  alert("Invalid username or password!");
                }else{
                  alert("Error: " + error.code + " " + error.message);  
                }                
              }
          });          
      }
  },

  // sign up user
  saveUserHandler: function(user){    
    return function(e){     
        e.preventDefault();          

        $('input').each(function(){
              if($(this).val() != ""){ 
                user.set($(this).prop('name'), $(this).val());
              }
        });   
         
        var roleQuery = new Parse.Query(Parse.Role);
        var roleId = $("select[name='role']").val();

        var userName = $('#user-name').val().trim();
        if(userName == ''){
          alert("Please complete all fields marked with an *");
          return;
        }
        var emailRE= /\w@\w*\.\w/;
        if(!emailRE.test(userName)){
          alert("please enter a valid email!");
          return;
        }
        if($('#pwd').val().trim() == ''){
          alert("Please complete all fields marked with an *");
          return;
        }       

        var queryCompany = new Parse.Query(Company);  
        queryCompany.get($('#companyId').val(), {
            success: function(company){                                      
                roleQuery.get(roleId, {
                  success: function(role) {             
                    user.set('role',role);                        
                    user.set('company',company); 
                    user.save(null, {
                      success: function(obj) {    
                           role.getUsers().add(user);
                           role.save(null,{
                              success: function(result) {    
                               alert("User saved.");
                               //goto user list
//                               window.location = "/company_users/" + company.id;  
                               //go to edit page
                                window.location = "/users/modify/" + obj.id;                       
                              },              
                              error: function(result,error) {     
                                alert(result + " Error: " + error.code + " " + error.message);               
                              }
                           })                            
                        },              
                        error: function(obj,error) {  
                          if(error.code == 125){
                            alert("Invalid email, please enter a valid one!");
                          }else{                                                 
                            alert(error.message);                                                               
                          }
                        }
                    });            
                  },
                  error: function(role, error) {    
                    alert("Error: " + error.code + " " + error.message);          
                  }
              });              
            },
            error: function(obj,error){
                console.error("Error: " + error.code + " " + error.message);               
            }
        });                     
            
      }
  },

  // update user
  updateUserHandler: function(user){    
    return function(e){     
          e.preventDefault();          

          $('input').each(function(){
                if($(this).val() != "" && $(this).prop('name') != ""){                                
                  user.set($(this).prop('name'), $(this).val());
                }
          });           

          var currentUserId = currentUser.id;
          var currentRoleId = currentUser.get('role').id;
          var roleId = $("select[name='role']").val();
         // alert(" $.cookie('cookie_companyid')"+ $.cookie('cookie_companyid'));
          var companyId= $.cookie('cookie_companyid') == "null"?"": $.cookie('cookie_companyid');
        //  alert("companyId"+companyId);
          Parse.Cloud.run('modifyUser', { roleId:roleId, userId:user.id,firstname:user.get("firstname"),lastname:user.get('lastname')}, {
            success: function(status) {            
              if(currentUserId == user.id && currentRoleId != roleId){
                alert("Your role have changed, please re-login!");
                window.location = "/";  
                return;       
              }
              var isOwn = $('#isOwn').val();   
              alert("User saved.");
              if(isOwn == 'false'){   
                //goto user list page
//                window.location = "/company_users/" +companyId;  
                //go back to user edit page.
                window.location = "/users/modify/" + user.id;                         
              }else{
                window.location = "/users/change_profile/" + user.id;   
              }                  
            },
            error: function(error) {             
                alert(error.message);              
            }
          });       
      }
  },  

  // change user password
  changeUserPwdHandler: function(){    
    return function(e){     
          e.preventDefault();  

          if($('#new-password').val().trim() == ''){
              alert("Please complete all fields marked with an *");
              return;
          }else if($('#new-password').val() != $('#confirm-new-password').val()){
              alert("Your second password does not match the first one!");
              return;
          }

          var user = Parse.User.current();  
          user.setPassword($('#new-password').val());
          user.save(null, {
            success: function(obj) {      
                alert("Please re-login!");
                window.location = "/";                                    
              },              
              error: function(obj,error) {     
                alert(obj + " Error: " + error.code + " " + error.message);               
              }
          });        
      }
  },

  // reset user password
  resetUserPwdHandler: function(){    
    return function(e){     
          e.preventDefault();  

          Parse.User.requestPasswordReset($('#email').val(), {
            success: function() {
              alert("Submit Successfully");
            },
            error: function(error) {              
              alert("Error: " + error.code + " " + error.message);
            }
          });           
      }
  }
}