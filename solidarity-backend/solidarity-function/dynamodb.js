const config = require('./config');

const AWS = require('aws-sdk');
const ddb = new AWS.DynamoDB();

const ddb_geo = require('dynamodb-geo');
const data_manager_configuration = new ddb_geo.GeoDataManagerConfiguration(ddb, config.solidarity_table_name);

data_manager_configuration.hashKeyLength = config.geo_hash_key_length;

const geo_data_manager = new ddb_geo.GeoDataManager(data_manager_configuration);

exports.putSolidarityItem = async ({properties}) => {
    const item = {
        firstName: {S: properties.firstName},
        content: {S: properties.content},
        postTimestamp: {N: properties.postTimestamp.toString()},
        phoneNumber: {S: properties.phoneNumber},
        whatsappSupported: {BOOL: properties.whatsappSupported},
        uniqueDeviceId: { S: properties.uniqueDeviceId }
    };
    const put_item_request = {
        RangeKeyValue: {S: properties.uuid},
        GeoPoint: {
            latitude: properties.latitude,
            longitude: properties.longitude
        },
        PutItemInput: {
            Item: item
            //ReturnValues: 'ALL_OLD'
        }
    };
    //TODO: Find out why this call does not return the item.
    await geo_data_manager.putPoint(put_item_request).promise();

    // TODO: Get rid of this and take the item returned by the dynamoDB call.
    const geoJson = {
        type: 'POINT',
        coordinates: [properties.longitude, properties.latitude]
    };
    item.geoJson = {
        S: JSON.stringify(geoJson)
    };
    item.rangeKey = { S: properties.uuid};
    return transform_item(item);
};

exports.getSolidarityItems = async ({latitude, longitude, radius_in_meters}) => {
    const radius_search_query = {
        RadiusInMeter: radius_in_meters,
        CenterPoint: {
            latitude: latitude,
            longitude: longitude
        }
    };
    return await geo_data_manager.queryRadius(radius_search_query)
        .then((items) => items.map(transform_item));
};

const transform_item = (item) => {
    const geoJson = JSON.parse(item.geoJson.S);
    return {
        uuid: item.rangeKey.S,
        firstName: item.firstName.S,
        content: item.content.S,
        postTimestamp: parseInt(item.postTimestamp.N),
        phoneNumber: item.phoneNumber.S,
        whatsappSupported: item.whatsappSupported.BOOL,
        coordinates: {
            longitude: geoJson.coordinates[0],
            latitude: geoJson.coordinates[1]
        }
    };
};