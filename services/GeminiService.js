import axios from 'axios';

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const promptPadraoImageFree = "This is a picture of a meal. Estimate the amount of kcal on picture and return the result in form of a json in that format: {k: x}, where x is a int for the amount of kcal."
const promptPadraoImagePremium = 'This is a picture of a meal. Estimate the amount of kcal and grams of proteins and return the result in form of a json in that EXACT format: {"k": x, "p": y, "m": z} without changes any symbol, where x is a int for the amount of kcal, y is a int for the amount of proteins and z is a boolean that says if the picture is a meal and was sucessful analyzed (true) or is not a picture of a meal (false).'

const promptDefined = process.env.EXPO_PUBLIC_IS_USER_PREMIUM === 'true' ? promptPadraoImagePremium : promptPadraoImageFree;

//For Image
const urlImageAPI = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`

//For Chat
const geminiprov1 = `/v1/models/gemini-pro:generateContent`;
const version = geminiprov1; //Select Version Here
const url = `https://generativelanguage.googleapis.com${version}`;

const GeminiService = {
    getImageResponse: async (image64Base) => {
        //console.log("getImageResponse iniciado...Base64: ", image64Base);
        try {
            const response = await axios.post(urlImageAPI, 
            {
                "contents":[
                    {
                        "role": "user",
                        "parts":[
                            {
                                "text": promptDefined
                            },
                            {
                                "inline_data": {
                                    "mime_type": "image/jpeg",
                                    "data": image64Base
                                },
                            }, 
                            
                        ]
                    }
                ]
            }, 
            {
                headers: {
                  'Content-Type': 'application/json',
                  'x-goog-api-key': `${GEMINI_API_KEY}`
                },
              })
            //console.log('Response:', response);
            return response;
        } catch (error) {
            console.error('Error fetching data from Gemini API:', error);
            console.error('Error:', error.response.data.error.message);
            throw error;
        }
    },

    getChatResponse: async (prompt) => {
        try {
            console.log('Prompt:', prompt);
            const response = await axios.post(url, 
            {
                "contents":[
                    {
                        "role": "user",
                        "parts":[
                            {
                                "text": prompt
                            }
                        ]
                    }
                ]
            }, 
            {
                headers: {
                  'Content-Type': 'application/json',
                  'x-goog-api-key': `${GEMINI_API_KEY}`
                },
              })
            console.log('Response:', response);
            return response;
            
        } catch (error) {
            console.error('Error fetching data from Gemini API:', error);
            throw error;
        }
    }
};

export default GeminiService;