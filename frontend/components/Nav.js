import Link from "next/link";
import NavStyles from "./styles/NavStyles";
import User from "./User";
import Error from "./ErrorMessage";

const Nav = () => (
  <User>
    {({ data: { me }, error, loading }) => (
      <NavStyles>
        <Link href="/items">
          <a>Shop</a>
        </Link>

        {me && (
          <>
            <Link href="/sell">
              <a>Sell</a>
            </Link>
            <Link href="/orders">
              <a>Orders</a>
            </Link>
            <Link href="/me">
              <a>Account</a>
            </Link>
          </>
        )}

        {!me && (
          <Link href="/signup">
            <a>Sign In</a>
          </Link>
        )}
      </NavStyles>
    )}
  </User>
);

export default Nav;
