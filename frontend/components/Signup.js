import React, { Component } from "react";
import { Mutation } from "react-apollo";
import gql from "graphql-tag";
import Form from "./styles/Form";
import Error from "./ErrorMessage";

export default class Signup extends Component {
  state = {
    email: "",
    password: "",
    name: ""
  };

  saveToState = e => {
    const { name, value } = e.target;

    this.setState({
      [name]: value
    });
  };
  render() {
    return (
      <Form>
        <fieldset>
          <h2>Sign Up for an account </h2>
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
          <label htmlFor="name">
            Name
            <input
              type="text"
              name="name"
              placeholder="name"
              value={this.state.name}
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
          <button type="submit">Sign Up</button>
        </fieldset>
      </Form>
    );
  }
}
