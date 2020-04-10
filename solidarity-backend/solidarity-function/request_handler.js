const constants = require("./constants");
const dynamodb_handler = require('./dynamodb');
const config = require('./config');

exports.handlePostRequest = async ({event}) => {
    if(!isAuthorized({headers: event.headers})) {
        return constants.unauthorized;
    }
    const post = JSON.parse(event.body);
    const result  = await dynamodb_handler.putSolidarityItem({properties: post});
    const body = transform_item({
        item: result,
        userLat: result.coordinates.latitude,
        userLon: result.coordinates.longitude
    });
    return {
        statusCode: 201,
        body: JSON.stringify(body)
    };
};

exports.handleGetRequest = async ({event}) => {
    if(!isAuthorized({headers: event.headers})) {
        return constants.unauthorized;
    }
    const userLatitude = parseFloat(event.queryStringParameters.latitude);
    const userLongitude = parseFloat(event.queryStringParameters.longitude);
    const radius_in_meters = parseInt(event.queryStringParameters.radiusInMeters);
    if(radius_in_meters > 5000) {
        return constants.bad_request;
    }
    const items = await dynamodb_handler.getSolidarityItems({
        latitude: userLatitude,
        longitude: userLongitude,
        radius_in_meters: radius_in_meters});

    const body = items
        .map((item) => transform_item({
            item: item,
            userLat: userLatitude,
            userLon: userLongitude}))
        .sort((a, b) => b.postTimestamp - a.postTimestamp)
        .slice(0, 30);
    return {
        statusCode: 200,
        body: JSON.stringify(body)
    };
};

const transform_item = ({item, userLat, userLon}) => {
    const postLon = item.coordinates.longitude;
    const postLat = item.coordinates.latitude;
    const distance = calculate_distance({
        lat1: userLat,
        lon1: userLon,
        lat2: postLat,
        lon2: postLon});
    return {
        uuid: item.uuid,
        firstName: item.firstName,
        content: item.content,
        distance: distance,
        phoneNumber: item.phoneNumber,
        postTimestamp: item.postTimestamp,
        whatsappSupported: item.whatsappSupported
    }
};

const calculate_distance = ({lat1,lon1,lat2,lon2}) => {
    const R = 6371;
    const dLat = (lat2-lat1) * Math.PI / 180;
    const dLon = (lon2-lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180 ) * Math.cos(lat2 * Math.PI / 180 ) *
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;
    if (d>1) return Math.round(d)+"km";
    else if (d<=1) return Math.round(d*10)*100+"m";
};

const isAuthorized = ({headers}) => {
    var lcKeys = Object.keys (headers).reduce (
         (keys, k) => {
             keys[k.toLowerCase()] = k;
             return keys
         }, {});

    const _getValue = (key) => headers[lcKeys[key.toLowerCase ()]];
    const passed_api_token = _getValue('x-solidarity-api-token');
    if(passed_api_token && (passed_api_token === config.api_token)) {
        return true;
    }
    else {
        return false;
    }
};