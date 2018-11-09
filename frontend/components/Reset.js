import React, { Component } from "react";
import { Mutation } from "react-apollo";
import gql from "graphql-tag";
import Form from "./styles/Form";
import Error from "./ErrorMessage";
import { CURRENT_USER_QUERY } from "./User";

const RESET_PASSWORD_MUTATION = gql`
  mutation RESET_PASSWORD_MUTATION(
    $resetToken: String!
    $password: String!
    $confirmPassword: String!
  ) {
    resetPassword(
      resetToken: $resetToken
      password: $password
      confirmPassword: $confirmPassword
    ) {
      id
      name
    }
  }
`;

export default class Reset extends Component {
  state = {
    password: "",
    confirmPassword: "",
    resetToken: this.props.resetToken
  };

  saveToState = e => {
    const { name, value } = e.target;

    this.setState({
      [name]: value
    });
  };
  render() {
    return (
      <Mutation mutation={RESET_PASSWORD_MUTATION} variables={this.state}>
        {(resetPassword, { error, loading, called }) => {
          return (
            <Form
              method="post"
              onSubmit={e => {
                e.preventDefault();
                resetPassword();
              }}
            >
              <fieldset disabled={loading} aria-busy={loading}>
                <h2>Reset Password </h2>
                <Error error={error} />
                {!error &&
                  !loading &&
                  called && <p>Success! Password has been changed</p>}
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
                <label htmlFor="confirmPassword">
                  Confirm Password
                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    value={this.state.confirmPassword}
                    onChange={this.saveToState}
                  />
                </label>

                <button type="submit">Reset</button>
              </fieldset>
            </Form>
          );
        }}
      </Mutation>
    );
  }
}
