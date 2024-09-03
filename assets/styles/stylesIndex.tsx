import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  containerScreen: {
    backgroundColor: "black",
    flexDirection: "column",
    flex: 1,
  },
  containerTitle: {
    flexDirection: "row",
  },
  containerChat: {
    flexDirection: "column",
    flex: 1,
    padding: 24,
    marginVertical: 12,
  },
  containerFooter: {
    justifyContent: "space-around",
    flexDirection: "row",
    marginBottom: 12,
  },

  textButton: {
    color: "#FFF",
    fontSize: 32,
  },

  buttonFooter: {
    color: "gray",
    borderColor: "#FFF",
  },
});

export default styles;
