const path = require('path');

const createViewApi = app => {
    
    app.get('/', async (request, response) => {
        if (request.session.userId === 1) {
            return response.sendFile(path.join(__dirname, 'superAdminSite.html'));  
        }
        else if(request.session.userId === 7){
            return response.sendFile(path.join(__dirname, 'managerData.html'));
        }
        else if (request.session.userId) {
            return response.sendFile(path.join(__dirname, 'site.html'));
        }
        else {
            return response.sendFile(path.join(__dirname, '../index.html'));
        }
    });

    app.get('/storeData', async (request, response) => {
        if (request.session.userId == null) {
            return response.sendFile(path.join(__dirname, '../index.html'));
        } else {
            return response.sendFile(path.join(__dirname, 'storeData.html'));
        }
    });

    app.get('/register', async (request, response) => {
        if (request.session.userId == null) {
            return response.sendFile(path.join(__dirname, '../index.html'));
        } else {
            return response.sendFile(path.join(__dirname, 'register.html'));
        }
    });

};

module.exports = {
    createViewApi
};