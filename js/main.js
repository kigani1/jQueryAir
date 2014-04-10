(function(){
    'use strict';
    var availableTickets = [
        {city: 'Barcelona', cost: 120},
        {city: 'Berlin', cost: 60},
        {city: 'London', cost: 50},
        {city: 'Oslo', cost: 100},
        {city: 'Stockholm', cost: 150},
        {city: 'Paris', cost: 100}
    ];
    var priorityCost = 15;
    var luggageCost = 20;
    
    /**************************
     PLUGINS
     *************************/
   
    ko.bindingHandlers.searchDestination = {
        init : function(element){
          $(element).typeahead(
            {source: function(query, callback){    
                query = query.toLowerCase();

                var result = availableTickets.filter(function(ticket){
                    return (ticket.city.toLocaleLowerCase().indexOf(query) !== -1);
                }).map(function(ticket){
                    return ticket.city;
                });
                callback(result);
            }
            });
        }
    };
    ko.bindingHandlers.chooseDate = {
        init : function(element){
            var nowTemp = new Date();
            var now = new Date(nowTemp.getFullYear(), nowTemp.getMonth(), nowTemp.getDate(), 0, 0, 0, 0);
            $(element).datepicker({
              onRender: function(date) {
                return date.valueOf() < now.valueOf() ? 'disabled' : '';
              }
            });    
        },
        update : function(element){
            $(element).on('changeDate', function(){
                var val = $(element).val();
                $(this).attr('value', val).trigger('change');
            });
        }
    };
    ko.bindingHandlers.chooseSeat = {
        init : function(element){          
            $(element).seatChooser();     
        },
        update : function(element){
            $(element).on('seatChanged', function() {
               var val = $(element).val();
               $(this).attr('value', val).trigger('change');
            });
        }
    };
   

    
    /**************************
     VALIDATORS
    *************************/

    ko.validation.rules['checked'] = {
        validator : function(value){
            if(!value){return false};
            return true;
        },
        message : 'You have to accept terms and conditions.'
    };
    ko.validation.rules['isValidDestination'] = {
        validator : function(value){
          return availableTickets.some(function(ticket) {
                return ticket.city === value;
          });
        },
        message: 'Invalid destination.'
    }
    
    ko.validation.registerExtenders();

    
    ko.validation.init({
                errorElementClass: 'has-error',
                decorateElement: true,
                insertMessages: false
    });
    var AppViewModel = function(){
        var self = this;
        this.query = ko.observable('');
        this.chosenDestination = ko.observable('').extend({required : true, isValidDestination : true});  
        this.terms = ko.observable(false).extend({checked : true});
        this.name = ko.observable('').extend({required: true, minLength : 3});
        this.surname = ko.observable('').extend({required: true, minLength : 3});
        this.email = ko.observable('').extend({required: true, email: {message : 'Invalid email format'}});
        this.seatId = ko.observable('').extend({required : {message : 'Please chose a preferred seat.'}});
        this.date = ko.observable('').extend({required : true, pattern : { params : /^(0?[1-9]|[12][0-9]|3[01])[\/\-](0?[1-9]|1[012])[\/\-]\d{4}$/, message : 'Invalid date foramt.' }})    

        this.additionalLuggage = ko.observable(0);
        this.priority = ko.observable(false);
        
        this.choosePriorityBoarding = function(){
            return true;
        };
        this.fullName = ko.computed(function(){
            return self.name() + ' ' + self.surname();
        });
        /**************************
         COST CALCULATION
        *************************/
        this.totalCost = ko.computed(function(){
            var ticketCost = 0;
            
            var ticket = availableTickets.filter(function(ticket){
                return (ticket.city === self.chosenDestination());
            });

            if(ticket.length === 1){
                ticketCost = ticket[0].cost;
            }

            return self.additionalLuggage() * luggageCost + (self.priority() ? priorityCost : 0) + ticketCost;
        });
        
        /**************************
         FORM SUBMIT
        *************************/
        this.bookSeat = function(){
            if(!self.name.isValid() || !self.surname.isValid() || !self.email.isValid() || !self.date.isValid() || !self.chosenDestination.isValid() || !self.terms.isValid()){
                var errors = ko.validation.group(self);                           
                errors.showAllMessages();
            }else{  
                $('#summaryModal').modal();
            }
        };
    }

    ko.applyBindings(new AppViewModel());
})();









