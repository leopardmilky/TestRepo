module.exports = func => {
    return (req, res, next) => {
        console.log("catchAsync!!!!");
        console.log("func: ", func);
        func(req, res, next).catch(next);
    }
}