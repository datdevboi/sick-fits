import React, { Component } from "react";
import { Mutation } from "react-apollo";
import gql from "graphql-tag";
import Form from "./styles/Form";
import Error from "./ErrorMessage";

const SIGNIN_MUTATION = gql`
  mutation SIGNIN_MUTATION($password: String!, $email: String!) {
    signin(password: $password, email: $email) {
      id
      name
      email
    }
  }
`;

export default class Signin extends Component {
  state = {
    email: "",
    password: ""
  };

  saveToState = e => {
    const { name, value } = e.target;

    this.setState({
      [name]: value
    });
  };
  render() {
    return (
      <Mutation mutation={SIGNIN_MUTATION} variables={this.state}>
        {(signin, { error, loading }) => {
          return (
            <Form
              method="post"
              onSubmit={e => {
                e.preventDefault();
                signup();
              }}
            >
              <fieldset disabled={loading} aria-busy={loading}>
                <h2>Sign In to your account </h2>
                <Error error={error} />
                <label htmlFor="email">
                  Email
                  <input
                    type="email"
                    name="email"
                    placeholder="email"
                    value={this.state.email}
                    onChange={this.saveToState}
                  />
                </label>

                <label htmlFor="password">
                  Password
                  <input
                    type="password"
                    name="password"
                    placeholder="password"
                    value={this.state.password}
                    onChange={this.saveToState}
                  />
                </label>
                <button type="submit">Sign In</button>
              </fieldset>
            </Form>
          );
        }}
      </Mutation>
    );
  }
}
