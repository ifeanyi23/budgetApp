
//Budget Controller

var budgetController = (function()
{

//some code
var Expenses = function (id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1
}

Expenses.prototype.calcPercentage = function(totalIncome) {
    if(totalIncome > 0) {
        this.percentage = Math.round((this.value / totalIncome) * 100);
    }
    else {
        this.percentage = -1;
    }
};

Expenses.prototype.getPercentage = function() {
    return this.percentage;
}

var Incomes = function (id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
}

var calulateTotal = function(type) {
    var sum = 0;
    data.allItems[type].forEach(function(curValue){
        sum += curValue.value;
    });
    data.totals[type] = sum;
}

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
    
return {
     addItems: function (type, des, val) {
        var newItem, ID;
        //create new id
        if(data.allItems[type].length > 0) {
            ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
        }else {
            ID = 0;
        }
        
        //create new item based on inc or exp
        if(type === 'exp'){
            newItem = new Expenses(ID, des, val);
        }else if(type === 'inc') {
            newItem = new Incomes(ID, des, val);
        }
        //push item into the data structure
        data.allItems[type].push(newItem);

        //return new element
        return newItem;
    },

    deleteItems: function (type, id) {
        var ids, index;
        ids = data.allItems[type].map(function(current) {
            return current.id;
        })
        index = ids.indexOf(id);
        if(index !== -1) {
            data.allItems[type].splice(index, 1);
        }
    },


    calulateBudget: function () {
        //calculate total income and expenses
        calulateTotal('exp');
        calulateTotal('inc');
        //calulate the budget: income - expenses

        data.budget = data.totals.inc - data.totals.exp

        //calculate the percentage of the income that we spent
        if(data.totals.inc > 0) {
            data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
        }else {
            data.percentage = -1;
        }
        

    },
    calulatePercentages: function() {
        data.allItems.exp.forEach(function(curr){
            curr.calcPercentage(data.totals.inc)
        })
    },

    getPercentages: function() {
        var allPerc = data.allItems.exp.map(function(curr){
            return curr.getPercentage();
        });

        return allPerc;
    },

    getBudget : function () {
        return {
            budget: data.budget,
            totalInc: data.totals.inc,
            totalExp: data.totals.exp,
            percentage: data.percentage
        }
    },


    testing: function(){
        console.log(data);
    }

}

}

)()




// UI controller
var UIController = (function() {
    //Add some code later
    var DomStrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn:   '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expenseLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercentagesLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    }

    
    var formatNumber = function(num, type) {
        var numSplit, int, dec, type;
        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');

        int = numSplit[0];
        if(int.length > 3){
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
        }
        dec = numSplit[1];

        return (type === 'exp'? '-' : '+') + ' ' + int + '.' + dec;

    }
    var nodesListForEach = function(list, fn){
        for(var i = 0; i < list.length; i++){
            fn(list[i], i);
        }
    }
    /*var formatString = function(des) {
        var str = document.querySelector(des);
        str.style.fontFamily = 'Lato';
    }*/
    return {
        getInput: function () {

            return {
                type: document.querySelector(DomStrings.inputType).value, // either inc or exp
                description: document.querySelector(DomStrings.inputDescription).value,
                value: parseFloat(document.querySelector(DomStrings.inputValue).value)
            }
            
        },

        addListItems: function (obj, type) {
            var html, newHtml, element;

            
            //create html strings with placeholder text
            if(type === 'inc'){
                element = DomStrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            else if(type === 'exp') {
                element = DomStrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            // replace placeholder text with some actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));


            //insert html to the dom
            document.querySelector(element).insertAdjacentHTML("beforeend", newHtml);

            
            
        },

        deleteListItems: function(seclectId) {
            var el = document.getElementById(seclectId);
            el.parentNode.removeChild(el);
        },

        clearFields: function () {
            var field, fieldArray;
            field = document.querySelectorAll(DomStrings.inputDescription + ', ' + DomStrings.inputValue);
            fieldArray = Array.prototype.slice.call(field);
            fieldArray.forEach(function (currentValue, index, arr) {
                currentValue.value = '';
            
            });
            fieldArray[0].focus();

        },

        displayBudget: function(obj) {
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';
            document.querySelector(DomStrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DomStrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DomStrings.expenseLabel).textContent = formatNumber(obj.totalExp, 'exp');
            if(obj.percentage > 0) {
                document.querySelector(DomStrings.percentageLabel).textContent = obj.percentage + '%';
            }else {
                document.querySelector(DomStrings.percentageLabel).textContent = '---'
            }
            
        },


        displayPercentages: function(percentages) {
            var Fields;
            Fields = document.querySelectorAll(DomStrings.expensesPercentagesLabel);
            console.log(Fields);
           

            nodesListForEach(Fields, function(current, index) {
                if(percentages[index] > 0){
                    current.textContent = percentages[index] + '%';
                }else{
                    current.textContent = '---';
                }
                
            });

        },

        changedType: function() {
            var fields;
            fields = document.querySelectorAll(
                DomStrings.inputType + ',' + DomStrings.inputDescription + ',' + DomStrings.inputValue
                
                );
                nodesListForEach(fields, function(curr) {
                    curr.classList.toggle('red-focus');
                })

                document.querySelector(DomStrings.inputBtn).classList.toggle('red');
        },


        displayMonth: function () {
            var now, year, month, months, day;
            now = new Date();
            day = now.getDay();
            month = now.getMonth();
            year = now.getFullYear();
            months = ['January', 'Febuary', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            document.querySelector(DomStrings.dateLabel).textContent = months[month] + ' ' + day + ' ' +year;
        },




        getStrings: function() {
            return DomStrings;
        }
    }
})();

// Global app controller
var controller = (function(budgetCtrl, UICtrl) {
    
    var setEventListeners = function() {
        var dom = UICtrl.getStrings();
        document.querySelector(dom.inputBtn).addEventListener('click', ctrlAddItems);

        document.addEventListener('keypress', function(event) {
            if(event.keycode === 13 || event.which === 13) {
                ctrlAddItems();
            }
        });

        document.querySelector(dom.container).addEventListener('click', ctrlDeleteItems);
        document.querySelector(dom.inputType).addEventListener('change', UICtrl.changedType);
    } 

    var updateBudget = function () {
        // 1. Calculate the budget
        budgetCtrl.calulateBudget();
        // 2. return the budget
        var budget = budgetCtrl.getBudget();
       // 2. Display the budget on the UI
        console.log(budget)
       UICtrl.displayBudget(budget);
    }

    var updatePercentages = function() {
        // 1. calculate the percentage
        budgetCtrl.calulatePercentages();
        // 2. read percentges from the budget controller
        var percentages = budgetCtrl.getPercentages();
        // 3. Update the percentages on the UI
        UICtrl.displayPercentages(percentages);
    }


    var ctrlAddItems = function() {
        var input, newItem;
        // 1. Get field input data
        input = UICtrl.getInput();
        console.log(input);
    // 2. Add the item to the budget controller
    if(input.description !== "" && typeof(input.value) === 'number' && input.value > 0) {
        //console.log(typeof(input.value));

        newItem = budgetCtrl.addItems(input.type, input.description, input.value);

       
    // 3. Add the item to the UI
       UICtrl.addListItems(newItem, input.type);
    // 4. Clear the fields
      UICtrl.clearFields();
    // calulate and update budget
         updateBudget();

    // caluclate and update percentage

         updatePercentages();
    }
        
      
    };

    var ctrlDeleteItems = function(event) {
        var itemID, splitID, type, id;
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        console.log(itemID)
        if(itemID) {
            splitID =  itemID.split('-');
            type = splitID[0];
            id = parseInt(splitID[1]); 

            // 1. delete the item from the data structure
            budgetCtrl.deleteItems(type, id);

            // 2. delete the item from the UI
            UICtrl.deleteListItems(itemID);

            // 3. Update and show the new budget

            updateBudget();

            // caluclate and update percentage

            updatePercentages();
        }
    }
  

 return {
     init: function() {

         console.log('Application just started');
         UICtrl.displayBudget({
            budget: 0,
            totalInc: 0,
            totalExp: 0,
            percentage: 0
        });
         setEventListeners();
         UICtrl.displayMonth();
     }
 }





})(budgetController, UIController);

controller.init();


 