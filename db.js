const { Client } = require('pg');

const client = new Client({
  user: 'siddhant',
  password: 'singh@123',
  host: 'localhost',
  port: '5432',
  database: 'siddhant',
});
client
  .connect()
  .then(() => {
    console.log('Connected to PostgreSQL database');
  })
  .catch((err) => {
    console.error('Error connecting to PostgreSQL database', err);
  });
// const createTable = `
//   CREATE TABLE users(
//     id serial PRIMARY KEY,
//     username varchar(255),
//     password text,
//     blog varchar(255),
//     token text);
// `;

const insertData = (insert, values) => {
  return client.query(insert, values, (err, result) => {
    if (err) {
      console.error('Error inserting data', err);
    } else {
      console.log('Data inserted successfully');
      return result;
    }
    client.end();
  });
};
// client.query(createTable, (err, result) => {
//   if (err) {
//     console.error('Error creating table', err);
//   } else {
//     console.log('Table created successfully');
//   }

//   client.end();
// });
module.exports = { client, insertData };
