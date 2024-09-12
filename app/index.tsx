import { useEffect } from "react";
import { Pressable, SafeAreaView, View, ScrollView, ImageBackground } from "react-native";
import ChatMessage, { ChatMessageProps } from "../components/ChatMessage";
import GeminiService from "../services/GeminiService";
import styles from "../assets/styles/stylesIndex";
import { useState } from "react";
import initialMessages from "../assets/messages";
import * as ImagePicker from "expo-image-picker";
import showToast from "../hooks/useToast";
import Ionicons from "@expo/vector-icons/Ionicons";
import AdBanner from "../components/AdBanner";
import humanizedValue from "../constants/humanizedValue";
import { randomSendedMessages } from "../constants/texts";
import TokensButton from "../components/TokensButton";
import { TestIds, InterstitialAd, AdEventType } from "react-native-google-mobile-ads";

const adInteristitialUnitID: string = __DEV__
  ? TestIds.INTERSTITIAL
  : process.env.EXPO_PUBLIC_INTERSTITIAL_AD_UNIT_ID;

const interstitial = InterstitialAd.createForAdRequest(adInteristitialUnitID, {
  keywords: ["saúde", "alimentação", "calorias", "fitness"], // Update based on the most relevant keywords for your app/users, these are just random examples
  requestNonPersonalizedAdsOnly: true, // Update based on the initial tracking settings from initialization earlier
});

function waitNSecs(secs: number) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(void 0);
    }, secs * 1000);
  });
}

export default function HomeScreen() {
  // Interstitial Ad functions
  const [isInterstitialAdLoaded, setisInterstitialAdLoaded] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribeLoaded = interstitial.addAdEventListener(AdEventType.LOADED, () => {
      setisInterstitialAdLoaded(true);
    });
    const unsubscribeClosed = interstitial.addAdEventListener(AdEventType.CLOSED, () => {
      setisInterstitialAdLoaded(false);
      interstitial.load();
    });
    interstitial.load();
    return () => {
      unsubscribeLoaded();
      unsubscribeClosed();
    };
  }, []);

  //Other Functions
  const [tokens, setTokens] = useState(0);
  const [messages, setMessages] = useState<ChatMessageProps[]>(initialMessages);
  const [mediaPermission, requestPermission] = ImagePicker.useCameraPermissions();

  async function handleNewRequestForAI(imageBase64: string) {
    await waitNSecs(1);
    const messageAiResponse = createNewMessage("fromAI", "Analisando imagem...", "");
    setMessages((previousMessages) => [...previousMessages, messageAiResponse]);

    if (isInterstitialAdLoaded && !__DEV__) {
      interstitial.show();
    }

    try {
      const result = __DEV__
        ? '{"k": 1000, "p": 100, "m": true}'
        : await GeminiService.getImageResponse(imageBase64); //Funcionando, mas desabilitado pra economizar tokens
      __DEV__
        ? console.log("Valores de demonstração: ", result)
        : console.log("result from Gemini: ", result.data.candidates[0].content.parts[0].text);
      const jsonReponse = JSON.parse(
        __DEV__ ? result : result.data.candidates[0].content.parts[0].text
      );
      const valueOfKcal = jsonReponse["k"];
      const valueOfProteins = jsonReponse["p"];
      const isFood: boolean = jsonReponse["m"];

      let textToShow: string = "";

      if (isFood) {
        textToShow =
          "Imagem analisada com sucesso!\nResultado: \n" +
          humanizedValue(valueOfKcal) +
          " kcal 🔥\n" +
          humanizedValue(valueOfProteins) +
          " g de proteína 💪";
      } else {
        textToShow = "Por favor, envie foto de um prato de comida!";
      }

      messageAiResponse.text = textToShow;
    } catch (error: any) {
      messageAiResponse.text = "Erro ao analisar a imagem..." + error.message;
      // TODO: Insert button to retry
    } finally {
      setMessages((previousMessages) => [...previousMessages]);
    }
  }

  function createNewMessage(type: string, text: string, imageUri?: string) {
    const newMessage: ChatMessageProps = {
      type: type,
      text: text,
      createdAt: new Date(),
      imageUri: imageUri,
    };
    return newMessage;
  }

  function handleCreateNewUserInput(imageAsset: ImagePicker.ImagePickerAsset) {
    const newMessage = createNewMessage(
      "fromMe",
      randomSendedMessages[Math.floor(Math.random() * randomSendedMessages.length)],
      imageAsset.uri
    );

    setMessages((prevState) => [...prevState, newMessage]);
    if (imageAsset.base64) {
      handleNewRequestForAI(imageAsset.base64);
    }
  }

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
    }
  };

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

  function handleTokensButton() {
    showToast("handleTokensButton called...");
    setTokens((prevTokens) => prevTokens + 1);
  }

  return (
    <SafeAreaView style={styles.containerScreen}>
      <AdBanner />
      <ImageBackground source={require("../assets/images/chatBackground.png")} style={{ flex: 1 }}>
        <ScrollView
          style={styles.containerChat}
          showsVerticalScrollIndicator={true}
          ref={(ref) => {
            this.scrollView = ref;
          }}
          onContentSizeChange={() => this.scrollView.scrollToEnd({ animated: true })}>
          {messages.map((msg: ChatMessageProps, index: number) => {
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
      </ImageBackground>
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
    </SafeAreaView>
  );
}
