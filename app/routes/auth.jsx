import authStyles from "~/styles/auth.css";

export default function AuthPage() {
  return <h1>Authentication Page</h1>;
}

export function links() {
  return [{ rel: "stylesheet", href: authStyles }];
}
