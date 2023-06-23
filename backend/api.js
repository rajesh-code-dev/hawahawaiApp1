const mysql = require('mysql2');
const database = require('./database.js');
const { response } = require('express');

const createRestApi = app => {

    // customer details inserting to database
    app.post('/', async (request, response) => {
        const customer = {
            name: request.body.name,
            email: request.body.email,
            member: request.body.member,
            amount: request.body.amount,
            totalAmount: request.body.totalAmount,
            date: request.body.date,
            time: request.body.time,
            mode: request.body.mode,
        };

        const connection = await database.createConnection();

        try {
            const result = await connection.query(`
            INSERT INTO customers (name, email, member, amount, totalAmount, date, time, mode)
            VALUES (${mysql.escape(customer.name)}, ${mysql.escape(customer.email)}, ${mysql.escape(customer.member)}, ${mysql.escape(customer.amount)}, ${mysql.escape(customer.totalAmount)}, ${mysql.escape(customer.date)},  ${mysql.escape(customer.time)}, ${mysql.escape(customer.mode)})
          `);
            response.send('Customer details submitted successfully');
        } catch (e) {
            console.error(e);
            response.json({ result: 'ERROR', message: 'Failed to insert customer details.' });
        } finally {
            await connection.end();
        }

    });

    // showing customer data from database
    app.get('/getData', async (request, response) => {
        const connection = await database.createConnection();

        try {
            const result = await connection.query('SELECT * FROM customers ORDER BY id DESC');
            const formData = result.sort((a, b) => b - a);
           
            response.send(formData)
        } catch (error) {
            console.error('Failed to fetch form data:', error);
            response.status(500).json({ error: 'Failed to fetch form data' });
        } finally {
            await connection.end();
        }
    });


    //manager site data
    app.get('/customerData', async (request, response) => {
        const connection = await database.createConnection();

        try {
            const result = await connection.query('SELECT * FROM customers ORDER BY id DESC');
            const formData = result.sort((a, b) => b - a);
            const count = await connection.query('SELECT COUNT(*) FROM customers');
            const totalCustomers = count[0]['COUNT(*)'];

            response.json(formData)
        } catch (error) {
            console.error('Failed to fetch form data:', error);
            response.status(500).json({ error: 'Failed to fetch form data' });
        } finally {
            await connection.end();
        }
    });

    // super admin site to show data
    app.get('/superAdminData', async (request, response) => {
        const connection = await database.createConnection();

        try {
            const result = await connection.query('SELECT * FROM customers ORDER BY id DESC');
            const formData = result.sort((a, b) => b - a);
            const count = await connection.query('SELECT COUNT(*) FROM customers ORDER BY id DESC');
            const totalCustomers = count[0]['COUNT(*)'];

            response.json(formData)
        } catch (error) {
            console.error('Failed to fetch form data:', error);
            response.status(500).json({ error: 'Failed to fetch form data' });
        } finally {
            await connection.end();
        }
    });

    //checked customers
    app.get('/checkedData', async (request, response) => {
        const connection = await database.createConnection();

        try {
            const result = await connection.query('SELECT * FROM checkedCustomers ORDER BY id DESC');
            const formData = result.sort((a, b) => b - a)
            const count = await connection.query('SELECT COUNT(*) FROM checkedCustomers');
            const totalCustomers = count[0]['COUNT(*)'];

            response.json(formData)
        } catch (error) {
            console.error('Failed to fetch form data:', error);
            response.status(500).json({ error: 'Failed to fetch form data' });
        } finally {
            await connection.end();
        }
    });


    // Handle the form submission for updating customer data
    app.post('/editCustomer', async (request, response) => {
        const { id, name, email, member, amount, totalAmount, date } = request.body;

        const connection = await database.createConnection();

        try {
            const result = await connection.query(`
                UPDATE customers
                SET name = ${mysql.escape(name)},
                    email = ${mysql.escape(email)},
                    member = ${mysql.escape(member)},
                    amount = ${mysql.escape(amount)},
                    totalAmount = ${mysql.escape(totalAmount)},
                    date = ${mysql.escape(date)}
                WHERE name = ${mysql.escape(name)}
            `);

            if (result.affectedRows > 0) {
                response.send('Customer data updated successfully.');
            } else {
                // Handle case when customer is not found
                response.status(404).send('Customer not found');
            }
        } catch (error) {
            console.error('Failed to update customer data:', error);
            response.status(500).json({ error: 'Failed to update customer data' });
        } finally {
            await connection.end();
        }
    });

    // admin login
    app.post('/user/login', async (request, response) => {
        if (request.session.userId) {
            response.json({ result: 'ERROR', message: 'User already logged in.' });
        } else {
            const user = {
                username: request.body.username,
                password: request.body.password
            };
            const connection = await database.createConnection();
            try {
                const result = await connection.query(`
                    SELECT id 
                    FROM users 
                    WHERE 
                            username=${mysql.escape(user.username)}
                        AND password=${mysql.escape(user.password)}
                    LIMIT 1
                `);
                if (result.length > 0) {
                    const user = result[0];
                    request.session.userId = user.id;
                    response.json({ result: 'SUCCESS', userId: user.id });
                } else {
                    response.json({ result: 'ERROR', message: 'Indicated username or/and password are not correct.' });
                }
            } catch (e) {
                console.error(e);
                response.json({ result: 'ERROR', message: 'Request operation error.' });
            } finally {
                await connection.end();
            }
        }
    });

    // admin register
    app.post('/register', async (request, response) => {

        const user = {
            name: request.body.name,
            username: request.body.username,
            password: request.body.password
        };

        const connection = await database.createConnection();
        try {
            const result = await connection.query(`
            INSERT INTO users (name, username, password)
            VALUES (${mysql.escape(user.name)}, ${mysql.escape(user.username)}, ${mysql.escape(user.password)})
          `);
            response.json({ result: 'SUCCESS', message: 'Customer details inserted successfully.', alert: 'success' });
        } catch (e) {
            console.error(e);
            response.json({ result: 'ERROR', message: 'Failed to insert customer details.' });
        } finally {
            await connection.end();
        }

    });

    // admin superAdmin logout
    app.get('/user/logout', async (request, response) => {
        if (request.session.userId) {
            delete request.session.userId;
            response.json({ result: 'SUCCESS' });
        } else {
            response.json({ result: 'ERROR', message: 'User is not logged in.' });
        }
    });

    // super Admin password reset
    app.post('/forgotPassword', async (request, response) => {
        const { username, password } = request.body;

        const connection = await database.createConnection();

        try {
            const result = await connection.query(`
                UPDATE users
                SET username = ${mysql.escape(username)},
                    password = ${mysql.escape(password)}
                WHERE username = ${mysql.escape(username)}
            `);

            if (result.affectedRows > 0) {

                response.send('Password updated successfully.');
            } else {
                // Handle case when customer is not found
                response.status(404).send('Something went wrong');
            }
        } catch (error) {
            console.error('Failed to update password:', error);
            response.status(500).json({ error: 'Failed to update password' });
        } finally {
            await connection.end();
        }
    });


    // Delete customer data
    app.delete('/deleteData/:id', async (request, response) => {
        const customerId = request.params.id;

        const connection = await database.createConnection();
        try {
            const result = await connection.query(`
        DELETE FROM customers WHERE id = ${mysql.escape(customerId)}
      `);
            if (result.affectedRows > 0) {
                response.json({ result: 'SUCCESS', message: 'Customer data deleted successfully.' });
            } else {
                response.json({ result: 'ERROR', message: 'Customer data not found.' });
            }
        } catch (e) {
            console.error(e);
            response.json({ result: 'ERROR', message: 'Failed to delete customer data.' });
        } finally {
            await connection.end();
        }
    });


    // Delete Checked customer data
    app.delete('/deleteCheckedData/:id', async (request, response) => {
        const customerId = request.params.id;

        const connection = await database.createConnection();
        try {
            const result = await connection.query(`
        DELETE FROM checkedCustomers WHERE id = ${mysql.escape(customerId)}
      `);
            if (result.affectedRows > 0) {
                response.json({ result: 'SUCCESS', message: 'Customer data deleted successfully.' });
            } else {
                response.json({ result: 'ERROR', message: 'Customer data not found.' });
            }
        } catch (e) {
            console.error(e);
            response.json({ result: 'ERROR', message: 'Failed to delete customer data.' });
        } finally {
            await connection.end();
        }
    });


    // sending database to checked in database
    app.post('/submitData', async (req, response) => {
        // Access the submitted data from the request body
        const submittedData = req.body;
        console.log(submittedData)

        const connection = await database.createConnection();
        try {
            const result = await connection.query(`
            INSERT INTO checkedCustomers (name, email, member, amount, totalAmount, date, boardTime)
            VALUES (${mysql.escape(submittedData.name)}, ${mysql.escape(submittedData.email)}, ${mysql.escape(submittedData.member)}, ${mysql.escape(submittedData.amount)}, ${mysql.escape(submittedData.totalAmount)}, ${mysql.escape(submittedData.date)}, ${mysql.escape(submittedData.boardTime)})
          `);
            response.json({ result: 'SUCCESS', message: 'Customer details inserted successfully.', alert: 'success' });
        } catch (e) {
            console.error(e);
            response.json({ result: 'ERROR', message: 'Failed to insert customer details.' });
        } finally {
            await connection.end();
        }
    });

    // sending cancel data to canceled table
    app.post('/cancelData', async (req, response) => {
        // Access the submitted data from the request body
        const submittedData = req.body;
        console.log(submittedData)


        const connection = await database.createConnection();
        try {
            const result = await connection.query(`
            INSERT INTO cancelCustomers (name, email, member, amount, totalAmount, date)
            VALUES (${mysql.escape(submittedData.name)}, ${mysql.escape(submittedData.email)}, ${mysql.escape(submittedData.member)}, ${mysql.escape(submittedData.amount)}, ${mysql.escape(submittedData.totalAmount)}, ${mysql.escape(submittedData.date)})
          `);
            response.json({ result: 'SUCCESS', message: 'Customer details inserted successfully.', alert: 'success' });
        } catch (e) {
            console.error(e);
            response.json({ result: 'ERROR', message: 'Failed to insert customer details.' });
        } finally {
            await connection.end();
        }
    });

    // sending data to billed table
    app.post('/submitCheckedData', async (req, response) => {
        // Access the submitted data from the request body
        const submittedData = req.body;
        console.log(submittedData)


        const connection = await database.createConnection();
        try {
            const result = await connection.query(`
            INSERT INTO billedCustomers (name, email, member, amount, totalAmount, date)
            VALUES (${mysql.escape(submittedData.name)}, ${mysql.escape(submittedData.email)}, ${mysql.escape(submittedData.member)}, ${mysql.escape(submittedData.amount)}, ${mysql.escape(submittedData.totalAmount)}, ${mysql.escape(submittedData.date)})
          `);
            response.json({ result: 'SUCCESS', message: 'Customer details inserted successfully.', alert: 'success' });
        } catch (e) {
            console.error(e);
            response.json({ result: 'ERROR', message: 'Failed to insert customer details.' });
        } finally {
            await connection.end();
        }
    });

    app.get('/getCheckedData', async (request, response) => {
        const connection = await database.createConnection();

        try {
            const result = await connection.query('SELECT FROM checkedCustomers ORDER BY id DESC');
            const total = result.sort((a, b) => b - a)
            response.json(total)

        } catch (error) {
            console.error('Failed to fetch form data:', error);
            response.status(500).json({ error: 'Failed to fetch form data' });
        } finally {
            await connection.end();
        }
    })

    // sum waiting Pax
    app.get('/sumPax', async (request, response) => {
        const connection = await database.createConnection();

        try {
            const result = await connection.query('SELECT SUM(member) as member FROM customers');
            const total = result
            response.json(total)

        } catch (error) {
            console.error('Failed to fetch form data:', error);
            response.status(500).json({ error: 'Failed to fetch form data' });
        } finally {
            await connection.end();
        }
    });
    // checked data delete
    app.get('/sumCheckedPax', async (request, response) => {
        const connection = await database.createConnection();

        try {
            const result = await connection.query('SELECT SUM(member) as member FROM checkedCustomers');
            const total = result
            response.json(total)

        } catch (error) {
            console.error('Failed to fetch form data:', error);
            response.status(500).json({ error: 'Failed to fetch form data' });
        } finally {
            await connection.end();
        }
    });

    // total amount of current date
    app.get('/sumBilledAmount', async (request, response) => {
        const connection = await database.createConnection();

        try {
            // Get the current date in the format 'YYYY-MM-DD'
            const currentDate = new Date().toDateString()

            const result = await connection.query(
                `SELECT SUM(totalAmount) AS bill FROM billedCustomers WHERE date = '${currentDate}'`
            );

            const total = result[0].bill;
            response.json(total);
        } catch (error) {
            console.error('Failed to fetch form data:', error);
            response.status(500).json({ error: 'Failed to fetch form data' });
        } finally {
            await connection.end();
        }
    });

    // total amount of yesterday date
    app.get('/yesterdayAmount', async (request, response) => {
        const connection = await database.createConnection();

        try {
            // Get the current date in the format 'YYYY-MM-DD'
            const currentDate = new Date();
            const yesterday = new Date(currentDate);
            yesterday.setDate(yesterday.getDate() - 1);

            const yesterdayData = yesterday.toDateString()

            const result = await connection.query(
                `SELECT SUM(totalAmount) AS bill FROM billedCustomers WHERE date = '${yesterdayData}'`
            );

            const total = result[0].bill;
            response.json(total);
        } catch (error) {
            console.error('Failed to fetch form data:', error);
            response.status(500).json({ error: 'Failed to fetch form data' });
        } finally {
            await connection.end();
        }
    });

    // week total amount
    app.get('/weekAmount', async (request, response) => {
        const connection = await database.createConnection();

        try {

            const result = await connection.query(
                `SELECT SUM(totalAmount) AS bill FROM billedCustomers `
            );

            const total = result[0].bill;
            response.json(total);
        } catch (error) {
            console.error('Failed to fetch form data:', error);
            response.status(500).json({ error: 'Failed to fetch form data' });
        } finally {
            await connection.end();
        }
    });

    // billed data retrieving 
    app.get('/billedData', async (request, response) => {
        const connection = await database.createConnection();

        try {
            const result = await connection.query('SELECT * FROM billedCustomers ORDER BY id DESC');
            const sort = result.sort((a, b) => b - a);
            
            response.send(sort)
        }
        catch (error) {
            console.log('billed error', error)
        }
    })

    // get canceled data
    app.get('/canceledData', async (request, response) => {
        const connection = await database.createConnection();
        try {
           const result = await connection.query('SELECT * FROM cancelCustomers ORDER BY id DESC');
           const sort = result.sort((a,b) => b-a);

           response.send(sort)

        } catch (error) {
            console.log(error, 'error in cancel data')
        }
    })

};

module.exports = {
    createRestApi
};

