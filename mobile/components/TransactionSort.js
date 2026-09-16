import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

const sortOptions = [
  { label: "Newest", value: "newest" },
  { label: "Oldest", value: "oldest" },
  { label: "Highest", value: "highest" },
  { label: "Lowest", value: "lowest" },
];

export default function TransactionSort({ selectedSort, setSelectedSort }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sort By</Text>

      <View style={styles.options}>
        {sortOptions.map((option) => {
          const isSelected = selectedSort === option.value;

          return (
            <Pressable
              key={option.value}
              style={[styles.option, isSelected && styles.selectedOption]}
              onPress={() => setSelectedSort(option.value)}
            >
              <Text
                style={[
                  styles.optionText,
                  isSelected && styles.selectedOptionText,
                ]}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 15,
  },

  title: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 10,
  },

  options: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  option: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  selectedOption: {
    backgroundColor: "#000000",
    borderColor: "#000000",
  },

  optionText: {
    fontSize: 13,
    color: "#475569",
    fontWeight: "600",
  },

  selectedOptionText: {
    color: "#FFFFFF",
  },
});
