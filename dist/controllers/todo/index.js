"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addOrderToAllTodos = exports.editTodoOrder = exports.clearCompletedTodos = exports.editTodo = exports.deleteTodo = exports.addTodo = exports.updateAllTodos = exports.getTodos = void 0;
const todo_1 = require("../../models/todo");
const getTodos = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { user } = req.params;
        const todoDocument = yield todo_1.Todo.findOne({ user });
        if (!todoDocument) {
            const newTodo = new todo_1.Todo({ user, todos: [] });
            const savedTodoDocument = yield newTodo.save();
            return res.json(savedTodoDocument.todos);
        }
        res.json(todoDocument === null || todoDocument === void 0 ? void 0 : todoDocument.todos);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.getTodos = getTodos;
const updateAllTodos = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { user } = req.params;
        const newTodos = req.body;
        let todoDocument = yield todo_1.Todo.findOne({ user });
        if (!todoDocument) {
            const newTodo = new todo_1.Todo({ user, todos: newTodos });
            const savedTodoDocument = yield newTodo.save();
            console.log('savedTodoDocument.todos: ', savedTodoDocument.todos);
            return res.json(savedTodoDocument.todos);
        }
        else {
            console.log('todoDocument.todos 1: ', todoDocument.todos);
            todoDocument.todos = todoDocument.todos.map((todo) => {
                const newTodo = newTodos.find((newTodo) => newTodo.key === todo.key);
                return newTodo ? newTodo : todo;
            });
            console.log('todoDocument.todos 2: ', todoDocument.todos);
            todoDocument = yield todo_1.Todo.findOneAndUpdate({ user }, { todos: todoDocument.todos }, { new: true, useFindAndModify: false });
            console.log('todoDocument: ', todoDocument);
            return res.json(todoDocument === null || todoDocument === void 0 ? void 0 : todoDocument.todos);
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.updateAllTodos = updateAllTodos;
const addTodo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { user } = req.params;
        const todoDocument = yield todo_1.Todo.findOne({ user });
        if (!todoDocument) {
            return res.status(404).json({ message: 'No todos found for this user' });
        }
        const { complete, name, key } = req.body;
        const maxOrder = todoDocument.todos.reduce((max, todo) => (todo.order > max ? todo.order : max), 0);
        if (complete === undefined || name === undefined || key === undefined) {
            return res
                .status(400)
                .json({ message: 'Task must include complete, name, and key fields' });
        }
        const newTodo = { complete, name, key, order: maxOrder + 1 };
        const updatedTodoDocument = yield todo_1.Todo.findOneAndUpdate({ user }, { $push: { todos: newTodo } }, { new: true, useFindAndModify: false });
        if (!updatedTodoDocument) {
            return res.status(404).json({ message: 'No todos found for this user' });
        }
        const addedTodo = updatedTodoDocument.todos.find((todo) => todo.key === key);
        res.json(addedTodo);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.addTodo = addTodo;
const deleteTodo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { user, key } = req.params;
        console.log('deleteTodo user: ', user);
        const updatedTodoDocument = yield todo_1.Todo.findOneAndUpdate({ user }, { $pull: { todos: { key: key } } }, { new: true, useFindAndModify: false });
        if (!updatedTodoDocument) {
            return res.status(404).json({ message: 'No todos found for this user' });
        }
        res.json(updatedTodoDocument);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.deleteTodo = deleteTodo;
const clearCompletedTodos = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('user: ', req.params.user);
        const { user } = req.params;
        //const userId = new mongoose.Types.ObjectId(user)
        const updatedTodoDocument = yield todo_1.Todo.findOneAndUpdate({ user }, { $pull: { todos: { complete: true } } }, { new: true, useFindAndModify: false });
        console.log('updatedTodoDocument: ', updatedTodoDocument);
        if (!updatedTodoDocument) {
            return res.status(404).json({ message: 'No todos found for this user' });
        }
        res.json(updatedTodoDocument);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.clearCompletedTodos = clearCompletedTodos;
const editTodo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { user, key } = req.params;
        const todoDocument = yield todo_1.Todo.findOneAndUpdate({ user, 'todos.key': key }, { $set: { 'todos.$.complete': req.body.complete, 'todos.$.name': req.body.name } }, { new: true });
        if (!todoDocument) {
            return res.status(404).json({ message: 'No todos found for this user' });
        }
        //return the updated todo
        const updatedTodo = todoDocument.todos.find((todo) => todo.key === key);
        res.json(updatedTodo);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.editTodo = editTodo;
const editTodoOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { user, key } = req.params;
        const todoDocument = yield todo_1.Todo.findOne({
            user,
            'todos.key': key,
        });
        if (!todoDocument) {
            return res.status(404).json({ message: 'No todos found for this user' });
        }
        const { order } = req.body;
        if (order === undefined) {
            return res.status(400).json({ message: 'Order field is required' });
        }
        const updatedTodoDocument = yield todo_1.Todo.findOneAndUpdate({ user, 'todos.key': key }, { $set: { 'todos.$.order': order } }, { new: true });
        if (!updatedTodoDocument) {
            return res.status(404).json({ message: 'No todos found for this user' });
        }
        res.json(updatedTodoDocument);
    }
    catch (error) {
        console.error(error);
        res
            .status(500)
            .json({ message: `Internal server error. ${error.message}` });
    }
});
exports.editTodoOrder = editTodoOrder;
//temporary:
const addOrderToAllTodos = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const todos = yield todo_1.Todo.find({});
        for (let todoDocument of todos) {
            let order = 0;
            for (let todo of todoDocument.todos) {
                todo.order = order++;
            }
            yield todoDocument.save();
        }
        res.json({ message: 'Order added to all todos' });
    }
    catch (error) {
        console.error(error);
    }
});
exports.addOrderToAllTodos = addOrderToAllTodos;
