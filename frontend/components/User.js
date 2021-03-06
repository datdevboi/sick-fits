import { Query } from "react-apollo";
import gql from "graphql-tag";
import PropTypes from "prop-types";

export const CURRENT_USER_QUERY = gql`
  query CURRENT_USER_QUERY {
    me {
      id
      name
      email
      permissions
      cart {
        id
        quantity
        item {
          title
          price
          description
          id
          image
        }
      }
    }
  }
`;

const User = props => (
  <Query {...props} query={CURRENT_USER_QUERY}>
    {payload => {
      return props.children(payload);
    }}
  </Query>
);

User.propTypes = {
  children: PropTypes.func.isRequired
};

export default User;
