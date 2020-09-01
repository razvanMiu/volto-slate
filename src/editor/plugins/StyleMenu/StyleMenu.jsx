import React from 'react';
import { useSlate } from 'slate-react';
import Select, { components } from 'react-select';
import { useIntl, defineMessages } from 'react-intl';
import { settings } from '~/config';
import {
  toggleBlockStyle,
  isBlockStyleActive,
  toggleInlineStyle,
  isInlineStyleActive,
} from '../../../utils/blocks';

const messages = defineMessages({
  allStylesApplied: {
    id: 'All Styles Applied',
    defaultMessage: 'All Styles Applied',
  },
});

const brownColor = '#826A6A';

const selectStyles = {
  valueContainer: (provided, state) => {
    return {
      ...provided,
      paddingLeft: '0px',
      paddingTop: '0px',
      paddingRight: '0px',
      paddingDown: '0px',
      fontSize: '1rem',
      position: 'static',
    };
  },
  input: (provided, state) => {
    return {
      ...provided,
      display: 'none',
    };
  },
  dropdownIndicator: (provided, state) => {
    return {
      ...provided,
      paddingLeft: '0px',
      paddingTop: '0px',
      paddingRight: '0px',
      paddingDown: '0px',
    };
  },
  indicatorsContainer: (provided, state) => {
    return {
      ...provided,
      padding: '0px',
      paddingLeft: '0px',
      paddingTop: '0px',
      paddingRight: '0px',
      paddingDown: '0px',
    };
  },
  control: (provided, state) => {
    return {
      ...provided,
      minHeight: 'auto',
      borderWidth: 'unset',
      cursor: 'pointer',
      // borderColor: state.isFocused ? brownColor : '#f3f3f3',
      // boxShadow: 'unset',
    };
  },
  container: (provided, state) => {
    return {
      ...provided,
      marginLeft: '3px',
      width: '15rem',
      // backgroundColor: state.isFocused ? '#f3f3f3' : 'unset',
    };
  },
  singleValue: (provided, state) => {
    return {
      paddingLeft: '3px',
      fontSize: '1rem',
      // color: brownColor,
    };
  },
  option: (provided, state) => {
    return {
      ...provided,
      fontSize: '1rem',
      cursor: 'pointer',
      // color: state.isSelected ? 'white' : brownColor,
    };
  },
  noOptionsMessage: (provided, state) => {
    return {
      ...provided,
      fontSize: '1rem',
    };
  },
  group: (provided, state) => {
    return {
      ...provided,
      fontSize: '1rem',
    };
  },
};

const StylingsButton = (props) => {
  const editor = useSlate();
  const intl = useIntl();

  // Converting the settings to a format that is required by react-select.
  let opts = settings.slate.styleMenuDefinitions.map((def) => {
    return { value: def.cssClass, label: def.label, isBlock: def.isBlock };
  });

  opts = [
    {
      label: 'For blocks',
      options: opts.filter((x) => x.isBlock),
    },
    {
      label: 'For inlines',
      options: opts.filter((x) => !x.isBlock),
    },
  ];

  // Calculating the initial selection.
  const toSelect = [];
  for (const val of opts) {
    if (!val.isBlock) continue;
    const ia = isBlockStyleActive(editor, val.value);
    if (ia) {
      toSelect.push(val);
      break;
    }
  }
  for (const val of opts) {
    if (val.isBlock) continue;
    toSelect.push(val);
  }

  const [selectedStyle, setSelectedStyle] = React.useState(toSelect);

  return (
    <div>
      <Select
        options={opts}
        value={selectedStyle}
        isMulti={true}
        styles={selectStyles}
        placeholder="No Style"
        hideSelectedOptions={false}
        noOptionsMessage={({ inputValue }) =>
          intl.formatMessage(messages.allStylesApplied)
        }
        components={{
          // Shows the most relevant part of the selection as a simple string of text.
          MultiValue: (props) => {
            const val = props.getValue();

            if (props.index === 0) {
              const cond = val.length > 1;
              const lbl = val[props.index].label + '...';
              const lbl2 = val[props.index].label;
              return <>{cond ? lbl : lbl2}</>;
            }

            return '';
          },
        }}
        theme={(theme) => {
          return {
            ...theme,
            colors: {
              ...theme.colors,
              primary: '#826A6AFF', // 100% opaque @brown
              primary75: '#826A6Abf', // 75% opaque @brown
              primary50: '#826A6A7f', // 50% opaque @brown
              primary25: '#826A6A40', // 25% opaque @brown
            },
          };
        }}
        onChange={(selItem, meta) => {
          console.log('meta', meta);

          if (selItem.length === 0) {
            setSelectedStyle(selItem);
            toggleBlockStyle(editor, undefined);
            toggleInlineStyle(editor, undefined);
            return;
          }

          if (meta.action === 'select-option' && meta.option.isBlock) {
            setSelectedStyle([meta.option]);
            toggleBlockStyle(editor, meta.option.value);
          } else {
            // TODO: complete this algorithm
            if (meta.action === 'select-option' && !meta.option.isBlock) {
              setSelectedStyle([meta.option]);
              toggleInlineStyle(editor, meta.option.value);
            }
          }
        }}
      ></Select>
    </div>
  );
};

export default StylingsButton;
