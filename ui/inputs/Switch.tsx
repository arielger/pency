import React from "react";
import {Switch, SwitchProps} from "@chakra-ui/core";

interface Props extends Omit<SwitchProps, "onChange"> {
  checked?: boolean;
  onChange: (value: boolean) => void;
}

const SwitchInput: React.FC<Props> = ({checked, onChange, ...props}) => {
  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    onChange(event.target.checked);
  }

  return <Switch isChecked={checked} value={checked} onChange={handleChange} {...props} />;
};

export default SwitchInput;
