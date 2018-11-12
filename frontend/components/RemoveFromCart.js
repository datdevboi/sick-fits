import React from "react";
import { Mutation } from "react-apollo";
import styled from "styled-components";
import PropTypes from "prop-types";
import gql from "graphql-tag";
import { CURRENT_USER_QUERY } from "./User";

const BigButton = styled.button`
  font-size: 3rem;
  background: none;
  border: 0;
  &:hover {
    color: ${props => props.theme.red};
    cursor: pointer;
  }
`;

const REMOVE_FROM_CART_MUTATION = gql`
  mutation REMOVE_FROM_CART_MUTATION($id: ID!) {
    removeFromCart(id: $id) {
      id
    }
  }
`;

class RemoveFromCart extends React.Component {
  static propTypes = {
    id: PropTypes.string.isRequired
  };

  update = (cache, payload) => {
    const data = cache.readQuery({ query: CURRENT_USER_QUERY });
    const cartItemId = payload.data.removeFromCart.id;
    data.me.cart = data.me.cart.filter(item => item.id !== cartItemId);
    cache.writeQuery({
      query: CURRENT_USER_QUERY,
      data
    });
  };
  render() {
    return (
      <Mutation
        mutation={REMOVE_FROM_CART_MUTATION}
        variables={{ id: this.props.id }}
        update={this.update}
        optimisticResponse={{
          __typename: "Mutation",
          removeFromCart: {
            __typename: "CartItem",
            id: this.props.id
          }
        }}
        // refetchQueries={[{ query: CURRENT_USER_QUERY }]}
      >
        {(removeFromCart, { loading, error }) => {
          return (
            <BigButton
              title="Delete Item"
              onClick={() => {
                removeFromCart().catch(e => {
                  alert(e.message);
                });
              }}
              disabled={loading}
            >
              &times;
            </BigButton>
          );
        }}
      </Mutation>
    );
  }
}

export default RemoveFromCart;
