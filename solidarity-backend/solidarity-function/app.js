const constants = require("./constants");
const request_handler = require('./request_handler');

let response;
exports.lambdaHandler = async (event, context) => {
    switch (event.resource) {
        case '/posts':
            switch(event.httpMethod) {
                case 'POST': {
                    response = await request_handler.handlePostRequest({event: event});
                    break;
                }
                case 'GET': {
                    response = await request_handler.handleGetRequest({event: event});
                    break;
                }
                default: response = constants.method_not_allowed;
            }
            break;
        default: response = constants.not_found;
    }
    return response
};