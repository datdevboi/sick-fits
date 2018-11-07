import React, { Component } from "react";
import { Query } from "react-apollo";
import gql from "graphql-tag";
import styled from "styled-components";
import Error from "./ErrorMessage";
import Head from "next/head";

const SingleItemStyles = styled.div`
  max-width: 1200px;
  margin: 2rem auto;
  box-shadow: ${props => props.theme.bs};
  display: grid;
  grid-auto-columns: 1fr;
  grid-auto-flow: column;
  min-height: 800px;
`;

export const SINGLE_ITEM_QUERY = gql`
  query SINGLE_ITEM_QUERY($id: ID!) {
    item(where: { id: $id }) {
      id
      description
      title
      price
      largeImage
    }
  }
`;
export default class SingleItem extends Component {
  render() {
    return (
      <Query query={SINGLE_ITEM_QUERY} variables={{ id: this.props.id }}>
        {({ error, loading, data }) => {
          if (loading) return <div>Loading...</div>;
          if (error) return <Error error={error} />;
          if (!data.item) return <p>No item found</p>;

          return (
            <SingleItemStyles>
              <Head>
                <title>Sick fits | {data.item.title}</title>
              </Head>
              <img src={data.item.largeImage} alt={data.item.title} />
            </SingleItemStyles>
          );
        }}
      </Query>
    );
  }
}
