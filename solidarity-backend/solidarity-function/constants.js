exports.method_not_allowed = {
    statusCode: 405,
    body: JSON.stringify({message: 'Method Not Allowed'})
};

exports.not_found = {
    statusCode: 404,
    body: JSON.stringify({message: 'Not Found'})
};

exports.bad_request = {
    statusCode: 400,
    body: JSON.stringify({message: 'Bad Request'})
};

exports.unauthorized = {
    statusCode: 401,
    body: JSON.stringify({message: 'Unauthorized'})
};