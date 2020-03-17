import React from "react";
import {Text, View} from "react-native";
import {TextInput} from "react-native-paper";

const TextField = props => (
    <View>
        <TextInput/>
        {props.error && <Text>{props.error}</Text>}
    </View>
)

export default TextField