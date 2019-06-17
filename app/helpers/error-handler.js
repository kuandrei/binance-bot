module.exports = function (err, ctx) {
    // @todo - save the error
    console.log('-----------------------------');
    console.dir({
        err,
        ctx: JSON.parse(JSON.stringify(ctx || {}))
    }, {colors: true, depth: 5});
    console.log('-----------------------------');
};