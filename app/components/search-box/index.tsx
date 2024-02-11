import styles from "./index.css";
import {
  faCircleQuestion,
  faMagnifyingGlass,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { LinksFunction } from "@remix-run/node";
import { Form, Link, useSubmit } from "@remix-run/react";
import { useEffect, useRef, useState } from "react";
import Select from "react-select";

export const links: LinksFunction = () => [{ rel: "stylesheet", href: styles }];

interface TypesOption {
  value: string;
  label: string;
}

const getTypesOptions = (types: TypesOption[], values: string[]) =>
  values.map((v) => {
    const type = types.find(({ value }) => value === v);
    if (type === undefined) {
      throw Error(`value ${v} is not found on typesOption`);
    }
    return type;
  });

interface SearchBoxProps {
  order: string;
  types: TypesOption[];
  typeInputName: string;
  defaultTypes: string[];
  defaultAdvanced: boolean;
  defaultQuery: string;
  action: string;
}

export function SearchBox(props: SearchBoxProps) {
  const submit = useSubmit();
  const formRef = useRef<HTMLFormElement>(null);

  const [advanced, setAdvanced] = useState(props.defaultAdvanced);
  const [query, setQuery] = useState(props.defaultQuery);
  const [types, setTypes] = useState(props.defaultTypes);

  useEffect(() => setQuery(props.defaultQuery), [props.defaultQuery]);
  useEffect(() => setAdvanced(props.defaultAdvanced), [props.defaultAdvanced]);
  useEffect(() => {
    setTypes(props.defaultTypes);
    // array をちゃんと比較してレンダリング回数を抑えるために JSON にする
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(props.defaultTypes)]);

  // _root.tsx でエラーハンドリングがなされると（例: 404）emotion が追加した style tag が外れて悲惨な見た目になるが、
  // そう起きないと信じて無視する
  // https://github.com/remix-run/remix/issues/1136
  return (
    <div className="SearchBox row">
      <div className="col-md-8 offset-md-2 mt-4 mt-sm-5 mb-3 mb-sm-4">
        <Form action={props.action} preventScrollReset ref={formRef}>
          <div className="input-group input-group-lg">
            <input
              className="form-control"
              autoFocus={true}
              type="text"
              name="query"
              placeholder={advanced ? "Input raw query string..." : "Search"}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <input type="hidden" name="order" value={props.order} />
            <button className="btn btn-outline-secondary" type="submit">
              <FontAwesomeIcon icon={faMagnifyingGlass} />
            </button>
          </div>
          <div className="row">
            <div className="col-auto mt-3 ms-md-1 align-items-center d-flex">
              <div className="form-switch form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  role="switch"
                  name="advanced"
                  id="searchBoxCheckBox"
                  checked={advanced}
                  onChange={(e) => setAdvanced(e.target.checked)}
                />
                <label className="form-check-label" htmlFor="searchBoxCheckBox">
                  Advanced
                  <span className="d-none d-sm-inline-block">&nbsp;mode</span>
                  &ensp;
                  <Link to="/help" id="questionMarkLink" target="_blank">
                    <FontAwesomeIcon
                      icon={faCircleQuestion}
                      id="questionMark"
                      size="sm"
                    />
                  </Link>
                </label>
              </div>
            </div>
            <div className="col-auto mt-3 ms-auto me-md-1 text-end ps-0">
              <Select
                options={props.types}
                isMulti={true}
                isClearable={false}
                closeMenuOnSelect={false}
                value={getTypesOptions(props.types, types)}
                name={props.typeInputName}
                onChange={(e) => {
                  // Select の中で値が変わっても、form の onChange は発火しない + submit すると古い値が使われる
                  // ので、現在のフォームの値を持ってきて上書きした上で submit する
                  let newTypes = e!.map((option) => option.value);
                  if (newTypes.length === 0) {
                    newTypes = [props.types[0].value];
                  }
                  const data = new FormData(formRef.current!);
                  data.delete(props.typeInputName);
                  newTypes.forEach((t) => data.append(props.typeInputName, t));
                  submit(data);
                  setTypes(newTypes); // UI 上ですぐに変えるため
                }}
                components={{ IndicatorSeparator: () => null }}
                isSearchable={false}
              />
            </div>
          </div>
        </Form>
      </div>
    </div>
  );
}
