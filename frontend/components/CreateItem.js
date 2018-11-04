import React, { Component } from "react";
import { Mutation } from "react-apollo";
import gql from "graphql-tag";
import Form from "./styles/Form";

export const CREATE_ITEM_MUTATION = `
    mutation CREATE_ITEM_MUTATION($title: String!
            $description: String!
            $price: Int!
            image: String
            largeImage: String
        ) {
        createItem(title: $title
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
      <Form
        onSubmit={e => {
          e.preventDefault();

          console.log(this.state);
        }}
      >
        <h2>Sell an Item</h2>
        <fieldset>
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
  }
}
