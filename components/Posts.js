import React from "react";

import {Card, Text} from "react-native-paper";
import {FlatList, RefreshControl, SafeAreaView, StyleSheet, View} from "react-native";
import {useState} from "react";
import {useCallback} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-native-fontawesome";
import { faMapMarkedAlt, faPhoneSquare, faSms } from '@fortawesome/free-solid-svg-icons';
import { faWhatsapp} from "@fortawesome/free-brands-svg-icons";
import {Linking} from 'react-native'

function wait(timeout) {
    return new Promise(resolve => {
        setTimeout(resolve, timeout);
    });
}

function Item({name, content, postTimestamp, phoneNumber, whatsappSupported, myLongitude, myLatitude, itemLongitude, itemLatitude}) {
    const timeString = new Date(postTimestamp).toLocaleTimeString();
    const calculateDistance = (lat1,lon1,lat2,lon2) => {
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
    const distance = calculateDistance(myLatitude, myLongitude, itemLatitude, itemLongitude);
    const openWhatsApp = () => {
        Linking.openURL(`whatsapp://send?phone=${phoneNumber.replace('+', '')}`);
    };
    const openPhone = () => Linking.openURL(`tel:${phoneNumber}`);
    const openMessenger = () => Linking.openURL(`sms:${phoneNumber}`);

    return (
        <Card style={styles.post}>
            <View style={styles.titleBar}>
                <View style={styles.name}>
                    <Text style={styles.nameText}>{name}</Text>
                </View>
                <View>
                    <Text style={styles.locationText}>&lt;{distance}  <FontAwesomeIcon icon={faMapMarkedAlt} />
                    </Text>
                </View>
            </View>
            <View>
                <Text style={styles.time}>{timeString}</Text>
            </View>
            <View>
                <Text style={styles.paragraph}>
                    {content}
                </Text>
            </View>
            <View style={styles.contactBar}>
                <View style={styles.contactBarView}>
                    <FontAwesomeIcon
                        icon={faPhoneSquare}
                        size={28}
                        onPress={openPhone}/>
                </View>
                <View style={styles.contactBarView}>
                    <FontAwesomeIcon
                        icon={faSms}
                        size={28}
                        onPress={openMessenger}/>
                </View>
                <View style={styles.contactBarView}>
                    {whatsappSupported && <FontAwesomeIcon
                        icon={faWhatsapp}
                        size={28}
                        onPress={openWhatsApp}/> }
                </View>
            </View>
        </Card>)
}

export function Posts(props) {
    const [refreshing, setRefreshing] = useState(false);
    const[location, setLocation] = useState(undefined)
    const onRefresh = useCallback(() => {
        setRefreshing(true);
        wait(2000).then(() => setRefreshing(false));
    }, [refreshing]);

    const currentLocation = {
        lat: 48.137154,
        long: 11.576124
    };


    return (
        <SafeAreaView style={styles.scrollView}>
            <FlatList
                data={props.items}
                renderItem={ ({ item }) => <Item
                    name={item.name}
                    content={item.content}
                    postTimestamp={item.postTimestamp}
                    phoneNumber={item.phoneNumber}
                    whatsappSupported={props.showWhatsappButton && item.whatsappSupported}
                    myLongitude={currentLocation.long}
                    myLatitude={currentLocation.lat}
                    itemLongitude={item.location.long}
                    itemLatitude={item.location.lat}
                />}
                keyExtractor={item => item.id}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh}/>}
            />
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    titleBar: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    name: {
        marginLeft: 10,
        marginTop: 10,
    },
    nameText: {
        fontWeight: 'bold'
    },
    time: {
        color: '#777777',
        fontSize: 10,
        marginLeft: 10
    },
    post: {
        marginBottom: 5
    },
    locationText: {
        marginRight: 10,
        marginTop: 10
    },
    paragraph: {
        flexDirection: 'row',
        margin: 10,
        fontSize: 16
    },
    contactBar: {
        flexDirection: 'row',
        margin: 10
    },
    contactBarView: {
        marginRight: 15
    },
    scrollView: {
        flex: 1
    }
});