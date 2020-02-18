// MODULE PATTERN , uses IIFE and Closures #####################


// #########################################################################################################################
// BUDGET CONTROLLER ########################################################################################################
var budgetController = (function() {

    // Object function constructor
    var Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1; // this is the % of the value of the item , compared to the totalIncome !
    };

    // End-Result : it calculates and updates the key 'percentages' of the caller Object.
    Expense.prototype.calcPercentage = function(totalIncome) {
        if(totalIncome > 0) { this.percentage = Math.round((this.value / totalIncome) * 100); } 
        else { this.percentage = -1; }
    }

    // End-Result : it returns the value of the key 'percentages' of the caller Object.
    Expense.prototype.getPercentage = function() { return this.percentage; }
    
    // Object function constructor
    var Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    // this is an object containin all the calculation data we workin with.
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
        percentage: -1   //this is the percentage of totalExpenses compared to the totalIncomes !
    };

    // End-Result : it updates data.totals[type] | it calculates the total of incomes/expenses.
    var calculateTotal = function(type) {
        var sum = 0;
        data.allItems[type].forEach(function(cur) {
            sum += cur.value;
        });
        data.totals[type] = sum;
    };

    return {

        // End-Result : it creates a new object based on the passed arguments. it push that object to the corresponding array.
        // and then returns that object.
        addItem: function(type, des, val) {
            var newItem, ID;

            // creating a new ID  | 
            if(data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1; //the id of the last object of this array , add +1 to it.
            } else { ID = 0;} // in case the array is empty.

            // create a new object based on the type. and then we push to it to the corresponding array of objects.
            if      (type === 'exp') { newItem = new Expense(ID, des, val); }
            else if (type === 'inc') { newItem = new Income(ID, des, val);  }
            data.allItems[type].push(newItem);  
            console.log(data.allItems[type]);
            return newItem;     // so whoever called this method , gets direct access to this new created object.
        },

        // End-Result : it removes an object from the data.allItems[exp/inc] array.
        deleteItem: function(type, id) {
            var ids , index;
            // it creates a new array with the same length as the original one , containin all the id's of the incomes/expenses items.
            ids = data.allItems[type].map(function(current) {  return current.id; });
            index = ids.indexOf(id);   // indexOf() return -1 , if id not found !
            // we delete the item via calling splice() without a third argument.
            if(index !== -1) { data.allItems[type].splice(index, 1) }
        },

        // End-Result : it calculates the budget based on the expenses and incomes. | it updates the data structure (data.budget AND data.percentage)
        calculateBudget: function() {
            calculateTotal('exp');
            calculateTotal('inc');
            data.budget = data.totals.inc - data.totals.exp;
            if(data.allItems.inc.length > 0) { data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);  }
            else { data.percentage = -1;}
        },

        // End-Result : it returns an object containing : budget , totalInc , totalExp , percentage
        getBudget: function() {
            return {
                budget: data.budget,
                totalInc : data.totals.inc,
                totalExp : data.totals.exp,
                percentage: data.percentage
            }
        },

        // each time we add a new item. all the .percentage of exp get recalculated. however their values wont change if the income didnt change.
        calculatePercentages: function() {  
            data.allItems.exp.forEach(function(cur) {
                cur.calcPercentage(data.totals.inc);
            });
        
        },

        // End-Result : returns a new array (created from the array of object 'data.allItems.exp') containing all percentages of all the expenses objects.
        getPercentages: function() {
            // each time a new item is added. we will create a new array , made of the .percentages of exp
            var allPerc = data.allItems.exp.map(function(cur) { // array.map() => returns An Array containing the results of calling the provided function for each element in the original array.
                return cur.getPercentage();
            });
            return allPerc; 
        },

    }

})();


// ######################################################################################################################
// UI ####################################################################################################################
var UIController = (function() {

    var DOMStrings = {
        inputType: '.add__type' ,  // this is the <select> element , that contains two options (- or +)
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn', // we click this button to add an item to the list , after we fill the desciption and value fields.
        incomeContainer: '.income__list',  // this is the income list.
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',  //this is the container of income and expenses lists.
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };

    // End-Result :  it turns the passed number into a string. if its a floating number. it takes care of the comma as well.
    var formatNumber = function(num,type) {
        var numSplit ,int, dec ;
        num = Math.abs(num);
        num = num.toFixed(2);  // it rounds the number, two decimals after the comma. || it returns a string representing the given number using fixed-point notation.
        
        numSplit = num.split('.');
        int = numSplit[0];
        dec = numSplit[1];

        if(int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3 , int.length);
        }

        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec + '€';
    };

    // a helping function : you pass two arguments to it . 
    // 1)NodeList
    // 2)the function that you want perform on each node of that list.
    var nodeListForEach = function(list , callback) {
        for(var i = 0; i < list.length ; i++) {
            callback(list[i], i);
        }
    };

    return {

        // it returns an object. its elements : type ,description and value.
        getInput: function() {
            return {
                type:           document.querySelector(DOMStrings.inputType).value,  // => inc or exp
                description:    document.querySelector(DOMStrings.inputDescription).value,
                value:          parseFloat(document.querySelector(DOMStrings.inputValue).value) //it makes it a float number.
            }
        },

        // End-Result : it clears the description and value fields.
        clearFields: function(){
            var fields, fieldsArr;
            fields = document.querySelectorAll(DOMStrings.inputDescription + ',' + DOMStrings.inputValue); // this returs a list. we wanna transform it into an array.
            fieldsArr = Array.prototype.slice.call(fields);  // turn the list into an array | slice() : return a copy of the array.
            fieldsArr.forEach(function(current, index, array) {
                current.value = '';
            });  
            fieldsArr[0].focus();    // return the cursor focused on description

        },

        getDOMStrings: function() {
            return DOMStrings;
        },

        // End-Result : it displays the correct Month and Year on the UI.
        displayDate: function() {
            var now, year, monthIndex, month;
            now = new Date();
            year = now.getFullYear();
            monthIndex = now.getMonth();  // this method returns the index of the month !
            var month= ["January","February","March","April","May","June","July",
            "August","September","October","November","December"];

            document.querySelector(DOMStrings.dateLabel).textContent = month[monthIndex] + ' ' + year;
        },

        // End-Result : it displays the new budget , totalIncom , and totalExpenses on the UI
        displayBudget: function(obj) {
            document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(obj.budget , obj.budget > 0 ? 'inc' : 'exp');
            document.querySelector(DOMStrings.incomeLabel).textContent =  formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMStrings.expensesLabel).textContent = formatNumber(obj.totalExp , 'exp');
            
            if(obj.percentage > 0) {
                document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + '%';
            }
            else {
                document.querySelector(DOMStrings.percentageLabel).textContent = '---';
             }
        },

        // End-Result : it displays the new percentages of the expenses items , after adding a new item.
        displayPercentages: function(percentages) {  // argument : array of all the .percentage of exp
            var fields = document.querySelectorAll(DOMStrings.expensesPercLabel); // list of all the target nodes.

            nodeListForEach(fields, function(current,index) {
                // if the percentage is bigger than zero , display it. otherwise display '---'
                if(percentages[index] > 0) { current.textContent = percentages[index] + '%'; } // percentages[index] is + , only when totalIncome > 0
                else { current.textContent = '---'; }
            });

        },

        // End-Result : it adds a new item to the UI. by inserting a new HTML element.
        addListItem: function(obj, type) {
            var html, newHtml, element;

            if(type === 'inc') {
                element = DOMStrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><svg class="cancel__logo">  <use xlink:href="img/symbol-defs.svg#icon-cancel-circle"></use> </svg></button></div></div></div>'
            }
            else if(type === 'exp') {
                element = DOMStrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><svg class="cancel__logo">  <use xlink:href="img/symbol-defs.svg#icon-cancel-circle"></use> </svg></button></div></div></div>'
            }

            //replace the place holder text with actual data
            newHtml = html.replace('%id%' , obj.id);
            newHtml = newHtml.replace('%description%' , obj.description);
            newHtml = newHtml.replace('%value%' , formatNumber(obj.value,type));

            //insert HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend' , newHtml);  // inserted as a last child of the element. 
        },

        // End-Result : it removes a HTML element. so the UI will be updated.
        deleteListItem: function(selectorID) {
            var el = document.getElementById(selectorID);  
            el.parentNode.removeChild(el);      // because the element cant delete itself !
        },

        // => End-Result changes styles of inputType , inputDescription and inputValue.
        changedType: function() {
            // this is how you select multiple nodes at once.
            var fields = document.querySelectorAll( 
               DOMStrings.inputType + ',' +
               DOMStrings.inputDescription + ',' +
               DOMStrings.inputValue);

            // we excecute the inner function on each element of the Nodelist. 
            // => End-Result the border of the selected nodes turns red on focus.
            nodeListForEach(fields, function(cur) {
                cur.classList.toggle('red-focus');
            });

            //we turn the inputBtn red.
            document.querySelector(DOMStrings.inputBtn).classList.toggle('red');
        }

    }

})();


// ######################################################################################################################
//  GLOBAL APP CONTROLLER ###############################################################################################
var controller = (function(budgetCtrl , UICtrl) {
    
    //All Event listeners grouped together. and they will be called by init() upon running the script.
    var setupEventListeners = function() {
        var DOM = UICtrl.getDOMStrings();

        // The change event is fired for <input>, <select>, and <textarea> elements when an alteration to the element's 
        // value is committed by the user.
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType)

        document.querySelector(DOM.inputBtn).addEventListener('click' , ctrlAddItem);

        // if the pressed key is 'enter' , then ctrlAddItem() will be called.
        document.addEventListener('keypress', function(event){ if(event.keyCode == 13) { ctrlAddItem(); }});

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
        
    };

    // a helping function. it calls all the necessary functions that are responsible for udpdating the budget. 
    var updateBudget = function() {
        // calculate the budget and dislay it on the UI
        budgetCtrl.calculateBudget();
        var budget = budgetCtrl.getBudget();
        UICtrl.displayBudget(budget);
    };

    // a helping function. it calls all the necessary functions that are responsible for udpdating the percentages. 
    var updatePercentages = function() {
        //calculate %
        budgetCtrl.calculatePercentages();
        //read % from budget controller
        var percentages = budgetCtrl.getPercentages(); //returns a freshly created array with all the .percentages of all the exp
        //update the UI with the new %
        UICtrl.displayPercentages(percentages);
    }

    // this method is called only upon the click event.
    var ctrlAddItem = function() {  
        var input, newItem;
        input = UICtrl.getInput();   // extract the input added by the user

        // we go through with the function only if the followin conditions are met.
        // End-Result : 
        if(input.description !== '' && !isNaN(input.value) && input.value > 0) {
        
            newItem = budgetCtrl.addItem(input.type, input.description, input.value); // we add the item to the controller.
            UICtrl.addListItem(newItem, input.type); // we add the item to the UI
            UICtrl.clearFields();
            updateBudget(); 
            updatePercentages();
        }

    };

    // this method , it checkes first if the delete button really clicked or not. if yes , it extract the id of the target item , and pass it to the Budget Controller and UI Modules.
    var ctrlDeleteItem = function(event) {
        var itemID , splitID, type, ID;
        itemID =  event.target.parentNode.parentNode.parentNode.parentNode.id;

        if(itemID) {  // is the id defined ?
            splitID = itemID.split('-'); // it returns an array of strings.
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













