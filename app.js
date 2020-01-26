// MODULE PATTERN , uses IIFE and Closures #####################


// #########################################################################################################################
// BUDGET CONTROLLER ########################################################################################################
var budgetController = (function() {

    var Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function(totalIncome) {
        if(totalIncome > 0) { this.percentage = Math.round((this.value / totalIncome) * 100); } 
        else { this.percentage = -1; }
    }

    Expense.prototype.getPercentage = function() { return this.percentage; }
    
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
        },
        budget: 0,
        percentage: -1
    };

    var calculateTotal = function(type) {
        var sum = 0;
        data.allItems[type].forEach(function(cur) {
            sum += cur.value;
        });
        // data.allItems[type] = sum;   this is the bug !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        data.totals[type] = sum;
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

        deleteItem: function(type, id) {
            var ids , index;
            ids = data.allItems[type].map(function(current) {  // it creates a new array with the same length as the original one m and assign it new value (in this case y the same values)
                return current.id;
            });

            index = ids.indexOf(id);   // return -1 , if id not found !
            if(index !== -1) {
                data.allItems[type].splice(index, 1)
            }
        },

        calculateBudget: function() {
            calculateTotal('exp');
            calculateTotal('inc');
            data.budget = data.totals.inc - data.totals.exp;
            if(data.allItems.inc > 0) { data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100); }
            else { data.percentage = -1; }
        },

        getBudget: function() {
            return {
                budget: data.budget,
                totalInc : data.totals.inc,
                totalExp : data.totals.exp,
                percentage: data.percentage
            }
        },

        calculatePercentages: function() {   // each time we add a new item. all the .percentage of exp get recalculated. however their values wont change if the income didnt change.
            data.allItems.exp.forEach(function(cur) {
                cur.calcPercentage(data.totals.inc);
            });
        },

        getPercentages: function() {
            var allPerc = data.allItems.exp.map(function(cur) { // each time a new item is added. we will create a new array , made of the .percentages of exp 
                return cur.getPercentage();
            });
            return allPerc;
        },

        test: function(){  // just for testing purposes , u can delete it
            console.log(data);
        }
    }

})();


// ######################################################################################################################
// UI ####################################################################################################################
var UIController = (function() {

    var DOMStrings = {
        inputType: '.add__type' ,
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };

    var formatNumber = function(num,type) {
        var numSplit ,int, dec ;
        num = Math.abs(num);
        num = num.toFixed(2);  // it rounds the number , two decimals after the comma. || it returns a string representing the given number using fixed-point notation.
        
        numSplit = num.split('.');
        int = numSplit[0];
        dec = numSplit[1];

        if(int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3 , int.length);
        }

        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec + '€';
    };

    var nodeListForEach = function(list , callback) {
        for(var i = 0; i < list.length ; i++) {
            callback(list[i], i);
        }
    };

    return {

        getInput: function() {
            return {
                type:           document.querySelector(DOMStrings.inputType).value,  // => inc or exp
                description:    document.querySelector(DOMStrings.inputDescription).value,
                value:          parseFloat(document.querySelector(DOMStrings.inputValue).value)
            }
        },

        clearFields: function(){
            var fields, fieldsArr;
            fields = document.querySelectorAll(DOMStrings.inputDescription + ',' + DOMStrings.inputValue); // this returs a list. we wanna transform it into an array.
            fieldsArr = Array.prototype.slice.call(fields);  // turn the list into an array | because is a method of array object. | all method of the array object , are in the Array.prototype | slice() : return a copy of the array.
            fieldsArr.forEach(function(current, index, array) {
                current.value = '';
            });  
            fieldsArr[0].focus();        // return the cursor focused on description

        },

        getDOMStrings: function() {
            return DOMStrings;
        },

        displayDate: function() {
            var now, year , monthIndex , month;
            now = new Date();
            year = now.getFullYear();
            monthIndex= now.getMonth();
            var month= ["January","February","March","April","May","June","July",
            "August","September","October","November","December"];

            document.querySelector(DOMStrings.dateLabel).textContent = month[monthIndex] + ' ' + year;
        },

        displayBudget: function(obj) {
            document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(obj.budget , obj.budget > 0 ? 'inc' : 'exp');
            document.querySelector(DOMStrings.incomeLabel).textContent =  formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMStrings.expensesLabel).textContent = formatNumber(obj.totalExp , 'exp');
            
            if(obj.percentage > 0) { document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + '%'; }
            else { document.querySelector(DOMStrings.percentageLabel).textContent = '---'; }
        },

        displayPercentages: function(percentages) {  // argument : array of all the .percentage of exp
            var fields = document.querySelectorAll(DOMStrings.expensesPercLabel); // list of all the target nodes.

            nodeListForEach(fields, function(current,index) {
                if(percentages[index] > 0) { current.textContent = percentages[index] + '%'; }
                else { current.textContent = '---'; }
            });

        },

        addListItem: function(obj, type) {
            var html, newHtml, element;
            // create HTML string with place holder text

            if(type === 'inc') {
                element = DOMStrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }
            else if(type === 'exp') {
                element = DOMStrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }

            //replace the place holder text with actual data
            newHtml = html.replace('%id%' , obj.id);
            newHtml = newHtml.replace('%description%' , obj.description);
            newHtml = newHtml.replace('%value%' , formatNumber(obj.value,type));

            //insert HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend' , newHtml);  // inserted as a last child of the element. 
        },

        deleteListItem: function(selectorID) {
            var el = document.getElementById(selectorID);  
            el.parentNode.removeChild(el);      // because the element cant delete itself !
        },

        changedType: function() {
            var fields = document.querySelectorAll( 
               DOMStrings.inputType + ',' +
               DOMStrings.inputDescription + ',' +
               DOMStrings.inputValue);

            nodeListForEach(fields, function(cur) {
                cur.classList.toggle('red-focus');
            });

            document.querySelector(DOMStrings.inputBtn).classList.toggle('red');

        }

    }

})();


// ######################################################################################################################
//  GLOBAL APP CONTROLLER ###############################################################################################
var controller = (function(budgetCtrl , UICtrl) {
    
    var setupEventListeners = function() {
        var DOM = UICtrl.getDOMStrings();
        document.querySelector(DOM.inputBtn).addEventListener('click' , ctrlAddItem);
        document.addEventListener('keypress', function(event){ if(event.keyCode == 13) { ctrlAddItem(); }  });
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType)
    };

    var updateBudget = function() {
        // calculate the budget and dislay it on the UI
        budgetCtrl.calculateBudget();
        var budget = budgetCtrl.getBudget();
        // console.log(budget);
        UICtrl.displayBudget(budget);
    };

    var updatePercentages = function() {
        //calculate %
        budgetCtrl.calculatePercentages();
        //read % from budget controller
        var percentages = budgetCtrl.getPercentages(); // return a freshly created array with all the .percentages of all the exp
        //update the UI with the new %
        UICtrl.displayPercentages(percentages);

    }

    var ctrlAddItem = function() {  // this method is called only upon the click event.
        var input, newItem;
        input = UICtrl.getInput();   // extract the input added by the user

        if(input.description !== '' && !isNaN(input.value) && input.value > 0) {
        
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);
            UICtrl.addListItem(newItem, input.type);
            UICtrl.clearFields();
            updateBudget(); 
            updatePercentages();
        }

    };

    var ctrlDeleteItem = function(event) {
        var itemID , splitID, type, ID;
        itemID =  event.target.parentNode.parentNode.parentNode.parentNode.id ;

        if(itemID) {  // is the id defined ?
            splitID = itemID.split('-');
            type = splitID[0];
            ID   = parseInt(splitID[1]);

            // delete the item from data structure
            budgetCtrl.deleteItem(type, ID);
            // delete item from the ui
            UICtrl.deleteListItem(itemID);
            // update and show new budget
            updateBudget();
        }

    };

    return {
        init: function() {
            console.log('the app started');
            UICtrl.displayDate();
            setupEventListeners();
        }
    }

})(budgetController,UIController);


controller.init();












































