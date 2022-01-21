import React from "react";
import {
	createTheme,
	Dialog,
	DialogContent,
	DialogContentText,
	DialogTitle,
	ThemeProvider,
	Typography
} from "@mui/material";
import { Close } from "@mui/icons-material";
import ActionButton from "./elements/ActionButton";

const theme = createTheme({
	typography: {
		fontFamily: 'Varela Round',
	},
	components: {
		MuiDialog: {
			styleOverrides: {
				paper: {
					backgroundColor: "rgba( 255,255,255,0.99)",
					borderRadius: "5px",
					padding: '1rem',
				}
			}
		}
	}
});

const Popup = ({ title, context, size, children, open, setOpen }) => {
	return (
		<ThemeProvider theme={theme}>
			<Dialog open={open} maxWidth={size ?? 'md'} className={'shadow-lg'}>
				<DialogTitle className={'d-flex justify-content-between align-items-center'}>
					<Typography variant={'h6'} component={'div'} className={'fw-bold'}>
						{title}
					</Typography>
					<ActionButton color={'secondary'} onClick={() => setOpen(false)}><Close/></ActionButton>
				</DialogTitle>
				<DialogContent dividers style={{ paddingLeft: '3rem', paddingRight: '3rem' }}>
					{context && <DialogContentText>{context}</DialogContentText>}

					{children}
				</DialogContent>
			</Dialog>
		</ThemeProvider>
	)
}

export default Popup