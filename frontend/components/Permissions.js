import { Query, Mutation } from "react-apollo";
import gql from "graphql-tag";
import PropTypes from "prop-types";
import Error from "../components/ErrorMessage";
import Table from "../components/styles/Table";
import SickButton from "../components/styles/SickButton";
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

const possiblePermissions = [
  "ADMIN",
  "USER",
  "ITEMCREATE",
  "ITEMUPDATE",
  "ITEMDELETE",
  "PERMISSIONUPDATE"
];

const Permissions = props => (
  <Query query={ALL_USERS_QUERY}>
    {({ data, error, loading }) => {
      return (
        <div>
          <Error error={error} />

          <div>
            <h2>Mange Permissions</h2>
            <Table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  {possiblePermissions.map(permission => (
                    <th key={permission}>{permission}</th>
                  ))}
                  <th>👇</th>
                </tr>
              </thead>
              <tbody>
                {data.users.map(user => {
                  return <UserPermissions key={user.id} user={user} />;
                })}
              </tbody>
            </Table>
          </div>
        </div>
      );
    }}
  </Query>
);

const UPDATE_PERMISSIONS_MUTATION = gql`
  mutation UPDATE_PERMISSIONS_MUTATION(
    $userId: String!
    $permissions: [Permission!]
  ) {
    updatePermissions(userId: $userId, permissions: $permissions) {
      id
      name
      email
      permissions
    }
  }
`;

class UserPermissions extends React.Component {
  static propTypes = {
    user: PropTypes.shape({
      name: PropTypes.string,
      email: PropTypes.string,
      id: PropTypes.string,
      permissions: PropTypes.array
    }).isRequired
  };

  state = {
    permissions: this.props.user.permissions
  };

  handlePermissionChange = e => {
    const checkbox = e.target;
    let updatedPermissions = [...this.state.permissions];

    if (checkbox.checked) {
      updatedPermissions.push(checkbox.value);
    } else {
      updatedPermissions = updatedPermissions.filter(p => p !== checkbox.value);
    }
    this.setState({ permissions: updatedPermissions });
  };
  render() {
    const user = this.props.user;
    return (
      <Mutation
        mutation={UPDATE_PERMISSIONS_MUTATION}
        variables={{
          userId: this.props.user.id,
          permissions: this.state.permissions
        }}
      >
        {(updatePermissions, { loading, error }) => {
          if (error)
            return (
              <tr>
                <td colspan="8">
                  <Error error={error} />
                </td>
              </tr>
            );
          return (
            <tr>
              <td>{user.name}</td>
              <td>{user.email}</td>
              {possiblePermissions.map(permission => (
                <td key={`${user.id}-permission-${permission}`}>
                  <label htmlFor={`${user.id}-permission-${permission}`}>
                    <input
                      type="checkbox"
                      checked={this.state.permissions.includes(permission)}
                      id={`${user.id}-permission-${permission}`}
                      value={permission}
                      onChange={this.handlePermissionChange}
                    />
                  </label>
                </td>
              ))}
              <td>
                <SickButton
                  type="button"
                  disabled={loading}
                  onClick={updatePermissions}
                >
                  Updat
                  {loading ? "ing" : "e"}
                </SickButton>
              </td>
            </tr>
          );
        }}
      </Mutation>
    );
  }
}

export default Permissions;
