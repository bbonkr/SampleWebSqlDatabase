var html5webdb = {};
html5webdb.webdb = {};
html5webdb.webdb.db = null;
html5webdb.webdb.open = function(){
    if(window.openDatabase == window.undefined) { 
        throw {
            name: 'NotSupportWebDB',
            message:'This web browser is not support Web DB.'
        }; 
    }

    var dbSize = 5 * 1024 * 1024;   // 5MB
    html5webdb.webdb.db = openDatabase('Todo', '1', 'Todo manager', dbSize);
};

html5webdb.webdb.onError = function(tx, e) {
    console.log(e.message);
    alert('there has been an error: ' + e.message);
};

html5webdb.webdb.onSuccess = function(tx, e) {
    html5webdb.webdb.getAllTodoItems(loadTodoItems);
};

html5webdb.webdb.createTable = function(){
    var db = html5webdb.webdb.db;
    db.transaction(function(tx){
        tx.executeSql('CREATE TABLE IF NOT EXISTS todo (ID INTEGER PRIMARY KEY ASC, todo TEXT, added_on DATETIME )', []);
    });
};

html5webdb.webdb.addTodo = function(todoText) {
    var db = html5webdb.webdb.db;
    db.transaction(function(tx){
        var addedOn = new Date();
        tx.executeSql('INSERT INTO todo (todo, added_on) VALUES (?, ?)', 
            [todoText, addedOn], 
            html5webdb.webdb.onSuccess,
            html5webdb.webdb.onError);
    });
};

html5webdb.webdb.getAllTodoItems = function(renderFunc) {
    var db = html5webdb.webdb.db;
    db.transaction(function(tx){
        tx.executeSql('SELECT * FROM todo', [], renderFunc, html5webdb.webdb.onError);
    });
};

html5webdb.webdb.getAllTodoItemsCount = function() {
    var db = html5webdb.webdb.db;
    db.transaction(function(tx){
        tx.executeSql('SELECT count(*) as count FROM todo', [], function(tx, rs){
            var count = rs.rows[0]['count'];
            $('#badgeTodoCount').text(count);
        }, html5webdb.webdb.onError);
    });
};

html5webdb.webdb.deleteTodo = function(id){
    var db = html5webdb.webdb.db;
    db.transaction(function(tx){
        tx.executeSql('DELETE FROM todo where ID = ?', [id],
            html5webdb.webdb.onSuccess,
            html5webdb.webdb.onError);
    });
};

function loadTodoItems(tx, rs){
    var rowOutput = '';
    var todoItems = document.getElementById('todoItems');
    for( var i = 0; i < rs.rows.length; i++){
        rowOutput += renderTodo(rs.rows.item(i));
    }

    todoItems.innerHTML = rowOutput;

    $('#todoItems li .badge').css({'cursor':'pointer'}).click(function(){
        var id = $(this).parents(2).attr('data-todoid');

        html5webdb.webdb.deleteTodo(id);
    });

    html5webdb.webdb.getAllTodoItemsCount();
}

function renderTodo(row){
    var todoText = row.todo;
    todoText =todoText.replace(/(?:\r\n|\r|\n)/g, '<br />');
    return '<li class="list-group-item" data-todoid="'+row.ID+'">' + todoText + 
           '<span class="badge badge-danger">DEL</span></li>';
}

function init(){
    var message = '';
    try{
        html5webdb.webdb.open();
        html5webdb.webdb.createTable();
        html5webdb.webdb.getAllTodoItems(loadTodoItems);
    }
    catch(e){

        if(e.hasOwnProperty('message')){
            message = e.message;
            console.log(message);
        }
        else{
            message = e;
            console.log(message);
        }

        if(e.name === 'NotSupportWebDB'){
            // Not supported web browser.
            $('#messageLabel').text(message).attr({'title':'Reference page.'}).css({'cursor':'pointer'}).click(function(){

                open('http://caniuse.com/#search=web%20sql', 'caniuse');
                return false;
            });

            $('#btnAdd').prop('disabled', true);
            $('#todo').prop('disabled', true);
        }
    }
}

function addTodo(){
    var todo = document.getElementById('todo');
    html5webdb.webdb.addTodo(todo.value);
    todo.value = '';
}

function showAlertMessage(message){
    $('#alertMessage').show(100, function(){
        $(this).removeClass('hide').text(message);

        setTimeout(function(){
            $('#alertMessage').empty().hide(1000, function(){
            $(this).addClass('hide');
        });
    }, 5000);
    });
    
}

$(document).ready(function(){

    $('#btnAdd').click(function(){
        var todoText = $('#todo').val();
        if(todoText) {
           addTodo();
        }
        else{
            $('#todo').focus();
            showAlertMessage('Todo text is required!');
        }

    });

    init();
});