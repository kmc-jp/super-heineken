import { useEffect, useState } from "react";
import Select from "react-select";

const sortOrderOptions = [
  { value: "s", label: "Score" },
  { value: "m", label: "Modified" },
  { value: "ta", label: "Title asc" },
  { value: "td", label: "Title desc" },
];

const getOrderOption = (val: string) => {
  const option = sortOrderOptions.find(({ value }) => value === val);
  if (option === undefined) {
    throw Error(`value ${val} is not found on sortOrderOptions`);
  }
  return option;
};

interface SortButtonProps {
  defaultOrder: string;
  onNewOrder: (order: string) => void;
}

export default function SortButton(props: SortButtonProps) {
  const [order, setOrder] = useState(props.defaultOrder);

  useEffect(() => setOrder(props.defaultOrder), [props.defaultOrder]);

  // _root.tsx でエラーハンドリングがなされると（例: 404）emotion が追加した style tag が外れて悲惨な見た目になるが、
  // そう起きないと信じて無視する
  // https://github.com/remix-run/remix/issues/1136
  return (
    <>
      <div className="col-auto ms-auto text-end ps-0">
        <Select
          options={sortOrderOptions}
          value={getOrderOption(order)}
          onChange={(e) => {
            setOrder(order);
            props.onNewOrder(e!.value);
          }}
          components={{ IndicatorSeparator: () => null }}
          isSearchable={false}
        />
      </div>

      {/* Dummy col for end offset */}
      <div className="col-md-1" />
    </>
  );
}
