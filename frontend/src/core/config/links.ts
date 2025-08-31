import { HttpLink, from, ApolloLink } from '@apollo/client';
import { onError, type ErrorResponse } from '@apollo/client/link/error';
import { RetryLink } from '@apollo/client/link/retry';
import { ENV } from './env';

export const makeHttpLink = (): HttpLink =>
  new HttpLink({
    uri: ENV.GRAPHQL_URL,
    credentials: 'same-origin',
  });

export const makeErrorLink = (): ApolloLink =>
  onError((error: ErrorResponse) => {
    const { graphQLErrors, networkError, operation } = error;

    if (graphQLErrors?.length) {
      for (const err of graphQLErrors) {
        console.warn('[GraphQL error]', {
          op: operation.operationName,
          message: err.message,
          path: err.path,
          extensions: err.extensions,
        });
      }
    }

    if (networkError) {
      console.warn('[Network error]', networkError);
    }
  });

// Retry básico: 3 intentos con backoff exponencial suave
export const makeRetryLink = (): RetryLink =>
  new RetryLink({
    attempts: (count, _operation, error) => {
      const status = (error as any)?.statusCode ?? (error as any)?.status;
      // No reintentar en 4xx (cliente)
      if (status && status >= 400 && status < 500) return false;
      return count <= 3;
    },
    delay: (count) => Math.min(300 * 2 ** count, 2000),
  });

export const makeDefaultLink = (): ApolloLink =>
  from([makeErrorLink(), makeRetryLink(), makeHttpLink()]);
