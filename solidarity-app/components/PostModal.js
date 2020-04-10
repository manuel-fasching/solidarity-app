import React, {useCallback, useEffect, useRef, useState} from "react";
import {Button, IconButton, TextInput, Text, ActivityIndicator} from "react-native-paper";
import {Modal, StyleSheet, View} from "react-native";
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view";

export function PostModal(props) {

    const postModalInputValuesInitial = {
        firstName: '',
        countryCode: '+43',
        phoneNumber: '',
        content:'',
    };
    const [firstName, setFirstName] = useState(postModalInputValuesInitial.name);
    const [countryCode, setCountryCode] = useState(postModalInputValuesInitial.countryCode);
    const [phoneNumber, setPhoneNumber] = useState(postModalInputValuesInitial.phoneNumber);
    const [content, setContent] = useState(postModalInputValuesInitial.content);
    const [postInProgress, setPostInProgress] = useState(false);
    const [postModalErrors, setPostModalErrors] = useState({});


    const setCountryCodeFct = (cc) => {
        if(cc.match(/^([+][0-9]{0,3})?$/g)){
            setCountryCode(cc)
        }
    };
    const setPhoneNumberFct = (pn) => {
        if(pn.match(/^([0-9]*)$/g)) {
            setPhoneNumber(pn)
        }
    };

    const postContent = async () => {
        setPostInProgress(true);
        const _runPostModalInputFieldValidation = ({firstName, countryCode, phoneNumber, content}) => {
            let errorMessages = {};
            if (!firstName || firstName=== '') {
                errorMessages.firstName = 'Bitte gib deinen Vornamen an';
            }
            if (!countryCode || countryCode === '' || countryCode.length === 1) {
                errorMessages.countryCode = '----';
            }
            if (!phoneNumber || phoneNumber === '') {
                errorMessages.phoneNumber = 'Bitte gib deine Telefonnummer an';
            }
            if (!content || content === '') {
                errorMessages.content = 'Bitte verfasse eine Nachricht';
            }
            return errorMessages;
        };
        const _compilePhoneNumber = ({countryCode, phoneNumber}) => {
            const normalizedPhoneNumber = phoneNumber.replace(/\D/g, '').replace(/^0+/, '');
            return `${countryCode}${normalizedPhoneNumber}`;
        };
        const errorMessages = _runPostModalInputFieldValidation({firstName: firstName, countryCode: countryCode, phoneNumber: phoneNumber, content: content});
        setPostModalErrors(errorMessages);
        if(Object.keys(errorMessages).length === 0){
            const success = await props.postFct({
                firstName: firstName,
                normalizedPhoneNumber: _compilePhoneNumber({countryCode: countryCode, phoneNumber: phoneNumber}),
                content: content
            });
            if (success) {
                setFirstName(postModalInputValuesInitial.name);
                setCountryCode(postModalInputValuesInitial.countryCode);
                setPhoneNumber(postModalInputValuesInitial.phoneNumber);
                setContent(postModalInputValuesInitial.content);
            }
        }
        setPostInProgress(false);
    };

    const hideModal = () => {
        setFirstName(postModalInputValuesInitial.name);
        setCountryCode(postModalInputValuesInitial.countryCode);
        setPhoneNumber(postModalInputValuesInitial.phoneNumber);
        setContent(postModalInputValuesInitial.content);
        setPostModalErrors([]);
        props.setModalVisible(false)
    };
    return (
        <Modal
            animationType="slide"
            transparent={false}
            visible={props.visible}
            presentationStyle='fullScreen'>
            <View style={styles.controlBar}>
                <View style={styles.controlIcon}><IconButton disabled={postInProgress} icon='close' onPress={hideModal}/></View>
                <View style={{flexDirection: 'row'}}>
                    <View style={styles.controlIcon}>{postInProgress && <ActivityIndicator color='#3590B7' size='small'/>}</View>
                    <View style={styles.controlIcon}><Button disabled={postInProgress} mode='contained' onPress={postContent}>Posten</Button></View>
                </View>
            </View>
            <KeyboardAwareScrollView style={styles.scrollView}>
                <View style={styles.textInputView}>
                    <TextInput
                        label="Dein Vorname"
                        multiline={false}
                        onChangeText={firstName => setFirstName(firstName)}
                        value={firstName}
                        maxLength={20}
                        mode='outlined'
                        dense={false}
                        autoFocus={true}
                    />
                    {postModalErrors.firstName && <Text style={styles.errorMessage}>{postModalErrors.firstName}</Text>}
                </View>
                <View style={[styles.phoneRow, styles.textInputView]}>
                    <View style={{flex: 1, marginRight: 10}}>
                        <TextInput
                            label='Ländervorwahl'
                            multiline={false}
                            onChangeText={countryCode => setCountryCodeFct(countryCode)}
                            value={countryCode}
                            mode='outlined'
                            keyboardType="phone-pad"
                            maxLength={4}
                            dense={false}
                        />
                        {postModalErrors.countryCode && <Text style={styles.errorMessage}>{postModalErrors.countryCode}</Text>}
                    </View>
                    <View style={{flex: 5}}>
                        <TextInput
                            label="Deine Telefonnummer"
                            multiline={false}
                            onChangeText={phoneNumber => setPhoneNumberFct(phoneNumber)}
                            value={phoneNumber}
                            maxLength={20}
                            mode='outlined'
                            keyboardType="number-pad"
                            dense={false}
                        />
                        {postModalErrors.phoneNumber && <Text style={styles.errorMessage}>{postModalErrors.phoneNumber}</Text>}
                    </View>
                </View>
                <View>
                    <TextInput
                        label="Deine Nachricht"
                        multiline={true}
                        onChangeText={message => setContent(message)}
                        value={content}
                        maxLength={280}
                        mode='outlined'
                        numberOfLines={5}
                        dense={false}
                    />
                    {postModalErrors.content && <Text style={styles.errorMessage}>{postModalErrors.content}</Text>}
                </View>
            </KeyboardAwareScrollView>
        </Modal>
    )
}

const styles = StyleSheet.create({
    controlBar: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    controlIcon: {
        margin: 10
    },
    scrollView: {
        padding: 8
    },
    phoneRow: {
        flexDirection: 'row'
    },
    errorMessage: {
        color: '#C50E0E'
    },
    textInputView: {
        marginBottom: 10
    }
});