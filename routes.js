const aboutController = require('./controllers/aboutController');
const {userController} = require('./controllers/userController');

const routes = {
    about: aboutController,
    user: userController
};

module.exports = routes;