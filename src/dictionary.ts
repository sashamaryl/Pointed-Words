import axios from "axios";

export default async function isValidWord(word: string) {
  const key = process.env.REACT_APP_WORDNIK;

  const queryURL = `https://api.wordnik.com/v4/word.json/${word}/definitions?limit=200&includeRelated=false&useCanonical=false&includeTags=false&api_key=${key}`;

  try {
    const { data } = await axios.get(queryURL);
    return data[0].word === word;
  } catch (error) {
    console.log("error", error);
    return false;
  }
}
