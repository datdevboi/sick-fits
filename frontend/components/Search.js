import React from "react";
import Downshift from "downshift";
import Router from "next/router";
import { ApolloConsumer } from "react-apollo";
import gql from "graphql-tag";
import debounce from "lodash.debounce";
import { DropDown, DropDownItem, SearchStyles } from "./styles/DropDown";

const SEARCH_ITEMS_QUERY = gql`
  query SEARCH_ITEMS_QUERY($searchTerm: String!) {
    items(
      where: {
        OR: [
          { title_contains: $searchTerm }
          { description_contains: $searchTerm }
        ]
      }
    ) {
      id
      image
      title
    }
  }
`;
class AutoComplete extends React.Component {
  state = {
    items: [],
    loading: false
  };
  onChange = debounce(async (e, client) => {
    this.setState({
      loading: true
    });

    const res = await client.query({
      query: SEARCH_ITEMS_QUERY,
      variables: {
        searchTerm: e.target.value
      }
    });

    this.setState({
      items: res.data.items,
      loading: false
    });
  }, 350);

  routeToItem = item => {
    Router.push({
      pathname: "/item",
      query: {
        id: item.id
      }
    });
  };
  render() {
    return (
      <SearchStyles>
        <Downshift
          onChange={this.routeToItem}
          itemToString={item => (item === null ? "" : item.title)}
        >
          {({
            getInputProps,
            getItemProps,
            isOpen,
            inputValue,
            highlightedIndex
          }) => (
            <div>
              <ApolloConsumer>
                {client => (
                  <input
                    {...getInputProps({
                      type: "search",
                      placeholder: "Seach for an item",
                      id: "search",
                      className: this.state.loading ? "loading" : "",
                      onChange: e => {
                        e.persist();
                        this.onChange(e, client);
                      }
                    })}
                  />
                )}
              </ApolloConsumer>

              {isOpen && (
                <DropDown>
                  {this.state.items.map((item, index) => (
                    <DropDownItem
                      highlighted={index === highlightedIndex}
                      {...getItemProps({ item })}
                      key={item.id}
                    >
                      <img width="50" src={item.image} alt={item.title} />
                      {item.title}
                    </DropDownItem>
                  ))}

                  {!this.state.items.length &&
                    !this.state.loading && (
                      <DropDownItem>
                        Nothing Found for {inputValue}
                      </DropDownItem>
                    )}
                </DropDown>
              )}
            </div>
          )}
        </Downshift>
      </SearchStyles>
    );
  }
}

export default AutoComplete;
