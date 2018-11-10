import { Query } from "react-apollo";
import gql from "graphql-tag";
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
                    <th>{permission}</th>
                  ))}
                  <th>👇</th>
                </tr>
              </thead>
              <tbody>
                {data.users.map(user => {
                  return <User user={user} />;
                })}
              </tbody>
            </Table>
          </div>
        </div>
      );
    }}
  </Query>
);

class User extends React.Component {
  render() {
    const user = this.props.user;
    return (
      <tr>
        <td>{user.name}</td>
        <td>{user.email}</td>
        {possiblePermissions.map(permission => (
          <td>
            <label htmlFor={`${user.id}-permission-${permission}`}>
              <input
                type="checkbox"
                name={`${user.id}-permission-${permission}`}
              />
            </label>
          </td>
        ))}
        <td>
          <SickButton>Update</SickButton>
        </td>
      </tr>
    );
  }
}

export default Permissions;
