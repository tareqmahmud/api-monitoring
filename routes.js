const aboutController = require('./controllers/aboutController');
const {userController} = require('./controllers/userController');
const {tokenController} = require('./controllers/tokenController');


const routes = {
    about: aboutController,
    user: userController,
    token: tokenController,
};

module.exports = routes;