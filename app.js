// Data controller module
// Módulos IIFE acessíveis por outras funções apenas quando objetos retornam e atribuem seu valor à variável
var budgetController = (function() {
    
    // Objeto para armazenar o valor das despesas
    var Expense = function(id, description, value) {
       this.id = id;
       this.description = description;
       this.value = value;
       this.percentage = -1;
   };

   // Calcula a porcentagem de gasto
    Expense.prototype.calcPercentage = function(totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    };

    Expense.prototype.getPercentage = function() {
        return this.percentage;
    }
    
    // Objeto para armazenar o valor da receita
    var Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };
    
    // Soma os valores de acordo com o tipo e os adiciona ao respectivo valor total
    var calculateTotal = function(type) {
        var sum = 0;
        data.allItems[type].forEach(function(cur) {
            sum += cur.value;
        });
        data.totals[type] = sum;
    };
    
    // Objeto com arrays para armazenar os valores parciais e objeto para armazenar os valores totais
    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0,
        },
        budget: 0,
        percentage: -1
    };
    
    
    return {
        // Função que define se valor é despesa 'exp' ou receita 'inc' e armazena dados no respectivo array
        addItem: function(type, des, val) {
            var newItem, ID;
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }
            // If else checa o tipo
            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
                data.allItems[type].push(newItem);
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val);
                data.allItems[type].push(newItem);
            }
            // Retornar o objeto obtido
            return newItem;
        },
        
        deleteItem: function(type, id) {
            var ids, index;
            ids = data.allItems[type].map(function(current) {
                return current.id;
            });
            
            index = ids.indexOf(id);
            
            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        },
        
        calculateBudget: function() {
            // Calcular receitas e despesas totais
            calculateTotal('exp');
            calculateTotal('inc');
            
            //Calcular quantia disponível: receita - despesas
            data.budget = data.totals.inc - data.totals.exp;
            
            // Calcular porcentagem gasta do valor total de receita
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }
        },

        calculatePercentages: function() {
            data.allItems.exp.forEach(function(current) {
                current.calcPercentage(data.totals.inc);
            });
        },

        getPercentages: function() {
            var allPerc = data.allItems.exp.map(function(current) {
                return current.getPercentage();
            });
            return allPerc;
        },
        
        // Objeto que RETORNA os valores totais de despesa e receita, o valor do budget disponível e a porcentagem
        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        },
        
        // TESTE
        /*testing: function() {
            console.log(data);
        },*/
       
    };
    
    
})();

// UI controller module
var UIController = (function() {
    
    // Objeto para referência de strings no html
    var DOMStrings = {
            inputType: '.add__type',
            inputDescription: '.add__description',
            inputValue: '.add__value',
            inputButton: '.add__btn',
            incomeContainer: '.income__list',
            expensesContainer: '.expenses__list',
            incomeLabel: '.budget__income--value',
            expensesLabel: '.budget__expenses--value',
            percentageLabel: '.budget__expenses--percentage',
            budgetLabel: '.budget__value',
            container: '.container',
            expensesPercLabel: '.item__percentage',
            dateLabel: '.budget__title--month'
        };

        var nodeListForEach = function(list, callback) {
            for (var i = 0; i < list.length; i++) {
                callback(list[i], i);
            }
        };

        var formatNumber =  function(num, type) {
            var numSplit, int, dec;
            num = Math.abs(num);
            num = num.toFixed(2);

            numSplit = num.split('.');
            int = numSplit[0];
            if (int.length > 3) {
                int = int.substr(0, int.length - 3) + '.' + int.substr(int.length - 3, 3);
            }
            dec = numSplit[1];

            return (type === 'exp' ? '-' : '+') + ' ' + int + ',' + dec;
        };

    return {
        // Função que retorna os 3 valores de input (tipo, descrição e valor)
        getInput: function() {
            return {
                type: document.querySelector(DOMStrings.inputType).value, // inc ou exp
                description: document.querySelector(DOMStrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
            }
        },
        
        addListItem: function(obj, type) {
            var html, newHTML, element;
            
            // Criar string HTML placeholder
            if (type === 'inc') {
                element = DOMStrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === 'exp') {
                element = DOMStrings.expensesContainer;
                html =  '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            
            // Substituir texto placeholder por dados obtidos no objeto
            newHTML = html.replace('%id%', obj.id);
            newHTML = newHTML.replace('%description%', obj.description);
            newHTML = newHTML.replace('%value%', formatNumber(obj.value, type));
            
            // Adicionar HTML ao DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHTML);
        },
        
        deleteListItem: function(selectedID) {
           var element = document.getElementById(selectedID);
            
            element.parentNode.removeChild(element);
        },
        
        // Função para limpar os campos de input
        clearFields: function() {
            var fields, fieldsArr;
            
            // Seleciona todos os campos do documento HTML
            fields = document.querySelectorAll(DOMStrings.inputDescription + ', ' + DOMStrings.inputValue);
            
            // Transforma a lista Node em array
            fieldsArr = Array.prototype.slice.call(fields);
            
            // Faz loop no array com a função forEach (array atual, array.length - 1, valores do array antigo) 
            fieldsArr.forEach(function (current, index, array) {
                current.value = "";
            })
            fieldsArr[0].focus();
        },
        
        labels: function(obj) {
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';
            
            document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMStrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');
            document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            
            if (obj.percentage > 0) {
                document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMStrings.percentageLabel).textContent = '---';
            }
        },
        
        displayPercentages: function(percentage) {
            var fields = document.querySelectorAll(DOMStrings.expensesPercLabel);
 
            nodeListForEach(fields, function(current, index) {
                if (percentage[index] > 0) {
                    current.textContent = percentage[index] + '%';
                } else {
                    current.textContent = '---';
                }
            });
        },

        displayDate: function() {
            var now, year, month, months;

            now = new Date();
            year = now.getFullYear();
            months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
            month = now.getMonth();

            document.querySelector(DOMStrings.dateLabel).textContent = months[month] + ' de ' + year;
        },

        changeFocus: function() {
            var fields;
            fields = document.querySelectorAll(DOMStrings.inputDescription + ',' + DOMStrings.inputType + ',' + DOMStrings.inputValue);

            nodeListForEach(fields, function(current) {
                current.classList.toggle('red-focus');
            });

            document.querySelector(DOMStrings.inputButton).classList.toggle('red');
        },

        // Tornar as strings no objeto privado públicas com return
        publicDOM: function() {
            return DOMStrings;
        },
       
    };
})();

// Controller module
// Usar nomes genéricos nos argumentos para facilitar a reutilização do código
var controller = (function(budgetCtrl, UICtrl) {
    
    var setUpEventListeners = function() {
        
        // Acessar a referência das strings do outro módulo
        var getDOM = UICtrl.publicDOM();

        // Clique no botão aciona a função 'addDataCtrl'
        document.querySelector(getDOM.inputButton).addEventListener('click', addDataCtrl);

        // Pressionar ENTER (keyCode = 13) também aciona a função 'addDataCtrl'
        document.addEventListener('keypress', function(event) {
            if (event.keyCode === 13 || event.which === 13) {
                addDataCtrl();
            }
        });
        
        document.querySelector(getDOM.container).addEventListener('click', deleteDataCtrl);

        document.querySelector(getDOM.inputType).addEventListener('change', UICtrl.changeFocus);
    }
    
    var budgetCalc = function() {
         // 1. Calcular valores totais
        budgetCtrl.calculateBudget();
            
        // 2. Obter os valores e deixá-los disponíveis para uso
        var budget = budgetCtrl.getBudget();
        console.log(budget);
        
        // 2. Atualizar os valores de despesa, receita, porcentagem e budget na UI
        var showLabels = UICtrl.labels(budget);
    };

    var updatePercentages = function() {

        // 1. Calcular porcentagem
        budgetCtrl.calculatePercentages();

        // 2. Acessar a porcentagem do budget ctrl
        var percentages = budgetCtrl.getPercentages();

        // 3. Atualizar a UI com os valores da porcentagem
        UICtrl.displayPercentages(percentages);
    };
    
    var addDataCtrl = function() {
    
        // 1. Pegar dados do input
        var input = UICtrl.getInput();
        
            if (input.description !== "" && input.value > 0 && !isNaN(input.value)) {

            // 2. Adicionar o item ao data controller module
            var addData = budgetCtrl.addItem(input.type, input.description, input.value);

            // 3. Adicionar o item à UI
            var addHtmlList = UICtrl.addListItem(addData, input.type);

            // 4. Limpar campos de input
            var clearUIFields = UICtrl.clearFields();
        }
            // Chamada da função usada para os cálculos
            budgetCalc();
    };

    
    var deleteDataCtrl = function(event) {
        var itemID, splitID, type, ID;
        
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
            
        if (itemID) {
            splitID = itemID.split('-');
        
            type = splitID[0];
            ID = parseInt(splitID[1]);

            // Excluir o item da base de dados
            budgetCtrl.deleteItem(type, ID);
 
            // Deletar o item da UI
            UICtrl.deleteListItem(itemID);

            // Calcular um novo valor de budget (- os valores excluídos)
            budgetCalc();
        }
    };
    
    return {
        // Função 'init' para inicialização 
        init: function() {
            setUpEventListeners();
            UICtrl.displayDate();
            UICtrl.labels({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
        }
    }
    
})(budgetController, UIController); // Argumentos para tornar os outros módulos acessíveis ao controller e fazer a conexão entre eles

// Chamada da função 'init' sem a qual a app não funciona pois a função 'setUpEventListeners' não é chamada
controller.init();