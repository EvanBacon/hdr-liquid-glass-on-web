import React from "react";
import { Text, View } from "react-native";

import { Image, Link } from "@/tw";
import { Glass } from "@/components/glass";

export default function Page() {
  return (
    <View
      style={{ backgroundColor: "rgba(242.25, 242.25, 247.35, 1)" }}
      className="flex-1"
    >
      <View className="py-12 md:py-24 lg:py-32 xl:py-48">
        <View className="select-none px-4 md:px-6">
          <View className="flex flex-col items-center gap-4 text-center">
            <Glass
              isInteractive
              className="flex  gap-1 mb-12 p-3 rounded-full outline-sf-border"
            >
              <Image
                source="https://simpleicons.org/icons/expo.svg"
                className="w-6 h-6 object-contain select-none pointer-events-none"
              />
            </Glass>
            <Text
              role="heading"
              className=" text-3xl text-center native:text-5xl font-bold sm:text-4xl md:text-5xl lg:text-6xl font-rounded"
            >
              Expo Router Tailwind
            </Text>
            <Text className="hdr-thing mx-auto max-w-[700px] text-lg text-center text-gray-500 md:text-xl dark:text-gray-400">
              Discover and collaborate on acme. Explore our services now.
            </Text>

            <Glass
              isInteractive
              style={
                {
                  // backgroundColor: "rgba(61.2, 61.2, 66, 0.6)",
                }
              }
              className="flex bg-sf-blue gap-1 px-6 py-1 mb-6 rounded-full outline-sf-border"
            >
              <Text
                role="heading"
                className="select-none text-xl text-white text-center"
              >
                Explore
              </Text>
            </Glass>
          </View>
        </View>
      </View>
    </View>
  );
}
