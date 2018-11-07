import React from "react";
import gql from "graphql-tag";
import { Query } from "react-apollo";
import Head from "next/head";
import PaginationStyles from "./styles/PaginationStyles";
import Error from "./ErrorMessage";
import Link from "next/link";
import { perPage } from "../config";

const PAGINATION_QUERY = gql`
  query PAGINATION_QUERY {
    itemsConnection {
      aggregate {
        count
      }
    }
  }
`;

const Pagination = props => (
  <Query query={PAGINATION_QUERY}>
    {({ data, loading, error }) => {
      if (loading) return <div>Loading...</div>;
      if (error) return <Error error={error} />;

      const count = data.itemsConnection.aggregate.count;
      const pages = Math.ceil(count / perPage);
      return (
        <PaginationStyles>
          <Head>
            <title>
              Sick fits {props.page} of {pages}
            </title>
          </Head>
          {props.page === 1 ? null : (
            <Link
              prefetch
              href={{
                pathname: "items",
                query: { page: props.page - 1 }
              }}
            >
              <a>◀️ Prev</a>
            </Link>
          )}

          <p>
            Page {props.page} of {pages}
          </p>
          {props.page + 1 > pages ? null : (
            <Link
              prefetch
              href={{
                pathname: "items",
                query: { page: props.page + 1 }
              }}
            >
              <a>Next ▶️</a>
            </Link>
          )}
        </PaginationStyles>
      );
    }}
  </Query>
);

export default Pagination;
