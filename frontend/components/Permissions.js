import { Query } from "react-apollo";
import gql from "graphql-tag";
import Error from "../components/ErrorMessage";

const ALL_USERS_QUERY = gql`
  query ALL_USERS_QUERY {
    users {
      id
      name
      email
      permissions
    }
  }
`;

const Permissions = props => (
  <Query query={ALL_USERS_QUERY}>
    {({ data, error, loading }) => {
      return (
        <div>
          <Error error={error} />
          <p>Hey from permissions</p>
        </div>
      );
    }}
  </Query>
);

export default Permissions;
