import React, {useEffect, useState} from "react";

import {Alert, Linking, StyleSheet, View} from "react-native";
import {Posts} from "./Posts";
import {ActivityIndicator, FAB} from "react-native-paper";
import {PostModal} from "./PostModal";
import uuid from 'react-native-uuid';
import * as Permissions from 'expo-permissions';
import * as Location from 'expo-location';
import {AsyncStorage} from 'react-native';


let DATA = [
];

export function SolidarityBody(props) {
    const [modalVisible, setModalVisible] = useState(false);
    const [currentLocation, setCurrentLocation] = useState(null);
    const [whatsappSupported, setWhatsappSupported] = useState(false);
    const [postModalNameErrorMessage, setPostModalNameErrorMessage] = useState(null);
    const [postModalCountryCodeErrorMessage, setPostModalCountryCodeErrorMessage] = useState(null);
    const [postModalPhoneNumberErrorMessage, setPostModalPhoneNumberErrorMessage] = useState(null);
    const [postModalMessageErrorMessage, setPostModalMessageErrorMessage] = useState(null);
    const [isLoadingComplete, setLoadingComplete] = useState(false);

    const [postModalName, setPostModalName] = useState('');
    const [postModalCountryCode, setPostModalCountryCode] = useState('+43');
    const [postModalPhoneNumber, setPostModalPhoneNumber] = useState('');
    const [postModalMessage, setPostModalMessage] = useState('');

    useEffect(() => {
        const loadRequiredData = async () => {
            // Check if it's the first app open
            try {
                const value = await AsyncStorage.getItem('isFirstAppOpen');
                if (value === null) {
                    Alert.alert('Hallo!',
                        'Solidarity braucht deinen Standort um dir Beiträge in deiner Umgebung anzuzeigen.');
                    await AsyncStorage.setItem('isFirstAppOpen', 'false');
                }
            } catch (error) {
                console.log(error);
            }

            // Check if we (still) have location permission
            const status = await Permissions.askAsync(Permissions.LOCATION);
            if (status.status !== 'granted') {
                console.log('permissions not granted');
            }

            let location = await Location.getCurrentPositionAsync({});
            setCurrentLocation({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude
            });

            // Check if WhatsApp is installed
            const isWaInstalled = await Linking.canOpenURL('whatsapp://send?phone=1')
                .catch((err) => {
                    console.warn(err);
                    return false;
                });
            setWhatsappSupported(isWaInstalled);
            setLoadingComplete(true);
        };
        loadRequiredData();
    }, []);

    const resetErrors = () => {
        setPostModalNameErrorMessage(null);
        setPostModalCountryCodeErrorMessage(null);
        setPostModalPhoneNumberErrorMessage(null);
        setPostModalMessageErrorMessage(null);
    };
    const resetPostModalInputFields = () => {
        setPostModalPhoneNumber('');
        setPostModalName('');
        setPostModalCountryCode('+43');
        setPostModalMessage('');
    };

    const showModal = () => setModalVisible(true);
    const hideModal = () => {
        resetErrors();
        resetPostModalInputFields();
        setModalVisible(false);
    };

    const postModalInputFieldsFilled = () => {
        let empty = false;
        if (!postModalName || postModalName === '') {
            setPostModalNameErrorMessage('Bitte gib deinen Vornamen an');
            empty = true;
        }
        if (!postModalCountryCode || postModalCountryCode === '' || postModalCountryCode.length === 1) {
            setPostModalCountryCodeErrorMessage('----');
            empty = true;
        }
        if (!postModalPhoneNumber || postModalPhoneNumber === '') {
            setPostModalPhoneNumberErrorMessage('Bitte gib deine Telefonnummer an');
            empty = true;
        }
        if (!postModalMessage || postModalMessage === '') {
            setPostModalMessageErrorMessage('Bitte verfasse eine Nachricht');
            empty = true;
        }
        return empty;
    };
    const postContent = () => {
        resetErrors();
        if (!postModalInputFieldsFilled()) {
            const compilePhoneNumber = () => {
                const normalizedPhoneNumber = postModalPhoneNumber.replace(/\D/g, '').replace(/^0+/, '');
                return `${postModalCountryCode}${normalizedPhoneNumber}`;
            };
            DATA.push({
                id: uuid.v4(),
                userToken: 'user1',
                postTimestamp: new Date().getTime(),
                content: postModalMessage,
                name: postModalName,
                whatsappSupported: whatsappSupported,
                location: currentLocation,
                phoneNumber: compilePhoneNumber()
            });
            DATA = DATA.sort((a, b) => b.postTimestamp - a.postTimestamp)
            hideModal()
        }
    };
    if (!isLoadingComplete) {
        return (
            <View style={[styles.container, {justifyContent: 'center'}]}>
                <ActivityIndicator color='#3590B7' size='large'/>
            </View>);
    } else {
        return (
            <View style={styles.container}>
                <Posts
                    showWhatsappButton={whatsappSupported}
                    currentLocation={currentLocation}
                    items={DATA}
                />
                <PostModal
                    visible={modalVisible}
                    hideModalFct={hideModal}
                    postFct={postContent}
                    nameError={postModalNameErrorMessage}
                    countryCodeError={postModalCountryCodeErrorMessage}
                    phoneNumberError={postModalPhoneNumberErrorMessage}
                    messageError={postModalMessageErrorMessage}
                    setNameFct={(name) => setPostModalName(name)}
                    setCountryCodeFct={(cc) => setPostModalCountryCode(cc)}
                    setPhoneNumberFct={(pn) => setPostModalPhoneNumber(pn)}
                    setMessageFct={(m) => setPostModalMessage(m)}
                    name={postModalName}
                    countryCode={postModalCountryCode}
                    phoneNumber={postModalPhoneNumber}
                    message={postModalMessage}
                />
                <View>
                    <FAB
                        style={styles.fab}
                        onPress={showModal}
                        icon='plus'
                        mode='contained'>
                    </FAB>
                </View>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ADC5CB',
        paddingLeft: 8,
        paddingRight: 8
    },
    postButton: {
        marginTop: 10
    },
    fab: {
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: 0,
    },
});