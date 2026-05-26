import { Button, Input } from "@base-ui/react";
import "./index.css";
import {
  RiArrowGoBackLine,
  RiDeleteBin2Line,
  RiShoppingCart2Line,
} from "@remixicon/react";
import { useReducer, useState, useEffect } from "react";
import { toast } from "sonner";

type Item = {
  id: string;
  product: string;
  amount: number;
  checked: boolean;
};

type ShopAction =
  | { type: "add"; payload: Item }
  | { type: "check"; payload: string }
  | { type: "delete"; payload: string };

const ACTION = {
  ADD: "add",
  CHECK: "check",
  DELETE: "delete",
} as const;

const STORAGE_KEY = "shoppinglist";

export default function App() {
  const [listItem, setListItem] = useState<Item>({
    id: crypto.randomUUID(),
    product: "",
    amount: 1,
    checked: false,
  });

  const shopReducer = (items: Item[], action: ShopAction): Item[] => {
    switch (action.type) {
      case ACTION.ADD:
        return [...items, action.payload];
      case ACTION.CHECK:
        return items.map((item) =>
          item.id === action.payload
            ? { ...item, checked: !item.checked }
            : item,
        );
      case ACTION.DELETE:
        return items.filter((item) => item.id !== action.payload);
      default:
        return items;
    }
  };

  const [items, dispatch] = useReducer(shopReducer, [], () => {
    const savedItems = localStorage.getItem(STORAGE_KEY);
    return savedItems ? JSON.parse(savedItems) : [];
  });

  const sortedItems = [...items].sort(
    (a, b) => Number(a.checked) - Number(b.checked),
  );

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    const name = e.target.name;
    const value = e.target.value.trim();

    setListItem((prev) => {
      return {
        ...prev,
        [name]: value,
      };
    });
  }

  function handleSubmit() {
    const exists = items.find(
      (item) => item.product.toLowerCase() === listItem.product.toLowerCase(),
    );
    if (exists) {
      toast.warning("Produkt ist bereits vorhanden!");
      setListItem({
        id: crypto.randomUUID(),
        product: "",
        amount: 1,
        checked: false,
      });
      return;
    } else {
      dispatch({ type: ACTION.ADD, payload: listItem });
      setListItem({
        id: crypto.randomUUID(),
        product: "",
        amount: 1,
        checked: false,
      });
      toast.success("Produkt wurde zur Liste hinzugefügt.");
    }
  }

  function handleCheck(itemId: string) {
    dispatch({ type: ACTION.CHECK, payload: itemId });
  }

  function handleDelete(itemId: string) {
    dispatch({ type: ACTION.DELETE, payload: itemId });
    toast.info("Produkt wurde aus der Liste gelöscht.");
  }

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  return (
    <div className="flex h-dvh bg-neutral-500 p-16">
      <div className="mx-auto flex w-xl flex-col items-center rounded-lg bg-neutral-200/75 p-8 shadow-2xl">
        <h1 className="text-bold my-4 text-4xl">shoppinglist.</h1>
        <div className="flex w-full">
          <Input
            className="w-full rounded-tl-lg bg-neutral-200 p-2"
            placeholder="Produkt eigeben..."
            name="product"
            value={listItem.product}
            onChange={handleInput}
          />
          <Input
            className="w-20 rounded-tr-lg bg-neutral-200 p-2"
            type="number"
            placeholder="Menge"
            name="amount"
            min={1}
            value={listItem.amount}
            onChange={handleInput}
          />
        </div>
        <Button
          onClick={handleSubmit}
          disabled={listItem.product.length < 1}
          className="mt-1 mb-3 w-full rounded-b-lg bg-neutral-500/75 px-4 py-2 shadow-lg transition duration-300 ease-in-out hover:enabled:bg-emerald-600/30"
        >
          Produkt hinzufügen
        </Button>
        <div className="container scrollbar-thin overflow-auto scroll-smooth pb-8">
          {items.length === 0 ? (
            <p className="m-4">...keine Einträge!</p>
          ) : (
            sortedItems.map((item) => (
              <div
                className="mt-5 flex items-center justify-between rounded-lg border border-neutral-400 bg-neutral-200 p-2 shadow-lg"
                key={item.id}
              >
                <div>
                  <h2
                    className={
                      "text-lg font-semibold" +
                      (item.checked
                        ? "text-neutral-500 line-through opacity-50"
                        : "")
                    }
                  >
                    {item.product}
                  </h2>
                  <p
                    className={
                      "text-sm text-neutral-600" +
                      (item.checked
                        ? "text-neutral-500 line-through opacity-50"
                        : "")
                    }
                  >
                    Anzahl: {item.amount}
                  </p>
                </div>
                <div>
                  {!item.checked ? (
                    <Button
                      onClick={() => handleCheck(item.id)}
                      className="flex gap-2 rounded-md bg-emerald-600/70 px-3 py-1 transition duration-300 ease-in-out hover:bg-emerald-500"
                    >
                      <RiShoppingCart2Line />
                      check
                    </Button>
                  ) : (
                    <div className="flex gap-4">
                      <Button onClick={() => handleCheck(item.id)}>
                        <RiArrowGoBackLine />
                      </Button>
                      <Button
                        onClick={() => handleDelete(item.id)}
                        className="flex gap-2 rounded-md bg-red-500/75 px-3 py-1 transition duration-300 ease-in-out hover:bg-red-600/75"
                      >
                        <RiDeleteBin2Line />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
