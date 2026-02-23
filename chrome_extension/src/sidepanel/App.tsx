import { useEffect, useState } from "react";

const App = () => {
  const [searchInput, setSearchInput] = useState<string | null>(null);

  useEffect(() => {
    const loadUserInput = async () => {
      try {
        const result = await chrome.storage.local.get(["input"]);
        const inputValue = result.input as string | undefined;
        if (inputValue) {
          setSearchInput(inputValue);
        }
      } catch (error) {
        console.error("Error loading user input:", error);
      }
    };

    loadUserInput();
  }, []);

  return <div>{searchInput}</div>;
};

export default App;
