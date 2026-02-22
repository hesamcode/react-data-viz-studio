import Select from "../../components/ui/Select";
import { getDatasetOptions } from "./index";

export default function DatasetSelector({ value, onChange }) {
  return (
    <Select
      id="dataset"
      label="Dataset"
      value={value}
      onChange={onChange}
      options={getDatasetOptions()}
      placeholder="Choose dataset"
    />
  );
}
