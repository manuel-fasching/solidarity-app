import React, {useEffect, useState} from "react";

import {AppState, Linking, StyleSheet, View} from "react-native";
import {Posts} from "./Posts";
import {ActivityIndicator, Button, FAB, Text} from "react-native-paper";
import {PostModal} from "./PostModal";
import uuid from 'react-native-uuid';
import * as Permissions from 'expo-permissions';
import * as Location from 'expo-location';


let DATA = [];

export function SolidarityBody(props) {
    const [modalVisible, setModalVisible] = useState(false);
    const [currentLongitude, setCurrentLongitude] = useState(null);
    const [currentLatitude, setCurrentLatitude] = useState(null);
    const [whatsappSupported, setWhatsappSupported] = useState(false);
    const [postModalNameErrorMessage, setPostModalNameErrorMessage] = useState(null);
    const [postModalCountryCodeErrorMessage, setPostModalCountryCodeErrorMessage] = useState(null);
    const [postModalPhoneNumberErrorMessage, setPostModalPhoneNumberErrorMessage] = useState(null);
    const [postModalMessageErrorMessage, setPostModalMessageErrorMessage] = useState(null);
    const [postModalName, setPostModalName] = useState('');
    const [postModalCountryCode, setPostModalCountryCode] = useState('+43');
    const [postModalPhoneNumber, setPostModalPhoneNumber] = useState('');
    const [postModalMessage, setPostModalMessage] = useState('');
    const [locationPermissionGranted, setLocationPermissionGranted] = useState(false);
    const [canAskAgainForLocationPermission, setCanAskAgainForLocationPermission] = useState(true);

    const [isLoadingComplete, setLoadingComplete] = useState(false);
    const [appState, setAppState] = useState(AppState.currentState);


    const _askForLocationPermission = async () => {
        const status = await Permissions.askAsync(Permissions.LOCATION);
        const granted = status.status === 'granted';
        const canAskAgain = status.canAskAgain;
        setLocationPermissionGranted(granted);
        setCanAskAgainForLocationPermission(canAskAgain);
    };
    const _setCurrentLocationIfAllowed = async () => {
        const status = await Permissions.getAsync(Permissions.LOCATION);
        const granted = status.status === 'granted';
        if (granted) {
            let location = await Location.getCurrentPositionAsync({});
            setCurrentLongitude(location.coords.longitude);
            setCurrentLatitude(location.coords.latitude);
            setLocationPermissionGranted(true);
        }
        return granted;
    };

    const _setWhatsAppStatus = async () => {
        const waStatus = await Linking.canOpenURL('whatsapp://send?phone=1')
            .catch((err) => {
                console.warn(err);
                return false;
            });
        setWhatsappSupported(waStatus);
    };

    useEffect(() => {
        const _handleAppStateChange = async (nextAppState) => {
            if (appState.match(/inactive|background/) && nextAppState === 'active') {
                setLoadingComplete(false);
                setCurrentLatitude(null);
                setCurrentLongitude(null);
                await _setCurrentLocationIfAllowed();
                await _setWhatsAppStatus();
                setLoadingComplete(true);
            }
            setAppState(nextAppState);
        };
        if (!isLoadingComplete) {
            _setCurrentLocationIfAllowed();
            _setWhatsAppStatus();
            setLoadingComplete(true);
        }
        AppState.addEventListener('change', _handleAppStateChange);
        return () => AppState.removeEventListener('change', _handleAppStateChange);
    });

    const _resetErrors = () => {
        setPostModalNameErrorMessage(null);
        setPostModalCountryCodeErrorMessage(null);
        setPostModalPhoneNumberErrorMessage(null);
        setPostModalMessageErrorMessage(null);
    };
    const _resetPostModalInputFields = () => {
        setPostModalPhoneNumber('');
        setPostModalName('');
        setPostModalCountryCode('+43');
        setPostModalMessage('');
    };

    const _showModal = () => setModalVisible(true);
    const _hideModal = () => {
        _resetErrors();
        _resetPostModalInputFields();
        setModalVisible(false);
    };

    const _postModalInputFieldsFilled = () => {
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
    const _postContent = () => {
        _resetErrors();
        if (!_postModalInputFieldsFilled()) {
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
                longitude: currentLongitude,
                latitude: currentLatitude,
                phoneNumber: compilePhoneNumber()
            });
            DATA = DATA.sort((a, b) => b.postTimestamp - a.postTimestamp);
            _hideModal()
        }
    };
    if (!isLoadingComplete) {
        return (
            <View style={[styles.container, {justifyContent: 'center'}]}>
                <ActivityIndicator color='#3590B7' size='large'/>
            </View>);
    } else if (!locationPermissionGranted && canAskAgainForLocationPermission) {
        return (
            <View style={[styles.container, {justifyContent: 'center'}]}>
                <View style={{paddingBottom: 15}}><Text style={styles.locationPermissionTitle}>Hallo!</Text></View>
                <View><Text style={styles.locationPermissionText}>Damit Solidarity dir Beiträge in deiner Nähe anzeigen
                    kann muss Solidarity auf deinen Standort zugreifen.</Text></View>
                <Button mode='contained' onPress={_askForLocationPermission} style={styles.locationPermissionButton}>Standort
                    erlauben</Button>
            </View>
        );
    } else if (!locationPermissionGranted && !canAskAgainForLocationPermission) {
        return (
            <View style={[styles.container, {justifyContent: 'center'}]}>
                <View style={{paddingBottom: 15}}><Text style={styles.locationPermissionTitle}>Solidarity braucht deinen
                    deinen Standort!</Text></View>
                <View><Text style={styles.locationPermissionText}>Bitte gehe zu deinen Einstellungen und erlaube
                    Solidarity auf deinen Standort zuzugreifen!</Text></View>
            </View>
        );
    } else {
        return (
            <View style={styles.container}>
                <Posts
                    showWhatsappButton={whatsappSupported}
                    currentLongitude={currentLongitude}
                    currentLatitude={currentLatitude}
                    items={DATA}
                />
                <PostModal
                    visible={modalVisible}
                    hideModalFct={_hideModal}
                    postFct={_postContent}
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
                        onPress={_showModal}
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
    locationPermissionTitle: {
        textAlign: 'center',
        fontSize: 20
    },
    locationPermissionText: {
        textAlign: 'center',
        fontSize: 14
    },
    locationPermissionButton: {
        marginTop: 15
    }
});