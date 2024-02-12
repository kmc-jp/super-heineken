import { useEffect, useId, useState } from "react";
import Select from "react-select";

interface SortOrderOption {
  value: string;
  label: string;
}

const getOrderOption = (options: SortOrderOption[], val: string) => {
  const option = options.find(({ value }) => value === val);
  if (option === undefined) {
    throw Error(`value ${val} is not found on sortOrderOptions`);
  }
  return option;
};

interface SortButtonProps {
  options: SortOrderOption[];
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
          instanceId={
            // https://github.com/JedWatson/react-select/issues/5459
            // https://stackoverflow.com/a/73117797/4205654
            // Still has an issue: https://github.com/JedWatson/react-select/issues/3590
            useId()
          }
          options={props.options}
          value={getOrderOption(props.options, order)}
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
