import React, {useEffect, useState} from "react";

import {Linking, StyleSheet, View} from "react-native";
import {Posts} from "./Posts";
import {FAB} from "react-native-paper";
import {PostModal} from "./PostModal";
import uuid from 'react-native-uuid';


let DATA = [
    {
        id: 'random-uuid1',
        userToken: 'user1',
        postTimestamp: new Date().getTime(),
        content: 'Hi, kann jemand mit meinen Hund Gassi gehen?',
        whatsappSupported: true,
        name: 'Manuel',
        location: {
            long: 11.5775,
            lat: 48.1422222222
        },
        phoneNumber: '034343423434'
    },
    {
        id: 'random-uuid2',
        userToken: 'user2',
        postTimestamp: new Date().getTime(),
        content: 'Hallo zusammen. Könnte jemand für mich Lebensmittel einkaufen? Ich darf leider das Haus nicht mehr verlassen...',
        name: 'Alina',
        whatsappSupported: false,
        location: {
            long: 11.586,
            lat: 48.161
        },
        phoneNumber: '034343423434'
    },
    {
        id: 'random-uuid3',
        userToken: 'user3',
        postTimestamp: new Date().getTime(),
        content: 'HILFE! Bello müsste dringend raus und ich darf nicht.',
        name: 'Thomas',
        whatsappSupported: true,
        location: {
            long: 11.6215158473,
            lat: 48.2179307949
        },
        phoneNumber: '034343423434'
    },
];

export function SolidarityBody(props) {
    const [modalVisible, setModalVisible] = useState(false);
    const [position, setPosition] = useState({
        latitude: 0,
        longitude: 0
    });
    const [whatsappSupported, setWhatsappSupported] = useState(false);
    const [postModalNameErrorMessage, setPostModalNameErrorMessage] = useState(null);
    const [postModalCountryCodeErrorMessage, setPostModalCountryCodeErrorMessage] = useState(null);
    const [postModalPhoneNumberErrorMessage, setPostModalPhoneNumberErrorMessage] = useState(null);
    const [postModalMessageErrorMessage, setPostModalMessageErrorMessage] = useState(null);

    const [postModalName, setPostModalName] = useState('');
    const [postModalCountryCode, setPostModalCountryCode] = useState('+43');
    const [postModalPhoneNumber, setPostModalPhoneNumber] = useState('');
    const [postModalMessage, setPostModalMessage] = useState('');

    useEffect(() => {
        async function checkIfWhatsappIsInstalled() {
            const isWaInstalled = await Linking.canOpenURL('whatsapp://')
                .catch((err) => {
                    console.warn(err);
                    return false;
                });
            setWhatsappSupported(isWaInstalled)
        }
        checkIfWhatsappIsInstalled();
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
                location: {
                    long: position.longitude,
                    lat: position.latitude
                },
                phoneNumber: compilePhoneNumber()
            });
            DATA = DATA.sort((a, b) => b.postTimestamp - a.postTimestamp)
            hideModal()
        }
    };

    return (
        <View style={styles.container}>
            <Posts
                showWhatsappButton={whatsappSupported}
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