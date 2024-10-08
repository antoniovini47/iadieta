import { useEffect, useRef } from "react";
import {
  Pressable,
  SafeAreaView,
  View,
  ScrollView,
  ImageBackground,
  ActivityIndicator,
} from "react-native";
import ChatMessage, { ChatMessageProps } from "../components/ChatMessage";
import GeminiService from "../services/GeminiService";
import styles from "../assets/styles/stylesIndex";
import { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import showToast from "../hooks/useToast";
import Ionicons from "@expo/vector-icons/Ionicons";
//import AdBanner from "../components/AdBanner";
import humanizedValue from "../constants/humanizedValue";
import { randomSendedMessages } from "../constants/texts";
import TokensButton from "../components/TokensButton";
import { TestIds, InterstitialAd, AdEventType } from "react-native-google-mobile-ads";
import { saveMessages, loadMessages } from "@/services/MessagesStorage";
import initialMessages from "@/assets/messages";

// const adInteristitialUnitID: string = __DEV__
//   ? TestIds.INTERSTITIAL
//   : process.env.EXPO_PUBLIC_INTERSTITIAL_AD_UNIT_ID;

// const interstitial = InterstitialAd.createForAdRequest(adInteristitialUnitID, {
//   keywords: ["saúde", "alimentação", "calorias", "fitness"], // Update based on the most relevant keywords for your app/users, these are just random examples
//   requestNonPersonalizedAdsOnly: true, // Update based on the initial tracking settings from initialization earlier
// });

// DEBUG ONLY
function waitNSecs(secs: number) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(void 0);
    }, secs * 1000);
  });
}

export default function HomeScreen() {
  // Interstitial Ad functions and loading
  // const [isInterstitialAdLoaded, setisInterstitialAdLoaded] = useState<boolean>(false);
  // useEffect(() => {
  //   const unsubscribeLoaded = interstitial.addAdEventListener(AdEventType.LOADED, () => {
  //     setisInterstitialAdLoaded(true);
  //   });
  //   const unsubscribeClosed = interstitial.addAdEventListener(AdEventType.CLOSED, () => {
  //     setisInterstitialAdLoaded(false);
  //     interstitial.load();
  //   });
  //   interstitial.load();
  //   return () => {
  //     unsubscribeLoaded();
  //     unsubscribeClosed();
  //   };
  // }, []);

  //Other Functions
  //const [tokens, setTokens] = useState(0); // TODO: Implement tokens system
  //Controls the messages on the chat and the messages to show and load more
  const [messages, setMessages] = useState<ChatMessageProps[]>(initialMessages);
  const [mediaPermission, requestPermission] = ImagePicker.useCameraPermissions();
  const [changingMessagesOnChatMode, setChangingMessagesOnChatMode] = useState<
    "loadingMoreMessages" | "addingNewMessages"
  >("addingNewMessages");
  const scrollViewChatRef = useRef<ScrollView>(null);
  const [previousContentChatHeight, setPreviousContentHeight] = useState(0);
  const [isLoadingMoreMessages, setIsLoadingMoreMessages] = useState(false);

  // Controls messages loading to avoid performance issues
  const messagesToShowAndLoadMoreFactor = __DEV__ ? 5 : 20;
  const [visibleMessagesCount, setVisibleMessagesCount] = useState(messagesToShowAndLoadMoreFactor);
  const loadMoreMessages = () => {
    setIsLoadingMoreMessages(true);
    setChangingMessagesOnChatMode("loadingMoreMessages");
    setVisibleMessagesCount((prevCount) => prevCount + messagesToShowAndLoadMoreFactor);
  };
  const handleChatScrollToLoadMoreMessages = (event: any) => {
    if (event.nativeEvent.contentOffset.y === 0) {
      loadMoreMessages();
    }
  };
  const visibleMessages = messages.slice(-visibleMessagesCount);

  // load messages from storage on startup
  useEffect(() => {
    const fetchMessages = async () => {
      const savedMessages = await loadMessages();
      if (savedMessages.length > 0) {
        setMessages(savedMessages);
      }
      scrollViewChatRef.current?.scrollToEnd({ animated: true });
    };
    fetchMessages();
  }, []);

  // save messages to storage on change
  useEffect(() => {
    saveMessages(messages);
  }, [messages]);

  // Function to handle the new request for the Backend AI
  async function handleNewRequestForAI(imageBase64: string) {
    await waitNSecs(1);
    const messageAiResponse = createNewMessage("fromAI", "Analisando imagem...", "");
    setMessages((previousMessages) => [...previousMessages, messageAiResponse]);

    // Show the interstitial ad if it's loaded and the app is in production mode
    // if (isInterstitialAdLoaded && process.env.EXPO_PUBLIC_PRODUCTION_MODE && !__DEV__) {
    //   interstitial.show();
    // }

    // Call the backend AI to analyze the image
    try {
      const result = __DEV__
        ? '{"k": 1000, "p": 100, "m": true}'
        : await GeminiService.getImageResponse(imageBase64);
      __DEV__
        ? console.log("Valores de demonstração: ", result)
        : console.log("result from Gemini: ", result.data.candidates[0].content.parts[0].text);
      const jsonReponse = JSON.parse(
        __DEV__ ? result : result.data.candidates[0].content.parts[0].text
      );
      const valueOfKcal: number = humanizedValue(jsonReponse["k"]);
      const valueOfProteins: number = humanizedValue(jsonReponse["p"]);
      const isFood: boolean = jsonReponse["m"];
      messageAiResponse.kcal = valueOfKcal;
      messageAiResponse.protein = valueOfProteins;

      // Check the amount of calories ingested today
      let totalKcalToday: number = valueOfKcal;
      let totalProteinsToday: number = valueOfProteins;
      try {
        // Runs through the messages to check the amount of calories and proteins ingested today
        for (let counter = messages.length - 1; counter >= 0; counter--) {
          const currentMessageDate: Date | null = messages[counter]
            ? new Date(messages[counter]?.createdAt?.toString())
            : null;
          if (currentMessageDate?.getDate() != messageAiResponse.createdAt?.getDate()) {
            console.warn(
              "Messages readed until '" +
                messages[counter].text +
                "' at " +
                messages[counter].createdAt
            );
            break;
          }
          if (
            messages[counter].type === "fromAI" &&
            messages[counter].kcal &&
            messages[counter].protein
          ) {
            totalKcalToday += messages[counter].kcal;
            totalProteinsToday += messages[counter].protein;
          }
        }
      } catch (error) {
        console.error("Error ao verificar a quantidade de comida ingerida hoje: ", error);
      }

      // Create the message to show the result of the AI, starts with the text "Imagem analisada com sucesso!"
      let textToShow: string = "";

      // Check if the image is a food, and show the result of the AI
      if (isFood) {
        textToShow =
          "Imagem analisada com sucesso!\nResultado: \n" +
          valueOfKcal +
          " kcal 🔥\n" +
          valueOfProteins +
          " g de proteína 💪\n\nℹ️ Hoje você já ingeriu " +
          totalKcalToday +
          " kcal e " +
          totalProteinsToday +
          " g de proteína.";
      } else {
        textToShow = "Por favor, envie foto de um prato de comida!";
      }

      // Update the message to show the result of the AI analysis
      messageAiResponse.text = textToShow;
    } catch (error: any) {
      messageAiResponse.text = "Erro ao analisar a imagem..." + error.message;
      // TODO: Insert button to retry
    } finally {
      setMessages((previousMessages) => [...previousMessages]);
    }
  }

  // Function to create a new message for the chat
  function createNewMessage(type: string, text: string, imageUri?: string) {
    setChangingMessagesOnChatMode("addingNewMessages");
    const newMessage: ChatMessageProps = {
      type: type,
      text: text,
      createdAt: new Date(),
      imageUri: imageUri,
    };
    return newMessage;
  }

  // Function to create a new message from the user
  function handleCreateNewUserInput(imageAsset: ImagePicker.ImagePickerAsset) {
    // Create a new message from the user, with a random message from the list, and the image uri
    const newMessage = createNewMessage(
      "fromMe",
      randomSendedMessages[Math.floor(Math.random() * randomSendedMessages.length)],
      imageAsset.uri
    );

    // Check if the last message was sent on another day, if true, add a new "fromSystem" message to show today's date
    try {
      const lastMessageDate: Date | null = messages[messages.length - 1]
        ? new Date(messages[messages.length - 1]?.createdAt?.toString())
        : null;

      if (lastMessageDate?.getDate() != newMessage?.createdAt?.getDate()) {
        const today = new Date();
        setMessages((prevState) => [
          ...prevState,
          createNewMessage(
            "fromSystem",
            `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`,
            today.toDateString()
          ),
        ]);
      }
    } catch (error) {
      console.error("Error ao verificar a data da última mensagem: ", error);
    }

    // Add the new message to the list of messages
    setMessages((prevState) => [...prevState, newMessage]);
    if (imageAsset.base64) {
      handleNewRequestForAI(imageAsset.base64);
    }
  }

  // Function to handle the user choose an image from the files
  const handleChooseImageFromFiles = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
        base64: true,
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: false,
      });

      if (result.canceled) {
        showToast("Selecione uma imagem para continuar");
        return;
      }

      if (result.assets[0] && result.assets[0].base64) {
        handleCreateNewUserInput(result.assets[0]);
      } else {
        showToast("Imagem invalida!");
      }
    } catch (error) {
      showToast("Error ao selecionar a imagem.\n" + error);
      console.error("Error ao selecionar a imagem.\n" + error);
    }
  };

  // Function to handle the user take a picture of the meal
  const handleTakePicture = async () => {
    if (mediaPermission?.granted === false) {
      requestPermission();
      return;
    }

    try {
      let result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
        base64: true,
        cameraType: ImagePicker.CameraType.back,
        allowsMultipleSelection: false,
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
      });

      if (result.canceled) {
        showToast("Selecione uma imagem para continuar");
        return;
      }

      if (result.assets[0] && result.assets[0].base64) {
        handleCreateNewUserInput(result.assets[0]);
      } else {
        showToast("Imagem invalida!");
      }
    } catch (error) {
      showToast("Error ao tirar a foto.\n" + error);
    }
  };

  // Function to handle the user click on the tokens button
  // function handleTokensButton() {
  //   showToast("handleTokensButton called...");
  //   setTokens((prevTokens) => prevTokens + 1);
  // }

  return (
    <SafeAreaView style={styles.containerScreen}>
      <View style={styles.containerFooter}>
        {/* <Pressable
          onPress={() => {
            showToast("Configurações ainda em desenvolvimento...");
          }}
          style={styles.buttonFooter}>
          <Ionicons name="settings" size={36} style={{ color: "#999" }} />
        </Pressable> */}

        <Pressable onPress={handleTakePicture} style={styles.buttonFooter}>
          <Ionicons name="camera" size={36} style={{ color: "#FFF" }} />
        </Pressable>

        <Pressable onPress={handleChooseImageFromFiles} style={styles.buttonFooter}>
          <Ionicons name="apps-sharp" size={36} style={{ color: "#FFF" }} />
        </Pressable>

        {/* <Pressable
          onPress={() => showToast("Estatísticas ainda em desenvolvimento...")}
          style={styles.buttonFooter}>
          <Ionicons name="bar-chart" size={36} style={{ color: "#999" }} />
        </Pressable> */}
        {/* <TokensButton handleClick={handleTokensButton} tokens={tokens} /> */}
      </View>
      <ImageBackground source={require("../assets/images/chatBackground.png")} style={{ flex: 1 }}>
        <ScrollView
          style={styles.containerChat}
          showsVerticalScrollIndicator={true}
          onScroll={handleChatScrollToLoadMoreMessages}
          scrollEventThrottle={16}
          ref={scrollViewChatRef}
          onContentSizeChange={(contentChatWidth, contentChatHeight) => {
            if (changingMessagesOnChatMode === "addingNewMessages") {
              scrollViewChatRef.current?.scrollToEnd({ animated: true });
            }
            if (changingMessagesOnChatMode === "loadingMoreMessages") {
              const newChatMessagesHeight = contentChatHeight - previousContentChatHeight;
              scrollViewChatRef.current?.scrollTo({
                y: newChatMessagesHeight,
                animated: false,
              });
            }
            // Update previousContentHeight after handling scroll
            setPreviousContentHeight(contentChatHeight);
            waitNSecs(0.5).then(() => {
              setIsLoadingMoreMessages(false);
            });
          }}>
          {visibleMessages.map((msg: ChatMessageProps, index: number) => {
            const { type, text, createdAt, imageUri } = msg;
            return (
              <ChatMessage
                key={index}
                type={type}
                text={text}
                createdAt={createdAt}
                imageUri={imageUri}
              />
            );
          })}
        </ScrollView>
        {isLoadingMoreMessages && (
          <Pressable
            onPress={() => setIsLoadingMoreMessages(false)}
            style={styles.containerLoading}>
            <ActivityIndicator size="large" color="#0000ff" />
          </Pressable>
        )}
      </ImageBackground>
      {/* {process.env.EXPO_PUBLIC_PRODUCTION_MODE && !__DEV__ && <AdBanner />} */}
    </SafeAreaView>
  );
}
