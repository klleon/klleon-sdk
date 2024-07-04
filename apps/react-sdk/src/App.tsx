import Button from "./components/Button";
import useCounter from "./hooks/useCounter";

function App() {
  const { count, increment, decrement, reset } = useCounter();
  return (
    <div>
      <span>{count}</span>
      <Button onClick={increment}>
        <span>+</span>
      </Button>
      <Button onClick={decrement}>
        <span>-</span>
      </Button>
      <Button onClick={reset}>
        <span>reset</span>
      </Button>
    </div>
  );
}

export default App;
