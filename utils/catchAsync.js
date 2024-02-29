module.exports = func => {
    return (req, res, next) => {
        console.log("catchAsync!!!!");
        func(req, res, next).catch(next);
    }
}