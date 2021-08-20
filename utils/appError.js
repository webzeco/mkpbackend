// class AppError extends Error {
//     constructor(message, statusCode) {
//         super(message);

//         this.statusCode = statusCode;
//         this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'Error';
//         this.isOperational = true;
//         Error.captureStackTrace(this, this.constructor);
//     }
// }
// module.exports = AppError;


class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}
    // console.log(process.env.NODE_ENV);

module.exports = AppError;
// this comment is for heroku casing error