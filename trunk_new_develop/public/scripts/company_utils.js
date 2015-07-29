CompanyUtils = {    
    //To save an company
    saveCompanyHandler: function(a){
    var company = a;
    return function(e){     
            e.preventDefault();                   
           
            //Filters key name from input field attributes           
            $('input').each(function(){               
                if($(this).val() != ""){                   
                  company.set($(this).prop('name'), $(this).val());
                }
            });     

            if($('#company-name').val().trim() == ''){
              alert("Please complete all fields marked with an *");
              return;
            }

            //After save, fill in the join table
            company.save(null, { 
              success: function(o) {  
                  var isOwn = $('#isOwn').val();   
                  alert("Company saved.");
                  if(isOwn == 'false'){  
                    //go back to company
                  //window.location = "/companys";
                    //go to edit page
                    window.location = "/companys/modify/" + o.id;                           
                  }else{
                    window.location = "/companys/change_profile/" + o.id;   
                  }
                },              
                error: function(o,error) {                  
              }
            });        
      }
  }
}