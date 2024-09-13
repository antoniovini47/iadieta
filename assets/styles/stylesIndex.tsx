import { StyleSheet } from "react-native";

const standardPadding = 24;
const standardFontSize = 32;

const styles = StyleSheet.create({
  containerScreen: {
    backgroundColor: "black",
    flexDirection: "column-reverse",
    flex: 1,
  },
  containerTitle: {
    flexDirection: "row",
  },
  containerChat: {
    flexDirection: "column",
    flex: 1,
    padding: standardPadding,
    marginVertical: 12,
  },
  containerFooter: {
    justifyContent: "space-around",
    flexDirection: "row",
    marginBottom: 12,
    marginTop: 12,
  },

  containerLoading: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: standardPadding * 2,
    justifyContent: "flex-start",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },

  textButton: {
    color: "#FFF",
    fontSize: standardFontSize,
  },

  buttonFooter: {
    color: "gray",
    borderColor: "#FFF",
  },
});

export default styles;
