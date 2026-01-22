require('ts-node').register({
  transpileOnly: true, // makes it faster
});
const dotenv = require('dotenv');
dotenv.config({ path: './.env.local' }); // read env file before our app is mounted!

process.on('uncaughtException', (err) => {
  console.log(err.name, err.message);
  process.exit(1);
});
const mongoose = require('mongoose');
const app = require('./index');
const AppError = require('./utils/appError');

if (!process.env.DB_HOST || !process.env.DB_PASSWORD) {
  throw new AppError(
    'Missing environment variables for database connection',
    500,
  );
}
const DB = process.env.DB_HOST.replace(
  '<db_password>',
  process.env.DB_PASSWORD,
);

mongoose.connect(DB).then(() => {
  console.log(`Connected to our database`);
});
// .catch( (err)=>{
//     console.log(`An error occured:${err}`)
// })

const PORT = 5500;
const server = app.listen(PORT, () => {
  console.log(`listening on http://localhost:${PORT}... `);
});

process.on('unhandledRejection', (err) => {
  if (err instanceof Error) {
    console.log(err.name, err.message);
  }
  server.close(() => process.exit(1));

  // return
});
