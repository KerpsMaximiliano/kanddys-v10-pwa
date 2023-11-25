import { NgModule } from '@angular/core';
import { Apollo, ApolloModule } from 'apollo-angular';
import { HttpLink, HttpLinkModule } from 'apollo-angular-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { ApolloLink } from 'apollo-link';
import { setContext } from 'apollo-link-context';
import { onError } from 'apollo-link-error';
import { environment } from 'src/environments/environment';

const uri = `${environment.api.url}/graphql`;
@NgModule({
  exports: [ApolloModule, HttpLinkModule],
  providers: [],
})
export class GraphQLModule {
  constructor(private httpLink: HttpLink, private apollo: Apollo) {
    this.createApollo();
  }

  async createApollo() {
    let ip = await fetch('https://api.ipify.org/?format=json')
    .then((res) => {
      return res.json()
    });

    const httpHandler = this.httpLink.create({ uri });

    const ctx = setContext((operation, context) => ({
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${localStorage.getItem('session-token')}`,
        'App-Key': environment.api.key,
        'x-forwarded-for': ip?.ip,
      },
    }));

    const errorHandler = onError(({ graphQLErrors, networkError }) => {
      let message = 'Error';
      if (graphQLErrors) message = graphQLErrors[0].message;
      if (networkError) message = 'Request error';
    });

    this.apollo.createDefault({
      cache: new InMemoryCache({
        addTypename: false
      }),
      link: ApolloLink.from([ctx, errorHandler, httpHandler]),
    });
  }
}