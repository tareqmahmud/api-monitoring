const aboutController = require('./controllers/aboutController');
const {userController} = require('./controllers/userController');
const {tokenController} = require('./controllers/tokenController');
const {checkController} = require('./controllers/checkController');

const routes = {
    about: aboutController,
    user: userController,
    token: tokenController,
    check: checkController
};

module.exports = routes;