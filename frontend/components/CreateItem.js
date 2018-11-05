import React, { Component } from "react";
import { Mutation } from "react-apollo";
import Router from "next/router";
import gql from "graphql-tag";
import Form from "./styles/Form";
import Error from "./ErrorMessage";

export const CREATE_ITEM_MUTATION = gql`
  mutation CREATE_ITEM_MUTATION(
    $title: String!
    $description: String!
    $price: Int!
    $image: String
    $largeImage: String
  ) {
    createItem(
      title: $title
      description: $description
      price: $price
      image: $image
      largeImage: $largeImage
    ) {
      id
    }
  }
`;
export default class CreateItem extends Component {
  state = {
    title: "",
    description: "",
    image: "",
    largeImage: "",
    price: 0
  };

  handleChange = e => {
    const { name, value, type } = e.target;

    const val = type === "number" ? parseFloat(value) : value;

    this.setState({
      [name]: val
    });
  };
  render() {
    return (
      <Mutation mutation={CREATE_ITEM_MUTATION} variables={this.state}>
        {(createItem, { loading, error, called, data }) => {
          return (
            <Form
              onSubmit={async e => {
                e.preventDefault();

                const response = await createItem();
                console.log(response);
                Router.push({
                  pathname: "/item",
                  query: { id: response.data.createItem.id }
                });
              }}
            >
              <Error error={error} />
              <fieldset disabled={loading} aria-busy={loading}>
                <label htmlFor="title">Title</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  placeholder="Title"
                  required
                  value={this.state.title}
                  onChange={this.handleChange}
                />
                <label htmlFor="price">Price</label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  placeholder="Price"
                  required
                  value={this.state.price}
                  onChange={this.handleChange}
                />
                <label htmlFor="price">Description</label>
                <textarea
                  id="description"
                  name="description"
                  placeholder="Enter A Description"
                  required
                  value={this.state.description}
                  onChange={this.handleChange}
                />
                <button type="submit">Submit</button>
              </fieldset>
            </Form>
          );
        }}
      </Mutation>
    );
  }
}
