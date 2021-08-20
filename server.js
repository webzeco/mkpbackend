const app = require('./app');
const mongoose = require('mongoose');
// const morgan = require("morgan");

const port = process.env.PORT || 8080;

mongoose
    .connect(process.env.DBCONNECTION, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
    }).then(() => {
        console.log("database connection successful...!!!");
    }).catch(console.log);
app.listen(port, () => {
    console.log(`App listening at :${port}`)
});