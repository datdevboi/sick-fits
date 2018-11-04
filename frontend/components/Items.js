import React, { Component } from "react";
import { Query } from "react-apollo";
import gql from "graphql-tag";

const ALL_ITEMS_QUERY = gql`
  query ALL_ITEMS_QUERY {
    items {
      id
      title
      description
      price
      image
      largeImage
    }
  }
`;
export default class Items extends Component {
  render() {
    return (
      <div>
        <Query query={ALL_ITEMS_QUERY}>
          {({ loading, error, data }) => {
            if (loading) {
              return <p>Loading..</p>;
            }
            return <p>Im the childof query</p>;
          }}
        </Query>
        <p>Items</p>
      </div>
    );
  }
}
