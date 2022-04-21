import axios, { AxiosError } from "axios";

export default async function isValidWord(word: string) {
    const key = process.env.REACT_APP_WORDNIK;

    const queryURL = `https://api.wordnik.com/v4/word.json/${word}/definitions?limit=1&includeRelated=false&useCanonical=false&includeTags=false&api_key=${key}`;

    try {
        const { data, status } = await axios.get(queryURL);
        console.log(status);
        return data[0].word === word;
    } catch (error: AxiosError | any) {
        if (axios.isAxiosError(error) && !error.message.includes("404")) {
            console.log("error", error.message);
        }
        return false;
    }
}
