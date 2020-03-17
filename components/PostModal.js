import React, {useCallback, useEffect, useRef, useState} from "react";
import {Button, IconButton, TextInput} from "react-native-paper";
import {Modal, StyleSheet, Text, View} from "react-native";
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view";

export function PostModal(props) {

    const setCountryCodeFct = (cc) => {
        if(cc.match(/^([+][0-9]{0,3})?$/g)){
            props.setCountryCodeFct(cc)
        }
    };
    const setPhoneNumberFct = (pn) => {
        if(pn.match(/^([0-9]*)$/g)) {
            props.setPhoneNumberFct(pn)
        }

    };

    return (
        <Modal
            animationType="slide"
            transparent={false}
            visible={props.visible}
            presentationStyle='fullScreen'>
            <View style={styles.controlBar}>
                <View style={styles.controlIcon}><IconButton icon='close' onPress={props.hideModalFct}/></View>
                <View style={styles.controlIcon}><Button mode='contained' onPress={props.postFct}>Posten</Button></View>
            </View>
            <KeyboardAwareScrollView style={styles.scrollView}>
                <View style={styles.textInputView}>
                    <TextInput
                        label="Dein Vorname"
                        multiline={false}
                        onChangeText={name => props.setNameFct(name)}
                        value={props.name}
                        maxLength={20}
                        mode='outlined'
                        dense={false}
                        autoFocus={true}
                    />
                    {props.nameError && <Text style={styles.errorMessage}>{props.nameError}</Text>}
                </View>
                <View style={[styles.phoneRow, styles.textInputView]}>
                    <View style={{flex: 1, marginRight: 10}}>
                        <TextInput
                            label='Ländervorwahl'
                            multiline={false}
                            onChangeText={countryCode => setCountryCodeFct(countryCode)}
                            value={props.countryCode}
                            mode='outlined'
                            keyboardType="phone-pad"
                            maxLength={4}
                            dense={false}
                        />
                        {props.countryCodeError && <Text style={styles.errorMessage}>{props.countryCodeError}</Text>}
                    </View>
                    <View style={{flex: 5}}>
                        <TextInput
                            label="Deine Telefonnummer"
                            multiline={false}
                            onChangeText={phoneNumber => setPhoneNumberFct(phoneNumber)}
                            value={props.phoneNumber}
                            maxLength={20}
                            mode='outlined'
                            keyboardType="number-pad"
                            dense={false}
                        />
                        {props.phoneNumberError && <Text style={styles.errorMessage}>{props.phoneNumberError}</Text>}
                    </View>
                </View>
                <View>
                    <TextInput
                        label="Deine Nachricht"
                        multiline={true}
                        onChangeText={message => props.setMessageFct(message)}
                        value={props.message}
                        maxLength={280}
                        mode='outlined'
                        numberOfLines={5}
                        dense={false}
                    />
                    {props.messageError && <Text style={styles.errorMessage}>{props.messageError}</Text>}
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