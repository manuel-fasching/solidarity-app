import React from "react";

import {Card, Text} from "react-native-paper";
import {FlatList, RefreshControl, SafeAreaView, StyleSheet, View} from "react-native";
import {useState} from "react";
import {useCallback} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-native-fontawesome";
import {faMapMarkedAlt, faPhoneSquare, faSms} from '@fortawesome/free-solid-svg-icons';
import {faWhatsapp} from "@fortawesome/free-brands-svg-icons";
import {Linking} from 'react-native'

function Item({name, content, postTimestamp, phoneNumber, whatsappSupported, distance}) {
    const timeString = new Date(postTimestamp).toLocaleTimeString();
    const _openWhatsApp = () => {
        Linking.openURL(`whatsapp://send?phone=${phoneNumber.replace('+', '')}`);
    };
    const _openPhone = () => Linking.openURL(`tel:${phoneNumber}`);
    const _openMessenger = () => Linking.openURL(`sms:${phoneNumber}`);

    return (
        <Card style={styles.post}>
            <View style={styles.titleBar}>
                <View style={styles.name}>
                    <Text style={styles.nameText}>{name}</Text>
                </View>
                <View>
                    <Text style={styles.locationText}>&lt;{distance} <FontAwesomeIcon icon={faMapMarkedAlt}/>
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
                        onPress={_openPhone}/>
                </View>
                <View style={styles.contactBarView}>
                    <FontAwesomeIcon
                        icon={faSms}
                        size={28}
                        onPress={_openMessenger}/>
                </View>
                <View style={styles.contactBarView}>
                    {whatsappSupported && <FontAwesomeIcon
                        icon={faWhatsapp}
                        size={28}
                        onPress={_openWhatsApp}/>}
                </View>
            </View>
        </Card>)
}

export function Posts(props) {
    const [refreshing, setRefreshing] = useState(false);
    const onRefresh = useCallback(() => {
        setRefreshing(true);
        props.refreshFct().then(() => setRefreshing(false));
    }, [refreshing]);
    return (
        <SafeAreaView style={[styles.scrollView]}>
            {props.items.length === 0 &&
            <FlatList
                data={[0]}
                renderItem={({item}) => <View style={styles.noPostsView}>
                    <View style={{paddingBottom: 15}}><Text style={styles.noPostsTitle}>Es sind noch keine Beiträge vorhanden.</Text></View>
                    <View><Text style={styles.noPostsText}>Ergreife die Initiative und erstelle den ersten Beitrag in deiner Umgebung!</Text></View>
                </View>}
                keyExtractor={item => item.toString()}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh}/>}
            />}
            {props.items.length !== 0 && <FlatList
                data={props.items}
                initialNumToRender={10}
                maxToRenderPerBatch={10}
                renderItem={({item}) => <Item
                    name={item.firstName}
                    content={item.content}
                    postTimestamp={item.postTimestamp}
                    phoneNumber={item.phoneNumber}
                    whatsappSupported={props.showWhatsappButton && item.whatsappSupported}
                    distance={item.distance}
                />}
                keyExtractor={item => item.uuid}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh}/>}
            />}
        </SafeAreaView>
    );
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
    },
    noPostsView: {
        flex: 1
    },
    noPostsTitle: {
        textAlign: 'center',
        fontSize: 20
    },
    noPostsText: {
        textAlign: 'center',
        fontSize: 20
    }
});