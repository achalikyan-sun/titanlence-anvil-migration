import { Route, Routes } from "react-router-dom";
import { Page, Text } from "@servicetitan/anvil2";

// App shell. Screens are added as routes inside this shell.
function Home() {
  return (
    <Page>
      <Page.Header
        title="Analytics 3.0"
        description={<Text>Prototype shell. Add the first screen as a route.</Text>}
      />
      <Page.Content>
        <Text>Shell is running with real Anvil2 components.</Text>
      </Page.Content>
    </Page>
  );
}

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
    </Routes>
  );
}
