function errResponseHelper(res, code, message, type, e) {
    if (e) console.log(":: INTERNAL SERVER ERROR :: \n", e);
    res.status(code).json({ error: { message: message, type: type } });
}
module.exports = errResponseHelper;
