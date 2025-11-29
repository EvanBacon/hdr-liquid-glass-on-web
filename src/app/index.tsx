import React from "react";
import { Text, View } from "react-native";

import { Image, Link } from "@/tw";
import { Glass } from "@/components/glass";

export default function Page() {
  return (
    <View className="flex-1 bg-[rgba(242.25, 242.25, 247.35, 1)]">
      <View className="py-12 md:py-24 lg:py-32 xl:py-48">
        <View className="select-none px-4 md:px-6">
          <View className="flex flex-col items-center gap-4 text-center">
            <Glass
              isInteractive
              className="flex bg-amber-200 gap-1 p-1.5 mb-12 rounded-full outline-sf-border"
            >
              <Text
                role="heading"
                className="select-none text-3xl text-center native:text-5xl font-bold sm:text-4xl md:text-5xl lg:text-6xl font-rounded"
              >
                Welcome to Project ACME
              </Text>
            </Glass>

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
              Welcome to Project ACME
            </Text>
            <Text className="hdr-thing mx-auto max-w-[700px] text-lg text-center text-gray-500 md:text-xl dark:text-gray-400">
              Discover and collaborate on acme. Explore our services now.
            </Text>

            <View className="gap-4">
              <Link
                suppressHighlighting
                className="flex h-9 items-center justify-center overflow-hidden rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-gray-50 web:shadow ios:shadow transition-colors hover:bg-gray-900/90 active:bg-gray-400/90 web:focus-visible:outline-none web:focus-visible:ring-1 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50 dark:bg-gray-50 dark:text-gray-900 dark:hover:bg-gray-50/90 dark:focus-visible:ring-gray-300"
                href="/"
              >
                Explore
              </Link>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}
