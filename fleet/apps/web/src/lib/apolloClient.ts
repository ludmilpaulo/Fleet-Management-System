import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { API_CONFIG } from '@/config/api';
import type { RootState } from '@/store';
import { store } from '@/store';

const httpLink = createHttpLink({
  uri: API_CONFIG.BASE_URL.replace(/\/api\/?$/, '') + '/graphql/',
});

const authLink = setContext((_, { headers }) => {
  // Reuse the Redux auth token used by REST calls
  const state = store.getState() as RootState;
  const token = (state as any)?.auth?.token as string | undefined;

  return {
    headers: {
      ...headers,
      ...(token ? { Authorization: `Token ${token}` } : {}),
    },
  };
});

export const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});


