import React from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  Pressable,
  ScrollView,
} from "react-native";
import { categories } from "../utils/categoryUtils";

export default function TransactionFilter({
  searchText,
  setSearchText,
  selectedCategory,
  setSelectedCategory,
}) {
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search expenses..."
        value={searchText}
        onChangeText={setSearchText}
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryContainer}
      >
        <Pressable
          style={[
            styles.categoryButton,
            selectedCategory === "All" && styles.selectedCategory,
          ]}
          onPress={() => {
            setSearchText("");
            setSelectedCategory("All");
          }}
        >
          <Text
            style={[
              styles.categoryText,
              selectedCategory === "All" && styles.selectedCategoryText,
            ]}
          >
            All
          </Text>
        </Pressable>

        {categories.map((category) => (
          <Pressable
            key={category.name}
            style={[
              styles.categoryButton,
              selectedCategory === category.name && styles.selectedCategory,
            ]}
            onPress={() => {
              setSearchText("");
              setSelectedCategory(category.name);
            }}
          >
            <Text
              style={[
                styles.categoryText,
                selectedCategory === category.name &&
                  styles.selectedCategoryText,
              ]}
            >
              {category.icon} {category.name}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
  },

  searchInput: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  categoryContainer: {
    paddingVertical: 12,
    gap: 8,
  },

  categoryButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },

  selectedCategory: {
    backgroundColor: "#000000",
    borderColor: "#000000",
  },

  categoryText: {
    fontSize: 14,
    fontWeight: "600",
  },

  selectedCategoryText: {
    color: "#FFFFFF",
  },
});
