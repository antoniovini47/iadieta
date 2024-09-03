import { StyleSheet } from "react-native";
import colors from "@/assets/styles/colors";

const shadowEffect = {
  shadowColor: colors.blackIsh,
  shadowOffset: {
    width: 4,
    height: 4,
  },
  shadowOpacity: 0.4,
  shadowRadius: 2,
  elevation: 10,
};

const stylesChatMessage = StyleSheet.create({
  containerDate: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },

  messageSended: {
    width: "70%",
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 8,
    flexDirection: "column",
    alignSelf: "flex-end",
    alignItems: "center",
    backgroundColor: colors.greenSecondary,
    ...shadowEffect,
    marginBottom: 24,
  },
  messageReceived: {
    width: "70%",
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 8,
    alignSelf: "flex-start",
    backgroundColor: colors.whiteIsh,
    ...shadowEffect,
    marginBottom: 24,
  },
  messageSystem: {
    width: "auto",
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 8,
    alignSelf: "center",
    alignItems: "center",
    backgroundColor: colors.grayIsh,
    ...shadowEffect,
    marginBottom: 24,
  },

  textMessage: {
    fontSize: 24,
  },
  textCreatedAt: {
    fontSize: 18,
    color: "gray",
  },

  image: {
    width: 200,
    height: 200,
    marginVertical: 12,
    borderRadius: 12,
    borderColor: "black",
  },
});

export default stylesChatMessage;
