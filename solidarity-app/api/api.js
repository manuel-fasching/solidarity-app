import config from "../config/config";

export async function _postSolidarityPost({uuid, postTimestamp, content, firstName, whatsappSupported, longitude, latitude, phoneNumber, uniqueDeviceId}) {
    return fetch(`${config.api_base_url}/posts`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Solidarity-Api-Token': config.solidarity_api_token
        },
        body: JSON.stringify({
            uuid: uuid,
            postTimestamp: postTimestamp,
            content: content,
            firstName: firstName,
            whatsappSupported: whatsappSupported,
            longitude: longitude,
            latitude: latitude,
            phoneNumber: phoneNumber,
            uniqueDeviceId: uniqueDeviceId
        })
    }).then((response) => {
            if (response.status !== 201) {
                throw response.status;
            }
            return response.json();
        })
}

export async function _getSolidarityPosts({longitude, latitude}) {
    async function runGetCall({longitude, latitude, radiusInMeters}) {
        return await fetch(`${config.api_base_url}/posts?longitude=${longitude}&latitude=${latitude}&radiusInMeters=${radiusInMeters}`,{
            headers: {
                'X-Solidarity-Api-Token': config.solidarity_api_token
            }
        })
            .then((response) => {
                if (response.status !== 200) {
                    throw response.status;
                }
                return response.json()
            });
    }
    let posts = [];
    const radiusSelection = [500, 2000, 5000];
    for (let i = 0; i < radiusSelection.length; i++) {
        posts = posts.concat(await runGetCall({longitude: longitude, latitude: latitude, radiusInMeters: radiusSelection[i]}));
        if(posts.length >= 5) {
            break;
        }
    }
    const distinctPosts = Array
        .from(new Set(posts.map(p => p.uuid)))
        .map(uuid => posts.find(p => p.uuid === uuid));
    return distinctPosts.sort((a, b) => b.postTimestamp - a.postTimestamp);
}