//This code maps over each filename and returns an array of imported routes. 
//As you can imagine, you still have to define these files and routes.

module.exports = [

    "./routes/todo_get",
    "./routes/todo_post",
    "./routes/todo_delete"

].map((elem) => require(elem));