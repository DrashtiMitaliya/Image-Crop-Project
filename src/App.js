
import './App.css';
import Image from './Components/Image';
import { ChakraProvider } from '@chakra-ui/react'
function App() {
  return (
    <div className="App ">
      <ChakraProvider>
      <Image/>
      </ChakraProvider>
    </div>
  );
}

export default App;
