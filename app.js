// MODULE PATTERN , uses IIFE and Closures #####################



// Budget ##############################################################################################
var budgetController = (function() {

    var Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };
    
    var Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        }
    };

    return {
        addItem: function(type, des, val) {
            var newItem, ID;

            if(data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;   // creating a new ID // the id of the last object of this array , add +1 to it.
            } else { ID = 0;}

            if      (type === 'exp') { newItem = new Expense(ID, des, val); }
            else if (type === 'inc') { newItem = new Income(ID, des, val);  }
            data.allItems[type].push(newItem);      // push it into our data structure
            return newItem;         // so whoever called this method , gets direct access to this new created object.
        },
        test: function(){
            console.log(data);
        }
    }

})();


// UI ###################################################################################################
var UIController = (function() {

    var DOMStrings = {
        inputType: '.add__type' ,
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list'

    }

    return {
        getInput: function() {
            return {
                type:           document.querySelector(DOMStrings.inputType).value,  // => inc or exp
                description:    document.querySelector(DOMStrings.inputDescription).value,
                value:          document.querySelector(DOMStrings.inputValue).value 
            }
        },

        getDOMStrings: function() {
            return DOMStrings;
        },

        addListItem: function(obj, type) {
            var html, newHtml, element;
            // create HTML string with place holder text

            if(type === 'inc') {
                element = DOMStrings.incomeContainer;
                html = '<div class="item clearfix" id="income-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }
            else if(type === 'exp') {
                element = DOMStrings.expensesContainer;
                html = '<div class="item clearfix" id="expense-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }

            //replace the place holder text with actual data
            newHtml = html.replace('%id%' , obj.id);
            newHtml = newHtml.replace('%description%' , obj.description);
            newHtml = newHtml.replace('%value%' , obj.value);

            //insert HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend' , newHtml);  // inserted as a last child of the element. 
        }
    }

})();


// Controller #############################################################################################
var controller = (function(budgetCtrl , UICtrl) {
    
    var setupEventListeners = function() {
        var DOM = UICtrl.getDOMStrings();
        document.querySelector(DOM.inputBtn).addEventListener('click' , ctrlAddItem);
        document.addEventListener('keypress', function(event){ if(event.keyCode == 13) { ctrlAddItem(); }  });
    }

    var ctrlAddItem = function() {  // this method is called only upon the click event.
        var input, newItem;
        input = UICtrl.getInput();   // extract the input added by the user

        // add the item the budget controller
        newItem = budgetCtrl.addItem(input.type, input.description, input.value);
        // add the item to the UI 

        // calculate the budget and dislay it on the UI

        budgetCtrl.test();

        UICtrl.addListItem(newItem, input.type);
    } 

    return {
        init: function() {
            console.log('the app started');
            setupEventListeners();
           
        }
    }

})(budgetController,UIController);


controller.init();












































