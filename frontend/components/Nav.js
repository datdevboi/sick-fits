import Link from "next/link";
import NavStyles from "./styles/NavStyles";
import User from "./User";
import Error from "./ErrorMessage";

const Nav = () => (
  <NavStyles>
    <User>
      {({ data, error, loading }) => {
        if (loading) return <p>Loading...</p>;
        if (error) return <Error error={error} />;
        if (!data.me) return null;
        return <p>{data.me.name}</p>;
      }}
    </User>
    <Link href="/items">
      <a>Shop</a>
    </Link>
    <Link href="/sell">
      <a>Sell</a>
    </Link>
    <Link href="/signup">
      <a>Signup</a>
    </Link>
    <Link href="/orders">
      <a>Orders</a>
    </Link>
    <Link href="/me">
      <a>Account</a>
    </Link>
  </NavStyles>
);

export default Nav;
