"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
//import { body } from 'express-validator'
const quiz_1 = require("../controllers/quiz");
const todo_1 = require("../controllers/todo");
const users_1 = require("../controllers/users");
const jokes_1 = require("../controllers/jokes");
const router = (0, express_1.Router)();
router.post('/api/login', users_1.loginUser);
router.post('/api/users/forgot', users_1.forgotPassword);
router.get('/api/users/reset/:token', users_1.resetPassword);
router.post('/api/users/reset/:token', users_1.resetPasswordToken);
//router.get('/api/users', [authenticateUser, checkIfAdmin, getUsers])
router.get('/api/users', users_1.getUsers);
router.get('/api/users/:id', users_1.getUser);
//router.post('/api/users', addUser)
router.put('/api/users/:id', [users_1.comparePassword, users_1.updateUser]);
router.put('/api/users/', [users_1.comparePassword, users_1.updateUsername]);
router.get('/api/users/:username/confirm-email/:token', users_1.confirmEmail);
router.delete('/api/users/:id', [users_1.authenticateUser, users_1.deleteUser]);
router.post('/api/users/register', users_1.registerUser);
router.get('/api/users/verify/:token', users_1.verifyEmailToken);
router.get('/api/users/logout', users_1.logoutUser);
//router.get('/api/users/verify/:token', [verifyTokenMiddleware, verifyEmailToken])
router.post('/api/users/:id', users_1.generateToken);
router.get('/api/users/username/:username', users_1.findUserByUsername);
// router.post('/api/users/:id/delete', deleteAllJokesByUserId)
router.put('/api/users/:id/:jokeId/:language', users_1.addToBlacklistedJokes);
router.delete('/api/users/:id/:joke_id/:language', users_1.removeJokeFromBlacklisted);
// router.get('/api/users/:username/jokes', getJokesByUsername)
router.get('/api/users/:id/categories/:category/jokes', jokes_1.getJokesByUserAndCategory);
router.get('/api/users/:id/joketypes/:type/jokes', jokes_1.getJokesByUserAndType);
router.get('/api/users/:id/safe/:safe/jokes', jokes_1.getJokesByUserAndSafe);
// router.put('/api/users/:id/update-jokes', updateUserJokes)
//router.put('/api/users/request-new-token', refreshExpiredToken)
router.get('/api/jokes/:jokeId/:language/:category/:type', jokes_1.findJokeByJokeIdLanguageCategoryType);
router.post('/api/jokes', jokes_1.addJoke);
router.put('/api/jokes/:id', jokes_1.updateJoke);
router.get('/api/jokes/:id/verification', jokes_1.verifyJoke);
router.get('/api/jokes', jokes_1.getJokes);
router.get('/api/jokes/user/:id/', jokes_1.getJokesByUserId);
router.delete('/api/jokes/:id/delete-user/:userId', jokes_1.deleteUserFromJoke);
//router.get('/api/quiz', getQuizzes)
router.post('/api/quiz', quiz_1.addQuiz);
router.put('/api/quiz', quiz_1.addQuiz);
router.get('/api/quiz/:id', quiz_1.getUserQuiz);
router.delete('/api/quiz/remove/:user', quiz_1.removeOldestDuplicate);
router.get('/api/todo/:user', todo_1.getTodos);
router.put('/api/todo/:user', todo_1.updateAllTodos);
router.post('/api/todo/:user', todo_1.addTodo);
router.delete('/api/todo/:user/:key', todo_1.deleteTodo);
router.put('/api/todo/:user/:key', todo_1.editTodo);
router.delete('/api/todo/:user', todo_1.clearCompletedTodos);
router.put('/api/todo/:user/:key/order', todo_1.editTodoOrder);
router.put('/api/todo/add-order', todo_1.addOrderToAllTodos);
router.get('/', (req, res) => {
    res.send('Nothing to see here');
});
const { body, validationResult } = require('express-validator');
const { sendEmailForm, sendEmailSelect } = require('../controllers/email');
router.post('/api/send-email-form', [
    body('firstName').trim().escape(),
    body('lastName').trim().escape(),
    body('email').isEmail(),
    body('message').trim().escape(),
    body('encouragement').trim().escape(),
    body('color').trim().escape(),
    body('dark').trim().escape(),
    body('light').trim().escape(),
    body('select').trim().escape(),
    body('selectmulti').trim().escape(),
], (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: errors.array().join('\n'),
            errors: errors.array(),
        });
    }
    next();
}, sendEmailForm);
router.post('/api/send-email-select', [
    body('issues').trim().escape(),
    body('favoriteHero').trim().escape(),
    body('clarification').trim().escape(),
    body('email').isEmail(),
], (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: errors.array().join('\n'),
            errors: errors.array(),
        });
    }
    next();
}, sendEmailSelect);
exports.default = router;
