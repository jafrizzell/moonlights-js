import {pageTheme, hoverText} from "./App.js"

var colorStyles = {
  placeholder: (defaultStyles, {data, isDisabled, isFocused, isSelected}) => ({
    ...defaultStyles,
    color: '#121212',
    '&:hover': {
      color: '#eaeef2'
    }
  }),
  control: (baseStyles, {data, isDisabled, isFocused, isSelected}) => ({
    ...baseStyles,
    width: 160,
    margin: 4,
    height: 40.2,
    padding: 0,
    border: 0,
    fontSize: '1rem',
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;",
    boxShadow: 'none',
    borderColor: '#eaeef2',
    borderWidth: '0px',
    '& input': {
      font: 'inherit',
    },
    '&:hover': {
      backgroundColor: pageTheme,
      transition: '250ms'
    }
  }),
  dropdownIndicator: base => ({
    ...base,
    "&:hover": {
      color: hoverText
    }
  }),
  option: (base, {data, isDisabled, isFocused, isSelected}) => ({
    ...base,
    backgroundColor: isFocused ? pageTheme : "",
    color: isFocused ? hoverText : "black",
  })
};

export default colorStyles;