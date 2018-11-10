import React from "react";
import { Query, Mutation } from "react-apollo";
import gql from "graphql-tag";
import CartStyles from "../components/styles/CartStyles";
import Supreme from "../components/styles/CartStyles";
import CloseButton from "../components/styles/CloseButton";
import SickButton from "../components/styles/SickButton";

export const LOCAL_STATE_QUERY = gql`
  query {
    cartOpen @client
  }
`;

export const TOGGLE_CART_MUTATION = gql`
  mutation {
    toggleCart @client
  }
`;
const Cart = () => {
  return (
    <Mutation mutation={TOGGLE_CART_MUTATION}>
      {toggleCart => {
        return (
          <Query query={LOCAL_STATE_QUERY}>
            {({ data, error, loading }) => {
              return (
                <CartStyles open={data.cartOpen}>
                  <header>
                    <CloseButton title="close" onClick={toggleCart}>
                      &times;
                    </CloseButton>
                    <Supreme>Your Cart</Supreme>
                    <p>You have __ Items in your cart.</p>
                  </header>
                  <footer>
                    <p>$10.10</p>
                    <SickButton>Checkout</SickButton>
                  </footer>
                </CartStyles>
              );
            }}
          </Query>
        );
      }}
    </Mutation>
  );
};

export default Cart;
