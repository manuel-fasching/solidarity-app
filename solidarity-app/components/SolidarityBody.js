import React, {useEffect, useState} from "react";

import {Alert, AppState, Linking, StyleSheet, View} from "react-native";
import {Posts} from "./Posts";
import {ActivityIndicator, Button, FAB, Text} from "react-native-paper";
import {PostModal} from "./PostModal";
import * as Permissions from 'expo-permissions';
import * as Location from 'expo-location';
import uuid from 'react-native-uuid';
import {_getSolidarityPosts, _postSolidarityPost} from "../api/api";
import Constants from 'expo-constants';

export function SolidarityBody(props) {
    const initialLocationPermissionState = {
        locationPermissionsGranted: false,
        canAskAgainForLocationPermission: false,
        locationServicesEnabled: false
    };
    const [modalVisible, setModalVisible] = useState(false);
    const [whatsappSupported, setWhatsappSupported] = useState(false);
    const [locationPermissionState, setLocationPermissionsState] = useState(initialLocationPermissionState);
    const [data, setData] = useState([]);
    const [isInitialLoadingComplete, setInitialLoadingComplete] = useState(false);
    const [showLoadingSpinner, setShowLoadingSpinner] = useState(false);
    const [appState, setAppState] = useState(AppState.currentState);


    useEffect(() => {
        const _handleAppStateChange = async (nextAppState) => {
            if (appState.match(/inactive|background/) && nextAppState === 'active') {
                const locationServiceEnabledAndPermissionsGranted = await refreshLocationPermissionState();
                if(locationServiceEnabledAndPermissionsGranted) {
                    fetchData();
                }
            }
            setAppState(nextAppState);
        };
        AppState.addEventListener('change', _handleAppStateChange);
        return () => AppState.removeEventListener('change', _handleAppStateChange);
    });
    useEffect(() => {
        const _refresh_all = async () => {
            setShowLoadingSpinner(true);
            await refreshLocationPermissionState();
            await fetchData();
            await _refreshWhatsAppStatus();
            setShowLoadingSpinner(false);
            setInitialLoadingComplete(true);
        };
        const _refreshWhatsAppStatus = async () => {
            const waStatus = await Linking.canOpenURL('whatsapp://send?phone=1')
                .catch((err) => {
                    return false;
                });
            setWhatsappSupported(waStatus);
        };
        if (!isInitialLoadingComplete) {
            _refresh_all();
        }
    }, []);


    const postContent = async ({firstName, normalizedPhoneNumber, content}) => {
        const _showAlert = () => Alert.alert("Hoppla", "Sorry, leider ist etwas schiefgelaufen. Dein Beitrag konnte nicht erstellt werden.");
        let success = false;
        const status = await Permissions.getAsync(Permissions.LOCATION);
        if (status.granted) {
            const location = await Location.getCurrentPositionAsync({})
                .catch(err => console.warn(err));
            if (location) {
                const post = await _postSolidarityPost({
                    uuid: uuid.v4(),
                    postTimestamp: new Date().getTime(),
                    content: content,
                    firstName: firstName,
                    whatsappSupported: whatsappSupported,
                    longitude: location.coords.longitude,
                    latitude: location.coords.latitude,
                    phoneNumber: normalizedPhoneNumber,
                    uniqueDeviceId: Constants.installationId
                }).catch(_showAlert);
                if(post) {
                    setData([post, ...data]);
                    success = true;
                }
            }
            setModalVisible(false);
        }
        return success;
    };


    const handleAskForLocationPermissionsButtonClick = async () => {
        const locationPermissionState = {
            locationPermissionsGranted: false,
            canAskAgainForLocationPermission: false,
            locationServiceEnabled: false
        };
        const status = await Permissions.askAsync(Permissions.LOCATION);
        locationPermissionState.locationPermissionsGranted = status.granted;
        locationPermissionState.canAskAgainForLocationPermission = status.canAskAgain;
        if (status.granted) {
            const providerStatus = await Location.getProviderStatusAsync();
            locationPermissionState.locationServiceEnabled = providerStatus.locationServicesEnabled;
        }
        fetchData();
        setLocationPermissionsState(locationPermissionState);
    };

    const handleReloadLocationPermissionsButtonClick = async () => {
        const _locationPermissionsState = {
            locationPermissionsGranted: false,
            canAskAgainForLocationPermission: false,
            locationServicesEnabled: false
        };
        const status = await Permissions.getAsync(Permissions.LOCATION);
        _locationPermissionsState.locationPermissionsGranted = status.granted;
        _locationPermissionsState.canAskAgainForLocationPermission = status.canAskAgain;
        if (status.granted) {
            const providerStatus = await Location.getProviderStatusAsync();
            _locationPermissionsState.locationServicesEnabled = providerStatus.locationServicesEnabled;
        }
        if(_locationPermissionsState.locationServicesEnabled && _locationPermissionsState.locationPermissionsGranted) {
            setShowLoadingSpinner(true);
            await fetchData();
            setShowLoadingSpinner(false);
        }
        setLocationPermissionsState(_locationPermissionsState);
    };



    const refreshLocationPermissionState = async () => {
        const _locationPermissionsState = {
            locationPermissionsGranted: false,
            canAskAgainForLocationPermission: false,
            locationServicesEnabled: false
        };
        const status = await Permissions.getAsync(Permissions.LOCATION);
        _locationPermissionsState.locationPermissionsGranted = status.granted;
        _locationPermissionsState.canAskAgainForLocationPermission = status.canAskAgain;
        if (status.granted) {
            const providerStatus = await Location.getProviderStatusAsync();
            _locationPermissionsState.locationServicesEnabled = providerStatus.locationServicesEnabled;
        }
        setLocationPermissionsState(_locationPermissionsState);
        return _locationPermissionsState.locationPermissionsGranted && _locationPermissionsState.locationServicesEnabled
    };

    const fetchData = async () => {
        const status = await Permissions.getAsync(Permissions.LOCATION);
        if (status.granted) {
            const location = await Location.getCurrentPositionAsync({})
                .catch(err => console.warn(err));
            if (location) {
                const newData = await _getSolidarityPosts({
                    longitude: location.coords.longitude,
                    latitude: location.coords.latitude,
                }).catch((err) => console.warn(err));
                if (newData) {
                    setData(newData);
                }
            }
        }
    };

    // Post Modal
    if (showLoadingSpinner) {
        return (
            <View style={[styles.container, {justifyContent: 'center'}]}>
                <ActivityIndicator color='#3590B7' size='large'/>
            </View>);
    } else if (!locationPermissionState.locationPermissionsGranted && locationPermissionState.canAskAgainForLocationPermission) {
        return (
            <View style={[styles.container, {justifyContent: 'center'}]}>
                <View style={{paddingBottom: 15}}><Text style={styles.locationPermissionTitle}>Hallo!</Text></View>
                <View><Text style={styles.locationPermissionText}>Damit Solidarity dir Beiträge in deiner Nähe anzeigen
                    kann muss Solidarity auf deinen Standort zugreifen!</Text></View>
                <Button mode='contained' onPress={handleAskForLocationPermissionsButtonClick} style={styles.locationPermissionButton}>Standort
                    erlauben</Button>
            </View>
        );
    } else if (!locationPermissionState.locationPermissionsGranted && !locationPermissionState.canAskAgainForLocationPermission) {
        return (
            <View style={[styles.container, {justifyContent: 'center'}]}>
                <View style={{paddingBottom: 15}}><Text style={styles.locationPermissionTitle}>Solidarity braucht deinen
                    deinen Standort!</Text></View>
                <View><Text style={styles.locationPermissionText}>Bitte gehe zu deinen Einstellungen und erlaube
                    Solidarity auf deinen Standort zuzugreifen!</Text></View>
            </View>
        );
    } else if (!locationPermissionState.locationServicesEnabled) {
        return (
            <View style={[styles.container, {justifyContent: 'center'}]}>
                <View style={{paddingBottom: 15}}><Text style={styles.locationPermissionTitle}>Solidarity braucht deinen
                    deinen Standort!</Text></View>
                <View><Text style={styles.locationPermissionText}>Bist du gerade im Offlinemodus? Bitte aktiviere den
                    Standortzugriff!</Text></View>
                <View><Button mode='contained' onPress={handleReloadLocationPermissionsButtonClick} style={styles.locationPermissionButton}>Neu laden</Button></View>
            </View>
        );
    } else {
        return (
            <View style={styles.container}>
                <Posts
                    showWhatsappButton={whatsappSupported}
                    refreshFct={fetchData}
                    items={data}
                />
                <PostModal
                    visible={modalVisible}
                    setModalVisible={setModalVisible}
                    postFct={postContent}
                />
                <View>
                    <FAB
                        style={styles.fab}
                        onPress={() => setModalVisible(true)}
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