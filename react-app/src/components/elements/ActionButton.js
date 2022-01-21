import React from "react";
import { Button, createTheme, ThemeProvider } from "@mui/material";
import { green } from "@mui/material/colors";

const theme = createTheme(theme => ({
	components: {
		MuiButton: {
			styleOverrides: {
				root: {
					minWidth: 0,
					margin: theme.spacing(.5)
				},
				secondary: {
					backgroundColor: theme.palette.secondary.light,
					'& .MuiButton-label': {
						color: theme.palette.secondary.main
					}
				},
				primary: {
					backgroundColor: theme.palette.primary.light,
					'& .MuiButton-label': {
						color: theme.palette.primary.main
					}
				}
			}
		},
		secondary: {
			main: green[500],
		}
	}
}));

export default function ActionButton({ color, children, onClick }) {
	return (
		<ThemeProvider theme={theme}>
			<Button onClick={onClick} color={color}>{children}</Button>
		</ThemeProvider>
	)
}