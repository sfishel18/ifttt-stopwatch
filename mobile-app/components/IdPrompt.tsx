import { Button, Text, View, TextInput, StyleSheet } from "react-native";
import React, { useState } from "react";

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        fontSize: 20,
        marginBottom: 10,
    },
    textInput: {
        height: 30,
        width: 200,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 10,
    }
});

type Props = {
    onSubmit: (id: string) => void,
};

const IdPrompt: React.FC<Props> = props => { 
    const [id, setId] = useState('');
    return (
        <View style={styles.container}>
            <Text style={styles.text}>Enter a stopwatch ID:</Text>
            <TextInput style={styles.textInput} value={id} onChangeText={setId} autoCapitalize="none" />
            <Button title="Submit" onPress={() => props.onSubmit(id)} disabled={!id} />
        </View>
    )
};

export default IdPrompt;
