import React from "react";
import { Query, Mutation } from "react-apollo";
import gql from "graphql-tag";
import User from "./User";
import CartStyles from "../components/styles/CartStyles";
import Supreme from "../components/styles/CartStyles";
import CloseButton from "../components/styles/CloseButton";
import SickButton from "../components/styles/SickButton";
import CartItem from "./CartItem";
import calcTotalPrice from "../lib/calcTotalPrice";
import formatMoney from "../lib/formatMoney";
import TakeMyMoney from "./TakeMyMoney";

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
    <User>
      {({ data: { me } }) => {
        if (!me) return null;

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
                          <Supreme>
                            {me.name}
                            's Cart
                          </Supreme>
                          <p>
                            You have {me.cart.length} Item
                            {me.cart.length === 1 ? "" : "s"} in your cart.
                          </p>
                        </header>
                        <ul>
                          {me.cart.map(cartItem => {
                            return <CartItem cartItem={cartItem} />;
                          })}
                        </ul>
                        <footer>
                          <p>{formatMoney(calcTotalPrice(me.cart))}</p>
                          <TakeMyMoney>
                            <SickButton>Checkout</SickButton>
                          </TakeMyMoney>
                        </footer>
                      </CartStyles>
                    );
                  }}
                </Query>
              );
            }}
          </Mutation>
        );
      }}
    </User>
  );
};

export default Cart;
