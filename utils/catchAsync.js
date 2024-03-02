// module.exports = func => {
//     return (req, res, next) => {
//         console.log("catchAsync!!!!");
//         console.log("func: ", func);
//         func(req, res, next).catch(next);
//     }
// }

const ExpressError = require('./ExpressError');

function catchAsync(asyncController) {
    return async (req, res, next) => {
        try {
            await asyncController(req, res)
        } catch(error) {
            next(new ExpressError("Server Error###", 500))
        }
    }
}
module.exports = catchAsync;