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