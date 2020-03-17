import React, {useEffect, useState} from "react";

import {
    configureFonts,
    DefaultTheme,
    Provider as PaperProvider,
} from 'react-native-paper';
import {SolidarityBody} from "./components/SolidarityBody";
import {SolidarityHeader} from "./components/SolidarityHeader";
import { Ionicons } from '@expo/vector-icons';
import * as Font from 'expo-font';

const fontConfig = {
    default: {
        regular: {
            fontFamily: 'space-mono',
            fontWeight: 'normal',
        },
    },
};

const theme = {
    ...DefaultTheme,
    roundness: 2,
    colors: {
        ...DefaultTheme.colors,
        primary: '#3590B7',
        accent: '#f1c40f',
    },
    fonts: configureFonts(fontConfig),
};

export default function App() {
    const [isLoadingComplete, setLoadingComplete] = useState(false);

    useEffect(() => {
        async function loadResourcesAndDataAsync() {
            await Font.loadAsync({
                ...Ionicons.font,
                'space-mono': require('./assets/fonts/SpaceMono-Regular.ttf')
            });
            setLoadingComplete(true);
        }
        loadResourcesAndDataAsync();
    }, []);

    if (!isLoadingComplete) {
        return null;
    } else {
        return (
            <PaperProvider theme={theme}>
                <SolidarityHeader/>
                <SolidarityBody/>
            </PaperProvider>
        );
    }
}