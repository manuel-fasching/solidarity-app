import React from "react";
import {Appbar} from "react-native-paper";

export function SolidarityHeader(props) {
    return (
        <Appbar.Header>
            <Appbar.Content
                title='Solidarity'
                subtitle='für uns alle'
                style={{alignItems: 'center'}}
            />
        </Appbar.Header>
    )
}