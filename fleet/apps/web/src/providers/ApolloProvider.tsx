"use client";

import { ReactNode } from "react";
import { ApolloProvider } from "@apollo/client/react";
import { apolloClient } from "@/lib/apolloClient";

type Props = {
  children: ReactNode;
};

export function ApolloProviderWrapper({ children }: Props) {
  return <ApolloProvider client={apolloClient}>{children}</ApolloProvider>;
}


