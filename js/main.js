import { API_KEY, AUTH_DOMAIN, PROJECT_ID, STORAGE_BUCKET, MESSAGING_SENDER_ID, APP_ID } from './config.js.js';

// Selectors  
const todoInput =  document.querySelector('.todo-input');   
var todoButton = document.querySelector('#todoButton');
const todoList =  document.querySelector('.todo-list');
const clearButton =  document.querySelector('.card-clear-button');
var dataItem;

// Event Listeners
todoButton.addEventListener('click', addItem);
todoList.addEventListener("click", modifyItem);
clearButton.addEventListener("click", clearItems);

// Firebase Configration
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

const firebaseConfig = {    
    // apiKey: "AIzaSyDp8RAn85iBNQGgPqtHU-wdPaO3B8tMN18",
    // authDomain: "todo-list-37e97.firebaseapp.com",
    // projectId: "todo-list-37e97",
    // storageBucket: "todo-list-37e97.appspot.com",
    // messagingSenderId: "846133602294",
    // appId: "1:846133602294:web:ff0a5052b58c23986b09d7"
    apiKey: API_KEY,
    authDomain: AUTH_DOMAIN,
    projectId: PROJECT_ID,
    storageBucket: STORAGE_BUCKET,
    messagingSenderId: MESSAGING_SENDER_ID,
    appId: APP_ID
};


// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const cloud = firebase.firestore();
// const perf = firebase.performance();

onload = () => {
    cloud.collection("Todolist").get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {

            console.log("Current Document", doc.id, " => ", doc.data());
            createTodo(doc.data()["item"], doc.data()["completed"]);
        });
    });
}

// -----------------Firebase Functions-----------------
// Add Document to Cloud Firestore with Auto-Generated ID
function addDocument_AutoID(value) {

    cloud.collection("Todolist")
        .add( { 
            item: value.toString(),
            completed: Boolean(false)
        })
            .then(function(doc){ 
            console.log("--------------Document ID:", doc.id, "--------------")
                console.log("Item:", value,"successfully added.");
            })
            .catch(function(error){
                console.log("Error occured while adding document.",error);
            });
}

// Update Document in Cloud Firestore
function updateDocument(itemValue, isCompleted){
      cloud.collection("Todolist").get().then((querySnapshot) => {

        querySnapshot.forEach((doc) => {

            console.log("Current Document", doc.id, " => ", doc.data());
            if(doc.data()['item'] == itemValue){

                console.log("Document Found", doc.id, " => ", doc.data());

                cloud.collection("Todolist").
                doc(doc.id).update({
                    item: itemValue,
                    completed: isCompleted,
                }
                )
                    .then(() => {
                        console.log("--------------Document ID:", doc.id, "--------------")
                        console.log("Item: ", itemValue,
                                    "is Completed: ", isCompleted,
                                    " Successfully updated!");
                    }).catch((error) => {
                        console.error("Error removing item: ", error);
                    });
            }
        });
    });
}

// Delete Document from Cloud Firestore
function deleteDocument(itemValue){
    cloud.collection("Todolist").get().then((querySnapshot) => {

        querySnapshot.forEach((doc) => {

            console.log("Current Document", doc.id, " => ", doc.data());
            if(doc.data()['item'] == itemValue){

                console.log("Document Found", doc.id, " => ", doc.data());
                cloud.collection("Todolist").
                doc(doc.id).delete()
                    .then(() => {
                        console.log("--------------Document ID:", doc.id, "--------------")
                        console.log("Item: ", itemValue," successfully deleted!");
                    }).catch((error) => {
                        console.error("Error removing item: ", error);
                    });
            }
        });
    });
}

// Delete all Documents from Cloud Firestore
function clearDocuments(){
    cloud.collection("Todolist").get().then((querySnapshot) => {

        querySnapshot.forEach((doc) => {

            console.log("Current Document", doc.id, " => ", doc.data());
            cloud.collection("Todolist").
            doc(doc.id).delete()
                .then(() => {
                    console.log("--------------Document ID:", doc.id, "--------------")
                    console.log("Item: ", doc.data()["item"]," successfully deleted!");
                }).catch((error) => {
                    console.error("Error removing item: ", error);
                });
           
        });
    });
}

// -----------------Add HTML elements Function-----------------

// Utility function to Create Todo Html Elements
function createTodo(itemValue, isCompleted){
    // Create Div Todo
    const newTodoDiv = document.createElement('div');
    newTodoDiv.classList.add('todo');
    
    // 1 Create List Item
    const newTodoItem = document.createElement('li');
    newTodoItem.innerText = itemValue;
    newTodoDiv.appendChild(newTodoItem);

    // 2 Complete Button
    const completedButton = document.createElement('button');
    completedButton.classList.add('complete-btn');
    if(isCompleted){
        completedButton.classList.toggle("toggled");
        newTodoDiv.children[0].classList.toggle("completed");    
    	completedButton.classList.add('btn-outline-success');
    }
    
    completedButton.innerHTML = '<i class="material-icons">task_alt</i>';
    newTodoDiv.appendChild(completedButton);

    // 3 Delete Button
    const deleteButton = document.createElement('button');
    deleteButton.classList.add('trash-btn');
    deleteButton.classList.add('btn-outline-danger');
    deleteButton.innerHTML = '<i class="material-icons">highlight_off</i>';
    newTodoDiv.appendChild(deleteButton);

    // Adding 1,2,3 to todoList
    todoList.append(newTodoDiv);
    console.log("\nAdded", newTodoDiv);
}

// Add Item
function addItem(e){
    e.preventDefault();
    if(todoInput.value == "" || todoInput.value == " ")
        console.log("Input field is empty");        
    else 
    {
        dataItem = todoInput.value;
        console.log("Adding", dataItem);
        createTodo(dataItem, false);
        todoInput.value = "";

        addDocument_AutoID(dataItem);     
    }
};

// Modify Todo Html Elements
function modifyItem(e){
    e.preventDefault();
    var clicked = e.target;

    if(clicked.classList[0] === 'complete-btn'){
        const todo = clicked.parentNode;
        
        todo.children[0].classList.toggle("completed");
        console.log(todo.children[0]);
        console.log(todo.children[0].innerText);
        todo.children[1].classList.toggle("toggled");
        console.log(todo.children[1]);

        var isCompleted = false;
        if( todo.children[1].classList.contains("toggled") )
            isCompleted = true;
        else
            isCompleted = false;
        updateDocument(todo.children[0].innerText, isCompleted);
    }
    if(clicked.classList[0] === 'trash-btn'){
        const todo = clicked.parentElement;
        todo.classList.toggle("slide");

        deleteDocument(todo.children[0].innerText);

        todo.addEventListener("transitionend", function(){
        todo.remove();
        })
        console.log("\nRemoved", todo);
    }    
}

// Clear all Items
function clearItems(e){
    e.preventDefault();
    var todo = document.querySelector('.todo');
    while(todo){
        console.log("Removed", todo);
        todo.remove();
        todo = document.querySelector('.todo');
    }    
    if(!todo)
        console.log("\nCleared all items");
    clearDocuments();
}
